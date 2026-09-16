package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubRolePermission;

@Repository
public interface ClubRolePermissionRepository extends JpaRepository<ClubRolePermission, Long> {

    List<ClubRolePermission> findByOrganizationUuid(UUID organizationUuid);

    List<ClubRolePermission> findByOrganizationUuidAndRole(UUID organizationUuid, String role);

    Optional<ClubRolePermission> findByOrganizationUuidAndRoleAndModuleId(UUID organizationUuid, String role, String moduleId);

    void deleteByOrganizationUuid(UUID organizationUuid);
}
