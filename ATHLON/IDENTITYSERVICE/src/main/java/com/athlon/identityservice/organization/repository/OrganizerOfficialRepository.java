package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.OrganizerOfficial;

@Repository
public interface OrganizerOfficialRepository extends JpaRepository<OrganizerOfficial, Long> {

    Optional<OrganizerOfficial> findByOfficialUuid(UUID officialUuid);

    List<OrganizerOfficial> findByOrganizationUuidAndIsActiveOrderByCreatedAtDesc(UUID organizationUuid, Integer isActive);

    List<OrganizerOfficial> findByOrganizationUuidAndRoleAndIsActiveOrderByCreatedAtDesc(UUID organizationUuid, String role, Integer isActive);

    Optional<OrganizerOfficial> findByOrganizationUuidAndUserId(UUID organizationUuid, Long userId);

    Optional<OrganizerOfficial> findByOrganizationUuidAndUserUuid(UUID organizationUuid, UUID userUuid);

    boolean existsByOrganizationUuidAndUserIdAndIsActive(UUID organizationUuid, Long userId, Integer isActive);

    void deleteByOfficialUuid(UUID officialUuid);
}
