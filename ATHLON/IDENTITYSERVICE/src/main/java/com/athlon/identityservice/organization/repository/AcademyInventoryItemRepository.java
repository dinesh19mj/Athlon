package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyInventoryItem;

@Repository
public interface AcademyInventoryItemRepository extends JpaRepository<AcademyInventoryItem, Long> {

    Optional<AcademyInventoryItem> findByItemUuid(UUID itemUuid);

    List<AcademyInventoryItem> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyInventoryItem> findByOrganizationUuidAndCategoryOrderByCreatedAtDesc(UUID organizationUuid, String category);

    List<AcademyInventoryItem> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    List<AcademyInventoryItem> findByOrganizationUuidAndCategoryAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String category, String status);
}
