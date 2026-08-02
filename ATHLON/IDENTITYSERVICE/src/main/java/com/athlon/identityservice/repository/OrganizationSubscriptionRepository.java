package com.athlon.identityservice.repository;

import com.athlon.identityservice.entity.OrganizationSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationSubscriptionRepository extends JpaRepository<OrganizationSubscription, Long> {
    Optional<OrganizationSubscription> findByUuid(UUID uuid);
    List<OrganizationSubscription> findByOrganizationId(Long organizationId);
    Optional<OrganizationSubscription> findByOrganizationIdAndStatus(Long organizationId, String status);
}
