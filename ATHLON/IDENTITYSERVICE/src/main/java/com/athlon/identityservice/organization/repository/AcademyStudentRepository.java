package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyStudent;

@Repository
public interface AcademyStudentRepository extends JpaRepository<AcademyStudent, Long> {

    Optional<AcademyStudent> findByStudentUuid(UUID studentUuid);

    List<AcademyStudent> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyStudent> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    List<AcademyStudent> findByOrganizationUuidAndBatchUuidOrderByCreatedAtDesc(UUID organizationUuid, UUID batchUuid);

    List<AcademyStudent> findByOrganizationUuidAndLevelOrderByCreatedAtDesc(UUID organizationUuid, String level);

    List<AcademyStudent> findByOrganizationUuidAndFeeStatusOrderByCreatedAtDesc(UUID organizationUuid, String feeStatus);

    long countByOrganizationUuidAndStatus(UUID organizationUuid, String status);

    long countByOrganizationUuidAndFeeStatus(UUID organizationUuid, String feeStatus);

    void deleteByStudentUuid(UUID studentUuid);
}
