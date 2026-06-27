package com.capitalcircle.repository;

import com.capitalcircle.domain.CapitalGroup;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CapitalGroupRepository extends JpaRepository<CapitalGroup, UUID> {

    @Query("""
        select distinct g from CapitalGroup g
        join GroupMember m on m.group = g
        where m.user.id = :userId
        order by g.createdAt desc
        """)
    List<CapitalGroup> findGroupsForUser(UUID userId);
}
