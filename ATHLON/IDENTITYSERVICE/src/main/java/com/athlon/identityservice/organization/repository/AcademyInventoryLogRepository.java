package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyInventoryLog;

@Repository
public interface AcademyInventoryLogRepository extends JpaRepository<AcademyInventoryLog, Long> {

    List<AcademyInventoryLog> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyInventoryLog> findByItemUuidOrderByCreatedAtDesc(UUID itemUuid);
}
