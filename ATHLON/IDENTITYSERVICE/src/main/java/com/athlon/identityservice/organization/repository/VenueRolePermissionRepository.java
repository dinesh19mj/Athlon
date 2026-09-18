package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.VenueRolePermission;

@Repository
public interface VenueRolePermissionRepository extends JpaRepository<VenueRolePermission, Long> {

    List<VenueRolePermission> findByOrganizationUuid(UUID organizationUuid);

    List<VenueRolePermission> findByOrganizationUuidAndRole(UUID organizationUuid, String role);

    Optional<VenueRolePermission> findByOrganizationUuidAndRoleAndModuleId(UUID organizationUuid, String role, String moduleId);

    void deleteByOrganizationUuid(UUID organizationUuid);
}
