package com.athlon.identityservice.repository;

import com.athlon.identityservice.entity.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    
    Optional<OrganizationMember> findByUuid(UUID uuid);
    
    List<OrganizationMember> findByOrganizationId(Long organizationId);
    
    List<OrganizationMember> findByUserId(Long userId);
    
    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);
}
