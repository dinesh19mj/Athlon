package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.VenueStaff;

@Repository
public interface VenueStaffRepository extends JpaRepository<VenueStaff, Long> {

    Optional<VenueStaff> findByStaffUuid(UUID staffUuid);

    List<VenueStaff> findByOrganizationUuidAndIsActiveOrderByCreatedAtDesc(UUID organizationUuid, Integer isActive);

    List<VenueStaff> findByOrganizationUuidAndRoleAndIsActiveOrderByCreatedAtDesc(UUID organizationUuid, String role, Integer isActive);

    Optional<VenueStaff> findByOrganizationUuidAndUserId(UUID organizationUuid, Long userId);

    Optional<VenueStaff> findByOrganizationUuidAndUserUuid(UUID organizationUuid, UUID userUuid);

    List<VenueStaff> findByOrganizationUuid(UUID organizationUuid);
}
