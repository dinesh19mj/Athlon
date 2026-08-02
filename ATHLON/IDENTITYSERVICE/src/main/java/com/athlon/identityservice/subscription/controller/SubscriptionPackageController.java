package com.athlon.identityservice.subscription.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.subscription.model.SubscriptionPackage;
import com.athlon.identityservice.subscription.service.SubscriptionPackageService;

import java.util.List;

@RestController
@RequestMapping("/subscriptionPackage")
public class SubscriptionPackageController {

    @Autowired
    private SubscriptionPackageService subscriptionPackageService;

    @PostMapping("/createPackage")
    public ResponseEntity<SubscriptionPackage> createPackage(@RequestBody SubscriptionPackage subPackage) {
        try {
            SubscriptionPackage createdPackage = subscriptionPackageService.createPackage(subPackage);
            return new ResponseEntity<>(createdPackage, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getAllPackages")
    public ResponseEntity<List<SubscriptionPackage>> getAllPackages() {
        try {
            List<SubscriptionPackage> packages = subscriptionPackageService.getAllPackages();
            return new ResponseEntity<>(packages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getPackagesByType/{workspaceType}")
    public ResponseEntity<List<SubscriptionPackage>> getPackagesByType(@PathVariable("workspaceType") String workspaceType) {
        try {
            List<SubscriptionPackage> packages = subscriptionPackageService.getPackagesByWorkspaceType(workspaceType);
            return new ResponseEntity<>(packages, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
