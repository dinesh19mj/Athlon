package com.athlon.identityservice.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.subscription.model.SubscriptionPackage;

import java.util.List;

@Repository
public interface SubscriptionPackageRepository extends JpaRepository<SubscriptionPackage, Long> {
    List<SubscriptionPackage> findByWorkspaceTypeAndIsActive(String workspaceType, Integer isActive);
}
