package com.capitalcircle.service;

import com.capitalcircle.domain.AppUser;
import com.capitalcircle.domain.CapitalGroup;
import com.capitalcircle.domain.FundingRequest;
import com.capitalcircle.domain.FundingRequestStatus;
import com.capitalcircle.dto.FundingRequestDtos.CreateFundingRequestRequest;
import com.capitalcircle.dto.FundingRequestDtos.FundingRequestResponse;
import com.capitalcircle.exception.BusinessException;
import com.capitalcircle.repository.FundingRequestRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FundingRequestService {
    private final FundingRequestRepository fundingRequestRepository;
    private final AuthService authService;
    private final GroupService groupService;
    private final LedgerService ledgerService;

    @Transactional
    public FundingRequestResponse create(UUID groupId, CreateFundingRequestRequest request) {
        AppUser user = authService.currentUser();
        CapitalGroup group = groupService.getGroupOrThrow(groupId);
        groupService.requireMembership(groupId, user.getId());

        FundingRequest fundingRequest = new FundingRequest();
        fundingRequest.setGroup(group);
        fundingRequest.setRequester(user);
        fundingRequest.setTitle(request.title().trim());
        fundingRequest.setDescription(request.description());
        fundingRequest.setAmount(request.amount());
        fundingRequest.setStatus(FundingRequestStatus.PENDING);

        return toResponse(fundingRequestRepository.save(fundingRequest));
    }

    @Transactional(readOnly = true)
    public List<FundingRequestResponse> list(UUID groupId) {
        groupService.requireMembership(groupId, authService.currentUser().getId());
        return fundingRequestRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public FundingRequestResponse approve(UUID requestId) {
        AppUser admin = authService.currentUser();
        FundingRequest fundingRequest = getRequestOrThrow(requestId);
        UUID groupId = fundingRequest.getGroup().getId();
        groupService.requireAdmin(groupId, admin.getId());
        requirePending(fundingRequest);

        BigDecimal balance = ledgerService.calculateBalance(groupId);
        if (balance.compareTo(fundingRequest.getAmount()) < 0) {
            throw new BusinessException(HttpStatus.CONFLICT, "Group balance is not sufficient to approve this request");
        }

        fundingRequest.setStatus(FundingRequestStatus.APPROVED);
        fundingRequest.setDecidedBy(admin);
        fundingRequest.setDecidedAt(LocalDateTime.now());
        FundingRequest saved = fundingRequestRepository.save(fundingRequest);
        ledgerService.recordApprovedFundingRequest(saved);
        return toResponse(saved);
    }

    @Transactional
    public FundingRequestResponse reject(UUID requestId) {
        AppUser admin = authService.currentUser();
        FundingRequest fundingRequest = getRequestOrThrow(requestId);
        groupService.requireAdmin(fundingRequest.getGroup().getId(), admin.getId());
        requirePending(fundingRequest);

        fundingRequest.setStatus(FundingRequestStatus.REJECTED);
        fundingRequest.setDecidedBy(admin);
        fundingRequest.setDecidedAt(LocalDateTime.now());
        return toResponse(fundingRequestRepository.save(fundingRequest));
    }

    private FundingRequest getRequestOrThrow(UUID requestId) {
        return fundingRequestRepository.findById(requestId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Funding request not found"));
    }

    private void requirePending(FundingRequest fundingRequest) {
        if (fundingRequest.getStatus() != FundingRequestStatus.PENDING) {
            throw new BusinessException(HttpStatus.CONFLICT, "Funding request has already been decided");
        }
    }

    private FundingRequestResponse toResponse(FundingRequest fundingRequest) {
        UUID decidedById = fundingRequest.getDecidedBy() == null ? null : fundingRequest.getDecidedBy().getId();
        return new FundingRequestResponse(
            fundingRequest.getId(),
            fundingRequest.getGroup().getId(),
            fundingRequest.getRequester().getId(),
            fundingRequest.getTitle(),
            fundingRequest.getDescription(),
            fundingRequest.getAmount(),
            fundingRequest.getStatus(),
            decidedById,
            fundingRequest.getDecidedAt(),
            fundingRequest.getCreatedAt()
        );
    }
}
