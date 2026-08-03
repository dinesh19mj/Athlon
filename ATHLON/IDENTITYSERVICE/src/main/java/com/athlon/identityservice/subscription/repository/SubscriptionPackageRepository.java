package com.athlon.identityservice.subscription.repository;

import com.athlon.identityservice.subscription.entity.SubscriptionPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPackageRepository extends JpaRepository<SubscriptionPackage, Long> {
	
	Optional<SubscriptionPackage> findByPackageUuid(UUID packageUuid);

    Optional<SubscriptionPackage> findByName(String name);
}
