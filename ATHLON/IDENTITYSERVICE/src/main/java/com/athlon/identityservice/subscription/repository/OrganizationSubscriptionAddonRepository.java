package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.OrganizationSubscriptionAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationSubscriptionAddonRepository extends JpaRepository<OrganizationSubscriptionAddon, Long> {
    List<OrganizationSubscriptionAddon> findBySubscriptionIdAndStatus(Long subscriptionId, String status);
    List<OrganizationSubscriptionAddon> findBySubscriptionId(Long subscriptionId);
}

