package com.athlon.identityservice.organization.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.OrganizationMember;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    
    Optional<OrganizationMember> findByOrganizationMemberUuid(UUID organizationMemberUuid);

    List<OrganizationMember> findByOrganizationId(Long organizationId);

    List<OrganizationMember> findByOrganizationUuid(UUID organizationUuid);

    List<OrganizationMember> findByUserId(Long userId);

    List<OrganizationMember> findByUserUuid(UUID userUuid);
    
    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);

    Optional<OrganizationMember> findByOrganizationIdAndUserId(Long organizationId, Long userId);

    Optional<OrganizationMember> findByOrganizationUuidAndUserUuid(UUID organizationUuid, UUID userUuid);

    Optional<OrganizationMember> findByOrganizationUuidAndUserId(UUID organizationUuid, Long userId);
}
