package com.athlon.identityservice.organization.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.CoachFeeTransaction;

@Repository
public interface CoachFeeTransactionRepository extends JpaRepository<CoachFeeTransaction, Long> {

    Optional<CoachFeeTransaction> findByTransactionUuid(UUID transactionUuid);

    List<CoachFeeTransaction> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<CoachFeeTransaction> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CoachFeeTransaction t WHERE t.organizationUuid = :orgUuid AND t.status = 'PAID'")
    BigDecimal sumPaidAmountByOrganizationUuid(@Param("orgUuid") UUID orgUuid);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM CoachFeeTransaction t WHERE t.organizationUuid = :orgUuid AND t.status IN ('PENDING', 'OVERDUE')")
    BigDecimal sumPendingAmountByOrganizationUuid(@Param("orgUuid") UUID orgUuid);

    void deleteByTransactionUuid(UUID transactionUuid);
}
