package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.SubscriptionPlanLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanLimitRepository extends JpaRepository<SubscriptionPlanLimit, Long> {
    List<SubscriptionPlanLimit> findByVersionId(Long versionId);
    Optional<SubscriptionPlanLimit> findByVersionIdAndLimitCode(Long versionId, String limitCode);
}

