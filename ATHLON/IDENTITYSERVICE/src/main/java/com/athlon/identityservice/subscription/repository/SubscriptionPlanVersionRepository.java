package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.SubscriptionPlanVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanVersionRepository extends JpaRepository<SubscriptionPlanVersion, Long> {
    Optional<SubscriptionPlanVersion> findFirstByPlanIdAndIsPublishedTrueOrderByVersionNumberDesc(Long planId);
    List<SubscriptionPlanVersion> findByPlanIdOrderByVersionNumberDesc(Long planId);
    Optional<SubscriptionPlanVersion> findByPlanIdAndVersionNumber(Long planId, Integer versionNumber);
}

