package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyBatch;

@Repository
public interface AcademyBatchRepository extends JpaRepository<AcademyBatch, Long> {

    Optional<AcademyBatch> findByBatchUuid(UUID batchUuid);

    List<AcademyBatch> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyBatch> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    void deleteByBatchUuid(UUID batchUuid);
}
