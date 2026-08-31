package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyCentre;

@Repository
public interface AcademyCentreRepository extends JpaRepository<AcademyCentre, Long> {

    Optional<AcademyCentre> findByCentreUuid(UUID centreUuid);

    List<AcademyCentre> findByOrganizationUuidOrderByCreatedAtDesc(UUID organizationUuid);

    List<AcademyCentre> findByOrganizationUuidAndStatusOrderByCreatedAtDesc(UUID organizationUuid, String status);

    long countByOrganizationUuid(UUID organizationUuid);

    long countByOrganizationUuidAndStatus(UUID organizationUuid, String status);

    void deleteByCentreUuid(UUID centreUuid);
}
