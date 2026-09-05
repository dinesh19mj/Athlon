package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyMatch;

@Repository
public interface AcademyMatchRepository extends JpaRepository<AcademyMatch, Long> {

    List<AcademyMatch> findByOrganizationUuidOrderByMatchDateDesc(UUID organizationUuid);

    List<AcademyMatch> findByOrganizationUuidAndStatusOrderByMatchDateDesc(UUID organizationUuid, String status);

    List<AcademyMatch> findByOrganizationUuidAndBatchUuidOrderByMatchDateDesc(UUID organizationUuid, UUID batchUuid);

    List<AcademyMatch> findByOrganizationUuidAndSportTypeOrderByMatchDateDesc(UUID organizationUuid, String sportType);

    Optional<AcademyMatch> findByMatchUuid(UUID matchUuid);

    void deleteByMatchUuid(UUID matchUuid);
}
