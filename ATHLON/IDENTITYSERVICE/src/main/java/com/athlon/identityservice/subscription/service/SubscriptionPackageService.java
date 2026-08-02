package com.athlon.identityservice.subscription.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.identityservice.subscription.model.SubscriptionPackage;
import com.athlon.identityservice.subscription.repository.SubscriptionPackageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubscriptionPackageService {

    @Autowired
    private SubscriptionPackageRepository subscriptionPackageRepository;

    public SubscriptionPackage createPackage(SubscriptionPackage subPackage) {
        subPackage.setCreatedOn(LocalDateTime.now());
        subPackage.setIsActive(1);
        return subscriptionPackageRepository.save(subPackage);
    }

    public List<SubscriptionPackage> getAllPackages() {
        return subscriptionPackageRepository.findAll();
    }

    public List<SubscriptionPackage> getPackagesByWorkspaceType(String workspaceType) {
        return subscriptionPackageRepository.findByWorkspaceTypeAndIsActive(workspaceType, 1);
    }
}
