package com.capitalcircle.dto;

import com.capitalcircle.domain.LedgerEntryType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public final class LedgerDtos {
    private LedgerDtos() {
    }

    public record LedgerEntryResponse(
        UUID id,
        UUID groupId,
        LedgerEntryType type,
        BigDecimal amount,
        String description,
        UUID contributionId,
        UUID fundingRequestId,
        LocalDateTime createdAt
    ) {
    }

    public record BalanceResponse(UUID groupId, BigDecimal balance) {
    }
}
