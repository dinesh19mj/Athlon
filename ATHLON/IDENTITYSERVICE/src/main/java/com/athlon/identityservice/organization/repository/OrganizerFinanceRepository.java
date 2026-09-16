package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.OrganizerFinance;

@Repository
public interface OrganizerFinanceRepository extends JpaRepository<OrganizerFinance, Long> {

    Optional<OrganizerFinance> findByFinanceUuid(UUID financeUuid);

    List<OrganizerFinance> findByOrganizationUuidOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid);

    List<OrganizerFinance> findByOrganizationUuidAndTournamentUuidOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, UUID tournamentUuid);

    List<OrganizerFinance> findByOrganizationUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, String transactionType);

    List<OrganizerFinance> findByOrganizationUuidAndTournamentUuidAndTransactionTypeOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, UUID tournamentUuid, String transactionType);

    List<OrganizerFinance> findByOrganizationUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, LocalDate startDate, LocalDate endDate);

    List<OrganizerFinance> findByOrganizationUuidAndTournamentUuidAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, UUID tournamentUuid, LocalDate startDate, LocalDate endDate);

    List<OrganizerFinance> findByOrganizationUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, String transactionType, LocalDate startDate, LocalDate endDate);

    List<OrganizerFinance> findByOrganizationUuidAndTournamentUuidAndTransactionTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(UUID organizationUuid, UUID tournamentUuid, String transactionType, LocalDate startDate, LocalDate endDate);

    void deleteByFinanceUuid(UUID financeUuid);
}
