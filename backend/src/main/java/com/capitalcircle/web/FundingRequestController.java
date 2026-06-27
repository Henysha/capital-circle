package com.capitalcircle.web;

import com.capitalcircle.dto.FundingRequestDtos.CreateFundingRequestRequest;
import com.capitalcircle.dto.FundingRequestDtos.FundingRequestResponse;
import com.capitalcircle.service.FundingRequestService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FundingRequestController {
    private final FundingRequestService fundingRequestService;

    @PostMapping("/api/groups/{groupId}/funding-requests")
    FundingRequestResponse create(
        @PathVariable UUID groupId,
        @Valid @RequestBody CreateFundingRequestRequest request
    ) {
        return fundingRequestService.create(groupId, request);
    }

    @GetMapping("/api/groups/{groupId}/funding-requests")
    List<FundingRequestResponse> list(@PathVariable UUID groupId) {
        return fundingRequestService.list(groupId);
    }

    @PostMapping("/api/funding-requests/{requestId}/approve")
    FundingRequestResponse approve(@PathVariable UUID requestId) {
        return fundingRequestService.approve(requestId);
    }

    @PostMapping("/api/funding-requests/{requestId}/reject")
    FundingRequestResponse reject(@PathVariable UUID requestId) {
        return fundingRequestService.reject(requestId);
    }
}
