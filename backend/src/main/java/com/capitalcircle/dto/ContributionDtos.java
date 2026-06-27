package com.capitalcircle.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public final class ContributionDtos {
    private ContributionDtos() {
    }

    public record CreateContributionRequest(
        @DecimalMin(value = "0.01") BigDecimal amount,
        @Size(max = 500) String note
    ) {
    }

    public record ContributionResponse(
        UUID id,
        UUID groupId,
        UUID contributorUserId,
        BigDecimal amount,
        String note,
        LocalDateTime contributedAt
    ) {
    }
}
