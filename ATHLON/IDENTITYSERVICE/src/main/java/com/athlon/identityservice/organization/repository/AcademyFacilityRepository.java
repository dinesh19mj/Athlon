package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyFacility;

@Repository
public interface AcademyFacilityRepository extends JpaRepository<AcademyFacility, Long> {

    Optional<AcademyFacility> findByFacilityUuid(UUID facilityUuid);

    List<AcademyFacility> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyFacility> findByOrganizationUuidAndCentreUuidOrderByCreatedAtDesc(UUID organizationUuid, UUID centreUuid);

    List<AcademyFacility> findByOrganizationUuidAndSportTypeOrderByCreatedAtDesc(UUID organizationUuid, String sportType);

    List<AcademyFacility> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    long countByOrganizationUuid(UUID organizationUuid);

    long countByOrganizationUuidAndStatus(UUID organizationUuid, String status);

    void deleteByFacilityUuid(UUID facilityUuid);
}
