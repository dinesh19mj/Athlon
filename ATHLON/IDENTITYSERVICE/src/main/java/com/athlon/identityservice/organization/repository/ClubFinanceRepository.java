package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubFinance;

@Repository
public interface ClubFinanceRepository extends JpaRepository<ClubFinance, Long> {

    Optional<ClubFinance> findByFinanceUuid(UUID financeUuid);

    List<ClubFinance> findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid);

    List<ClubFinance> findByOrganizationUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, String transactionType);

    List<ClubFinance> findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, LocalDate startDate, LocalDate endDate);

    List<ClubFinance> findByOrganizationUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, String transactionType, LocalDate startDate, LocalDate endDate);

    void deleteByFinanceUuid(UUID financeUuid);
}
