package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueMembershipRepository extends JpaRepository<VenueMembership, Long> {

    Optional<VenueMembership> findByMembershipUuid(UUID membershipUuid);

    List<VenueMembership> findByOrganizationUuidAndIsActiveTrue(UUID organizationUuid);

    List<VenueMembership> findByOrganizationUuid(UUID organizationUuid);
}

