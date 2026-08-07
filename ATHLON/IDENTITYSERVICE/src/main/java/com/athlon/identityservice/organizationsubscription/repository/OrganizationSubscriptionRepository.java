package com.athlon.identityservice.organizationsubscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.oganizationsubscription.entity.OrganizationSubscription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationSubscriptionRepository extends JpaRepository<OrganizationSubscription, Long> {
	
	Optional<OrganizationSubscription> findByOrganizationSubscriptionUuid(UUID organizationSubscriptionUuid);

    List<OrganizationSubscription> findByOrganizationId(Long organizationId);

    Optional<OrganizationSubscription> findByOrganizationIdAndStatus(Long organizationId, String status);

    List<OrganizationSubscription> findByStatus(String status);

    List<OrganizationSubscription> findByPackageId(Long packageId);

    Optional<OrganizationSubscription> findByOrganizationIdAndPackageId(Long organizationId, Long packageId);
}
