package com.athlon.identityservice.organization.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.organization.model.Organization;
import com.athlon.identityservice.organization.model.OrganizationMember;
import com.athlon.identityservice.organization.service.OrganizationService;

import java.util.List;

@RestController
@RequestMapping("/organization")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @PostMapping("/createOrganization")
    public ResponseEntity<Organization> createOrganization(@RequestBody Organization organization) {
        try {
            Organization createdOrg = organizationService.createOrganization(organization);
            return new ResponseEntity<>(createdOrg, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/updateOrganization/{orgId}")
    public ResponseEntity<Organization> updateOrganization(
            @PathVariable("orgId") Long orgId,
            @RequestBody Organization orgDetails) {
        try {
            Organization updatedOrg = organizationService.updateOrganization(orgId, orgDetails);
            return new ResponseEntity<>(updatedOrg, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/updateSubscription/{orgId}")
    public ResponseEntity<Organization> updateSubscription(
            @PathVariable("orgId") Long orgId,
            @RequestParam("status") String status,
            @RequestParam(value = "paymentRef", required = false) String paymentRef) {
        try {
            Organization updatedOrg = organizationService.updateSubscriptionStatus(orgId, status, paymentRef);
            return new ResponseEntity<>(updatedOrg, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getOrganizationById/{orgId}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable("orgId") Long orgId) {
        try {
            Organization org = organizationService.getOrganizationById(orgId);
            return new ResponseEntity<>(org, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/getAllOrganizations")
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        try {
            List<Organization> orgs = organizationService.getAllOrganizations();
            return new ResponseEntity<>(orgs, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/addMember/{orgId}")
    public ResponseEntity<OrganizationMember> addMember(
            @PathVariable("orgId") Long orgId,
            @RequestParam("playerId") Long playerId,
            @RequestParam("role") String role) {
        try {
            OrganizationMember member = organizationService.addMemberToOrganization(orgId, playerId, role);
            return new ResponseEntity<>(member, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getMembers/{orgId}")
    public ResponseEntity<List<OrganizationMember>> getMembers(@PathVariable("orgId") Long orgId) {
        try {
            List<OrganizationMember> members = organizationService.getOrganizationMembers(orgId);
            return new ResponseEntity<>(members, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
