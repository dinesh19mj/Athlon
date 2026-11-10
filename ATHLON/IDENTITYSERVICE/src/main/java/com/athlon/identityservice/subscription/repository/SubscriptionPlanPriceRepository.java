package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.SubscriptionPlanPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanPriceRepository extends JpaRepository<SubscriptionPlanPrice, Long> {
    List<SubscriptionPlanPrice> findByVersionId(Long versionId);
    Optional<SubscriptionPlanPrice> findByVersionIdAndBillingCycle(Long versionId, String billingCycle);
}

