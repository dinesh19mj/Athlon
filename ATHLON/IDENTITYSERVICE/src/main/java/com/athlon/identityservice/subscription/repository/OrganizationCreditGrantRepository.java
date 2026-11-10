package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.OrganizationCreditGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrganizationCreditGrantRepository extends JpaRepository<OrganizationCreditGrant, Long> {

    List<OrganizationCreditGrant> findByAccountIdAndStatusOrderByExpiresAtAsc(Long accountId, String status);

    @Query("SELECT g FROM OrganizationCreditGrant g WHERE g.accountId = :accountId " +
            "AND g.creditType = :creditType " +
            "AND g.status = 'ACTIVE' " +
            "AND g.remainingQuantity > 0 " +
            "AND (g.expiresAt IS NULL OR g.expiresAt > :now) " +
            "ORDER BY g.expiresAt ASC NULLS LAST, g.createdAt ASC")
    List<OrganizationCreditGrant> findActiveGrantsForConsumption(
            @Param("accountId") Long accountId,
            @Param("creditType") String creditType,
            @Param("now") LocalDateTime now
    );
}

