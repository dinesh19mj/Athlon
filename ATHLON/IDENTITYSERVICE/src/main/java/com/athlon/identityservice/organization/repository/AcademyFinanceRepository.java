package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyFinance;

@Repository
public interface AcademyFinanceRepository extends JpaRepository<AcademyFinance, Long> {

    Optional<AcademyFinance> findByFinanceUuid(UUID financeUuid);

    List<AcademyFinance> findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid);

    List<AcademyFinance> findByOrganizationUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(
            UUID organizationUuid, String transactionType);

    List<AcademyFinance> findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
            UUID organizationUuid, LocalDate startDate, LocalDate endDate);

    List<AcademyFinance> findByOrganizationUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
            UUID organizationUuid, String transactionType, LocalDate startDate, LocalDate endDate);

    List<AcademyFinance> findByOrganizationUuidAndStudentUuidOrderByTransactionDateDescCreatedAtDesc(
            UUID organizationUuid, UUID studentUuid);

    List<AcademyFinance> findByOrganizationUuidAndBatchUuidOrderByTransactionDateDescCreatedAtDesc(
            UUID organizationUuid, UUID batchUuid);
}
