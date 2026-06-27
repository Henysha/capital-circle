package com.capitalcircle.dto;

import com.capitalcircle.domain.FundingRequestStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public final class FundingRequestDtos {
    private FundingRequestDtos() {
    }

    public record CreateFundingRequestRequest(
        @NotBlank @Size(max = 180) String title,
        @Size(max = 1000) String description,
        @DecimalMin(value = "0.01") BigDecimal amount
    ) {
    }

    public record FundingRequestResponse(
        UUID id,
        UUID groupId,
        UUID requesterUserId,
        String title,
        String description,
        BigDecimal amount,
        FundingRequestStatus status,
        UUID decidedByUserId,
        LocalDateTime decidedAt,
        LocalDateTime createdAt
    ) {
    }
}
