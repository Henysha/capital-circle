package com.capitalcircle;

import static org.hamcrest.Matchers.comparesEqualTo;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(
    statements = {
        "DELETE FROM ledger_entries",
        "DELETE FROM funding_requests",
        "DELETE FROM contributions",
        "DELETE FROM group_members",
        "DELETE FROM capital_groups",
        "DELETE FROM app_users"
    },
    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD
)
class CapitalCircleApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerAndLoginWorks() throws Exception {
        UserSession registered = register("Amina Carter", "amina@example.com", "password123");

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", bearer(registered.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("amina@example.com"))
            .andExpect(jsonPath("$.fullName").value("Amina Carter"));

        login("amina@example.com", "password123")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.email").value("amina@example.com"));
    }

    @Test
    void creatingGroupMakesCreatorAdmin() throws Exception {
        UserSession creator = register("Group Admin", "admin@example.com", "password123");

        JsonNode group = createGroup(creator.token(), "Founders Circle");

        mockMvc.perform(get("/api/groups/{id}", group.get("id").asText())
                .header("Authorization", bearer(creator.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentUserRole").value("ADMIN"))
            .andExpect(jsonPath("$.createdByUserId").value(creator.userId()));
    }

    @Test
    void userCannotJoinSameGroupTwice() throws Exception {
        UserSession admin = register("Admin User", "admin@example.com", "password123");
        UserSession member = register("Member User", "member@example.com", "password123");
        JsonNode group = createGroup(admin.token(), "Savings Circle");
        String groupId = group.get("id").asText();

        joinGroup(member.token(), groupId)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.currentUserRole").value("MEMBER"));

        joinGroup(member.token(), groupId)
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("You are already a member of this group"));
    }

    @Test
    void creatingContributionCreatesCreditLedgerEntry() throws Exception {
        UserSession admin = register("Ledger Admin", "admin@example.com", "password123");
        String groupId = createGroup(admin.token(), "Ledger Circle").get("id").asText();

        createContribution(admin.token(), groupId, "125.50")
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.amount", comparesEqualTo(125.50)));

        mockMvc.perform(get("/api/groups/{groupId}/ledger", groupId)
                .header("Authorization", bearer(admin.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].type").value("CREDIT"))
            .andExpect(jsonPath("$[0].amount", comparesEqualTo(125.50)))
            .andExpect(jsonPath("$[0].contributionId").isNotEmpty());
    }

    @Test
    void groupBalanceEqualsCreditsMinusDebits() throws Exception {
        UserSession admin = register("Balance Admin", "admin@example.com", "password123");
        String groupId = createGroup(admin.token(), "Balance Circle").get("id").asText();

        createContribution(admin.token(), groupId, "300.00").andExpect(status().isOk());
        createContribution(admin.token(), groupId, "100.00").andExpect(status().isOk());
        String requestId = createFundingRequest(admin.token(), groupId, "Member grant", "125.00")
            .get("id")
            .asText();
        approveFundingRequest(admin.token(), requestId).andExpect(status().isOk());

        mockMvc.perform(get("/api/groups/{groupId}/balance", groupId)
                .header("Authorization", bearer(admin.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.balance", comparesEqualTo(275.00)));
    }

    @Test
    void fundingRequestStartsPending() throws Exception {
        UserSession admin = register("Funding Admin", "admin@example.com", "password123");
        String groupId = createGroup(admin.token(), "Funding Circle").get("id").asText();

        JsonNode fundingRequest = createFundingRequest(admin.token(), groupId, "Equipment", "75.00");

        assertJsonValue(fundingRequest, "status", "PENDING");
    }

    @Test
    void onlyAdminCanApproveFundingRequests() throws Exception {
        UserSession admin = register("Admin User", "admin@example.com", "password123");
        UserSession member = register("Member User", "member@example.com", "password123");
        String groupId = createGroup(admin.token(), "Approval Circle").get("id").asText();
        joinGroup(member.token(), groupId).andExpect(status().isOk());
        createContribution(admin.token(), groupId, "200.00").andExpect(status().isOk());
        String requestId = createFundingRequest(member.token(), groupId, "Laptop fund", "100.00")
            .get("id")
            .asText();

        approveFundingRequest(member.token(), requestId)
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("Only group admins can perform this action"));

        approveFundingRequest(admin.token(), requestId)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void approvingFundingRequestCreatesDebitLedgerEntry() throws Exception {
        UserSession admin = register("Debit Admin", "admin@example.com", "password123");
        String groupId = createGroup(admin.token(), "Debit Circle").get("id").asText();
        createContribution(admin.token(), groupId, "250.00").andExpect(status().isOk());
        String requestId = createFundingRequest(admin.token(), groupId, "Emergency payout", "80.00")
            .get("id")
            .asText();

        approveFundingRequest(admin.token(), requestId).andExpect(status().isOk());

        mockMvc.perform(get("/api/groups/{groupId}/ledger", groupId)
                .header("Authorization", bearer(admin.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[?(@.type == 'DEBIT')]", hasSize(1)))
            .andExpect(jsonPath("$[?(@.type == 'DEBIT')].amount", contains(comparesEqualTo(80.00))))
            .andExpect(jsonPath("$[?(@.type == 'DEBIT')].fundingRequestId", contains(requestId)));
    }

    @Test
    void rejectingFundingRequestDoesNotCreateLedgerEntry() throws Exception {
        UserSession admin = register("Reject Admin", "admin@example.com", "password123");
        String groupId = createGroup(admin.token(), "Reject Circle").get("id").asText();
        createContribution(admin.token(), groupId, "250.00").andExpect(status().isOk());
        String requestId = createFundingRequest(admin.token(), groupId, "Rejected payout", "80.00")
            .get("id")
            .asText();

        rejectFundingRequest(admin.token(), requestId)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("REJECTED"));

        mockMvc.perform(get("/api/groups/{groupId}/ledger", groupId)
                .header("Authorization", bearer(admin.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].type").value("CREDIT"));
    }

    @Test
    void approvingFundingRequestIsBlockedWhenBalanceIsInsufficient() throws Exception {
        UserSession admin = register("Insufficient Admin", "admin@example.com", "password123");
        String groupId = createGroup(admin.token(), "Insufficient Circle").get("id").asText();
        createContribution(admin.token(), groupId, "25.00").andExpect(status().isOk());
        String requestId = createFundingRequest(admin.token(), groupId, "Large payout", "100.00")
            .get("id")
            .asText();

        approveFundingRequest(admin.token(), requestId)
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Group balance is not sufficient to approve this request"));

        mockMvc.perform(get("/api/groups/{groupId}/ledger", groupId)
                .header("Authorization", bearer(admin.token())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].type").value("CREDIT"));
    }

    private UserSession register(String fullName, String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "fullName", fullName,
                    "email", email,
                    "password", password
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andReturn();

        JsonNode body = readBody(result);
        return new UserSession(
            body.get("token").asText(),
            body.get("user").get("id").asText()
        );
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(json(Map.of(
                "email", email,
                "password", password
            ))));
    }

    private JsonNode createGroup(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/groups")
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "name", name,
                    "description", "Portfolio test group",
                    "contributionGoal", new BigDecimal("1000.00")
                ))))
            .andExpect(status().isOk())
            .andReturn();
        return readBody(result);
    }

    private ResultActions joinGroup(String token, String groupId) throws Exception {
        return mockMvc.perform(post("/api/groups/{id}/join", UUID.fromString(groupId))
            .header("Authorization", bearer(token)));
    }

    private ResultActions createContribution(String token, String groupId, String amount) throws Exception {
        return mockMvc.perform(post("/api/groups/{groupId}/contributions", UUID.fromString(groupId))
            .header("Authorization", bearer(token))
            .contentType(MediaType.APPLICATION_JSON)
            .content(json(Map.of(
                "amount", new BigDecimal(amount),
                "note", "Test contribution"
            ))));
    }

    private JsonNode createFundingRequest(String token, String groupId, String title, String amount) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/groups/{groupId}/funding-requests", UUID.fromString(groupId))
                .header("Authorization", bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                    "title", title,
                    "description", "Test funding request",
                    "amount", new BigDecimal(amount)
                ))))
            .andExpect(status().isOk())
            .andReturn();
        return readBody(result);
    }

    private ResultActions approveFundingRequest(String token, String requestId) throws Exception {
        return mockMvc.perform(post("/api/funding-requests/{requestId}/approve", UUID.fromString(requestId))
            .header("Authorization", bearer(token)));
    }

    private ResultActions rejectFundingRequest(String token, String requestId) throws Exception {
        return mockMvc.perform(post("/api/funding-requests/{requestId}/reject", UUID.fromString(requestId))
            .header("Authorization", bearer(token)));
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private JsonNode readBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private void assertJsonValue(JsonNode node, String field, String expected) {
        org.assertj.core.api.Assertions.assertThat(node.get(field).asText()).isEqualTo(expected);
    }

    private record UserSession(String token, String userId) {
    }
}
