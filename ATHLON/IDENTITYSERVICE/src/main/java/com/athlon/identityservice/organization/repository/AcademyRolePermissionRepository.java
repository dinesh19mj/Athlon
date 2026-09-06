package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyRolePermission;

@Repository
public interface AcademyRolePermissionRepository extends JpaRepository<AcademyRolePermission, Long> {

    List<AcademyRolePermission> findByOrganizationUuid(UUID organizationUuid);

    List<AcademyRolePermission> findByOrganizationUuidAndRole(UUID organizationUuid, String role);

    Optional<AcademyRolePermission> findByOrganizationUuidAndRoleAndModuleId(UUID organizationUuid, String role, String moduleId);

    void deleteByOrganizationUuid(UUID organizationUuid);
}
