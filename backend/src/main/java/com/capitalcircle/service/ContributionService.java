package com.capitalcircle.service;

import com.capitalcircle.domain.AppUser;
import com.capitalcircle.domain.CapitalGroup;
import com.capitalcircle.domain.Contribution;
import com.capitalcircle.dto.ContributionDtos.ContributionResponse;
import com.capitalcircle.dto.ContributionDtos.CreateContributionRequest;
import com.capitalcircle.repository.ContributionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContributionService {
    private final ContributionRepository contributionRepository;
    private final AuthService authService;
    private final GroupService groupService;
    private final LedgerService ledgerService;

    @Transactional
    public ContributionResponse create(UUID groupId, CreateContributionRequest request) {
        AppUser user = authService.currentUser();
        CapitalGroup group = groupService.getGroupOrThrow(groupId);
        groupService.requireMembership(groupId, user.getId());

        Contribution contribution = new Contribution();
        contribution.setGroup(group);
        contribution.setContributor(user);
        contribution.setAmount(request.amount());
        contribution.setNote(request.note());
        contribution.setContributedAt(LocalDateTime.now());
        Contribution saved = contributionRepository.save(contribution);
        ledgerService.recordContribution(saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ContributionResponse> list(UUID groupId) {
        groupService.requireMembership(groupId, authService.currentUser().getId());
        return contributionRepository.findByGroupIdOrderByContributedAtDesc(groupId).stream()
            .map(this::toResponse)
            .toList();
    }

    private ContributionResponse toResponse(Contribution contribution) {
        return new ContributionResponse(
            contribution.getId(),
            contribution.getGroup().getId(),
            contribution.getContributor().getId(),
            contribution.getAmount(),
            contribution.getNote(),
            contribution.getContributedAt()
        );
    }
}
