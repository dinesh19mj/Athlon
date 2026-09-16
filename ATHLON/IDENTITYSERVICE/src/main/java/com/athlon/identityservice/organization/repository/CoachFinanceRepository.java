package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.CoachFinance;

@Repository
public interface CoachFinanceRepository extends JpaRepository<CoachFinance, Long> {

    Optional<CoachFinance> findByFinanceUuid(UUID financeUuid);

    List<CoachFinance> findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid);

    List<CoachFinance> findByOrganizationUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, String transactionType);

    List<CoachFinance> findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, LocalDate startDate, LocalDate endDate);

    List<CoachFinance> findByOrganizationUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, String transactionType, LocalDate startDate, LocalDate endDate);

    List<CoachFinance> findByOrganizationUuidAndTraineeUuidOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, UUID traineeUuid);

    void deleteByFinanceUuid(UUID financeUuid);
}
