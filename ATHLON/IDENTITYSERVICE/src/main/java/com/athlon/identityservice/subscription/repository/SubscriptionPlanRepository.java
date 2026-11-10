package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByPlanUuid(UUID planUuid);
    Optional<SubscriptionPlan> findByPlanCode(String planCode);
    List<SubscriptionPlan> findByTargetModuleOrderByDisplayOrderAsc(String targetModule);
    List<SubscriptionPlan> findByIsActiveOrderByDisplayOrderAsc(Integer isActive);
}

