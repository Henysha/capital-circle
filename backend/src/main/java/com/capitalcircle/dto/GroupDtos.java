package com.capitalcircle.dto;

import com.capitalcircle.domain.GroupRole;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public final class GroupDtos {
    private GroupDtos() {
    }

    public record CreateGroupRequest(
        @NotBlank @Size(max = 140) String name,
        @Size(max = 1000) String description,
        @DecimalMin(value = "0.00", inclusive = false) BigDecimal contributionGoal
    ) {
    }

    public record GroupResponse(
        UUID id,
        String name,
        String description,
        BigDecimal contributionGoal,
        UUID createdByUserId,
        GroupRole currentUserRole,
        LocalDateTime createdAt
    ) {
    }
}
