package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.OrganizerInventoryLog;

@Repository
public interface OrganizerInventoryLogRepository extends JpaRepository<OrganizerInventoryLog, Long> {

    List<OrganizerInventoryLog> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<OrganizerInventoryLog> findByItemUuidOrderByCreatedAtDesc(UUID itemUuid);

    List<OrganizerInventoryLog> findByOrganizationUuidAndItemUuidOrderByCreatedAtDesc(UUID organizationUuid, UUID itemUuid);

    List<OrganizerInventoryLog> findByOrganizationUuidAndTournamentUuidOrderByCreatedAtDesc(UUID organizationUuid, UUID tournamentUuid);
}
