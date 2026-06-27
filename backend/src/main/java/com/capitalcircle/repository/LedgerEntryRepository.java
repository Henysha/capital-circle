package com.capitalcircle.repository;

import com.capitalcircle.domain.LedgerEntry;
import com.capitalcircle.domain.LedgerEntryType;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findByGroupIdOrderByCreatedAtDesc(UUID groupId);

    @Query("""
        select coalesce(sum(
            case when e.type = :creditType then e.amount else -e.amount end
        ), 0)
        from LedgerEntry e
        where e.group.id = :groupId
        """)
    BigDecimal calculateBalance(UUID groupId, LedgerEntryType creditType);
}
