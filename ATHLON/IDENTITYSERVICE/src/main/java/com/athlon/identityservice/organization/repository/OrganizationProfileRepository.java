package com.athlon.identityservice.organization.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.OrganizationProfile;

@Repository
public interface OrganizationProfileRepository extends JpaRepository<OrganizationProfile, Long> {

    Optional<OrganizationProfile> findByOrganizationProfileUuid(UUID organizationProfileUuid);

    Optional<OrganizationProfile> findByOrganizationId(Long organizationId);

    Optional<OrganizationProfile> findByOrganizationUuid(UUID organizationUuid);
}
