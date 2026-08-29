package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubInventoryItem;

@Repository
public interface ClubInventoryItemRepository extends JpaRepository<ClubInventoryItem, Long> {

    Optional<ClubInventoryItem> findByItemUuid(UUID itemUuid);

    List<ClubInventoryItem> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<ClubInventoryItem> findByOrganizationUuidAndCategoryOrderByCreatedAtDesc(UUID organizationUuid, String category);

    List<ClubInventoryItem> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    List<ClubInventoryItem> findByOrganizationUuidAndCategoryAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String category, String status);
}
