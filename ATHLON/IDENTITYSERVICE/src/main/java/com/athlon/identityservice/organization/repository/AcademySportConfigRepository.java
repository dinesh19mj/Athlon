package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademySportConfig;

@Repository
public interface AcademySportConfigRepository extends JpaRepository<AcademySportConfig, Long> {

    Optional<AcademySportConfig> findBySportUuid(UUID sportUuid);

    List<AcademySportConfig> findByOrganizationUuidOrderBySportNameAsc(UUID organizationUuid);

    List<AcademySportConfig> findByOrganizationUuidAndStatusOrderBySportNameAsc(UUID organizationUuid, String status);

    Optional<AcademySportConfig> findByOrganizationUuidAndSportNameIgnoreCase(UUID organizationUuid, String sportName);

    long countByOrganizationUuid(UUID organizationUuid);

    void deleteBySportUuid(UUID sportUuid);
}
