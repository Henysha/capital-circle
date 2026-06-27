package com.capitalcircle.service;

import com.capitalcircle.domain.CapitalGroup;
import com.capitalcircle.domain.Contribution;
import com.capitalcircle.domain.FundingRequest;
import com.capitalcircle.domain.LedgerEntry;
import com.capitalcircle.domain.LedgerEntryType;
import com.capitalcircle.dto.LedgerDtos.BalanceResponse;
import com.capitalcircle.dto.LedgerDtos.LedgerEntryResponse;
import com.capitalcircle.repository.LedgerEntryRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LedgerService {
    private final LedgerEntryRepository ledgerEntryRepository;
    private final AuthService authService;
    private final GroupService groupService;

    public void recordContribution(Contribution contribution) {
        LedgerEntry entry = new LedgerEntry();
        entry.setGroup(contribution.getGroup());
        entry.setType(LedgerEntryType.CREDIT);
        entry.setAmount(contribution.getAmount());
        entry.setDescription("Contribution from " + contribution.getContributor().getFullName());
        entry.setContribution(contribution);
        ledgerEntryRepository.save(entry);
    }

    public void recordApprovedFundingRequest(FundingRequest fundingRequest) {
        LedgerEntry entry = new LedgerEntry();
        entry.setGroup(fundingRequest.getGroup());
        entry.setType(LedgerEntryType.DEBIT);
        entry.setAmount(fundingRequest.getAmount());
        entry.setDescription("Approved funding request: " + fundingRequest.getTitle());
        entry.setFundingRequest(fundingRequest);
        ledgerEntryRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public List<LedgerEntryResponse> list(UUID groupId) {
        groupService.requireMembership(groupId, authService.currentUser().getId());
        return ledgerEntryRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BalanceResponse balance(UUID groupId) {
        groupService.requireMembership(groupId, authService.currentUser().getId());
        return new BalanceResponse(groupId, calculateBalance(groupId));
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateBalance(UUID groupId) {
        return ledgerEntryRepository.calculateBalance(groupId, LedgerEntryType.CREDIT);
    }

    public BalanceResponse balanceForGroup(CapitalGroup group) {
        return new BalanceResponse(group.getId(), calculateBalance(group.getId()));
    }

    private LedgerEntryResponse toResponse(LedgerEntry entry) {
        UUID contributionId = entry.getContribution() == null ? null : entry.getContribution().getId();
        UUID fundingRequestId = entry.getFundingRequest() == null ? null : entry.getFundingRequest().getId();
        return new LedgerEntryResponse(
            entry.getId(),
            entry.getGroup().getId(),
            entry.getType(),
            entry.getAmount(),
            entry.getDescription(),
            contributionId,
            fundingRequestId,
            entry.getCreatedAt()
        );
    }
}
