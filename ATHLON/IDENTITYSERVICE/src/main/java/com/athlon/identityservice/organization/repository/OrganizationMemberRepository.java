package com.athlon.identityservice.organization.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.identityservice.organization.model.OrganizationMember;
import java.util.List;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByOrgId(Long orgId);
    List<OrganizationMember> findByPlayerId(Long playerId);
}
