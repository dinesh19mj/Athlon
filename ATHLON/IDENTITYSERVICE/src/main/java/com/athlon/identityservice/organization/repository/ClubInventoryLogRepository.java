package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubInventoryLog;

@Repository
public interface ClubInventoryLogRepository extends JpaRepository<ClubInventoryLog, Long> {

    List<ClubInventoryLog> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<ClubInventoryLog> findByItemUuidOrderByCreatedAtDesc(UUID itemUuid);
}
