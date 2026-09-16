package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.OrganizerInventoryItem;

@Repository
public interface OrganizerInventoryItemRepository extends JpaRepository<OrganizerInventoryItem, Long> {

    Optional<OrganizerInventoryItem> findByItemUuid(UUID itemUuid);

    List<OrganizerInventoryItem> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<OrganizerInventoryItem> findByOrganizationUuidAndCategoryOrderByCreatedAtDesc(UUID organizationUuid, String category);

    List<OrganizerInventoryItem> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    List<OrganizerInventoryItem> findByOrganizationUuidAndCategoryAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String category, String status);

    List<OrganizerInventoryItem> findByOrganizationUuidAndTournamentUuidOrderByCreatedAtDesc(UUID organizationUuid, UUID tournamentUuid);
}
