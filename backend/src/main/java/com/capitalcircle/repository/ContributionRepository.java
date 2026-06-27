package com.capitalcircle.repository;

import com.capitalcircle.domain.Contribution;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContributionRepository extends JpaRepository<Contribution, UUID> {
    List<Contribution> findByGroupIdOrderByContributedAtDesc(UUID groupId);
}
