package com.athlon.identityservice.community.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.community.entity.CommunityDetails;
import com.athlon.identityservice.community.enums.CommunityVisibility;

@Repository
public interface CommunityDetailsRepository extends JpaRepository<CommunityDetails, Long> {

    Optional<CommunityDetails> findByOrganizationUuid(UUID organizationUuid);

    Optional<CommunityDetails> findByOrganizationId(Long organizationId);

    List<CommunityDetails> findByVisibilityAndIsActive(CommunityVisibility visibility, Integer isActive);

    List<CommunityDetails> findByIsActive(Integer isActive);
}
