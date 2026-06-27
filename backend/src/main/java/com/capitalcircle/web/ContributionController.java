package com.capitalcircle.web;

import com.capitalcircle.dto.ContributionDtos.ContributionResponse;
import com.capitalcircle.dto.ContributionDtos.CreateContributionRequest;
import com.capitalcircle.service.ContributionService;
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
@RequestMapping("/api/groups/{groupId}/contributions")
@RequiredArgsConstructor
public class ContributionController {
    private final ContributionService contributionService;

    @PostMapping
    ContributionResponse create(
        @PathVariable UUID groupId,
        @Valid @RequestBody CreateContributionRequest request
    ) {
        return contributionService.create(groupId, request);
    }

    @GetMapping
    List<ContributionResponse> list(@PathVariable UUID groupId) {
        return contributionService.list(groupId);
    }
}
