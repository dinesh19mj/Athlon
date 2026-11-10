package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.SubscriptionPlanFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanFeatureRepository extends JpaRepository<SubscriptionPlanFeature, Long> {
    List<SubscriptionPlanFeature> findByVersionId(Long versionId);
    Optional<SubscriptionPlanFeature> findByVersionIdAndFeatureCode(Long versionId, String featureCode);
}

