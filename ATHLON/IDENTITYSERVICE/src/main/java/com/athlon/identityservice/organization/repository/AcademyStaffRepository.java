package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyStaff;

@Repository
public interface AcademyStaffRepository extends JpaRepository<AcademyStaff, Long> {

    List<AcademyStaff> findByOrganizationUuidAndIsActive(UUID organizationUuid, Integer isActive);

    List<AcademyStaff> findByOrganizationUuidAndStaffTypeAndIsActive(UUID organizationUuid, String staffType, Integer isActive);

    Optional<AcademyStaff> findByStaffUuid(UUID staffUuid);

    Optional<AcademyStaff> findByOrganizationIdAndUserIdAndIsActive(Long organizationId, Long userId, Integer isActive);

    Optional<AcademyStaff> findByOrganizationUuidAndUserUuidAndIsActive(UUID organizationUuid, UUID userUuid, Integer isActive);

    Optional<AcademyStaff> findByOrganizationUuidAndPhoneAndIsActive(UUID organizationUuid, String phone, Integer isActive);
}
