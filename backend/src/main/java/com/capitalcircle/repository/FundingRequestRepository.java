package com.capitalcircle.repository;

import com.capitalcircle.domain.FundingRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FundingRequestRepository extends JpaRepository<FundingRequest, UUID> {
    List<FundingRequest> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
}
