package com.athlon.identityservice.venue.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.venue.dto.AssignMembershipRequest;
import com.athlon.identityservice.venue.dto.VenueCustomerMembershipDto;
import com.athlon.identityservice.venue.dto.VenueMembershipCreateRequest;
import com.athlon.identityservice.venue.dto.VenueMembershipDto;
import com.athlon.identityservice.venue.service.VenueMembershipService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/venues/memberships")
public class VenueMembershipController {

    private final VenueMembershipService membershipService;

    public VenueMembershipController(VenueMembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<VenueMembershipDto>> createPlan(@Valid @RequestBody VenueMembershipCreateRequest request) {
        VenueMembershipDto result = membershipService.createMembershipPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Membership package created successfully", result));
    }

    @GetMapping({"/plans/organization/{orgUuid}", "/plans/organizations/{orgUuid}"})
    public ResponseEntity<ApiResponse<List<VenueMembershipDto>>> getPlans(@PathVariable("orgUuid") UUID orgUuid) {
        List<VenueMembershipDto> result = membershipService.getMembershipPlans(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping({"/assign", "/customers/assign"})
    public ResponseEntity<ApiResponse<VenueCustomerMembershipDto>> assignMembership(@Valid @RequestBody AssignMembershipRequest request) {
        VenueCustomerMembershipDto result = membershipService.assignMembership(request);
        return ResponseEntity.ok(ApiResponse.success("Membership pass assigned to customer", result));
    }

    @GetMapping("/customer/{customerUuid}")
    public ResponseEntity<ApiResponse<List<VenueCustomerMembershipDto>>> getCustomerMemberships(@PathVariable("customerUuid") UUID customerUuid) {
        List<VenueCustomerMembershipDto> result = membershipService.getActiveMembershipsForCustomer(customerUuid);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping({"/organization/{orgUuid}/active", "/organization/{orgUuid}", "/customers/organization/{orgUuid}", "/customers/organizations/{orgUuid}"})
    public ResponseEntity<ApiResponse<List<VenueCustomerMembershipDto>>> getAllActiveMemberships(@PathVariable("orgUuid") UUID orgUuid) {
        List<VenueCustomerMembershipDto> result = membershipService.getAllCustomerMemberships(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

