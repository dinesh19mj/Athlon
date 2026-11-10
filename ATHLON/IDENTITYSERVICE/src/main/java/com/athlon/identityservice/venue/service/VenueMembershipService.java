package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.subscription.enums.VenueFeatureCode;
import com.athlon.identityservice.subscription.service.SubscriptionEntitlementService;
import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.entity.*;
import com.athlon.identityservice.venue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VenueMembershipService {

    private final VenueMembershipRepository membershipRepository;
    private final VenueCustomerMembershipRepository customerMembershipRepository;
    private final VenueCustomerMembershipLedgerRepository ledgerRepository;
    private final VenueCustomerProfileRepository customerRepository;
    private final SubscriptionEntitlementService entitlementService;

    public VenueMembershipService(
            VenueMembershipRepository membershipRepository,
            VenueCustomerMembershipRepository customerMembershipRepository,
            VenueCustomerMembershipLedgerRepository ledgerRepository,
            VenueCustomerProfileRepository customerRepository,
            SubscriptionEntitlementService entitlementService
    ) {
        this.membershipRepository = membershipRepository;
        this.customerMembershipRepository = customerMembershipRepository;
        this.ledgerRepository = ledgerRepository;
        this.customerRepository = customerRepository;
        this.entitlementService = entitlementService;
    }

    @Transactional
    public VenueMembershipDto createMembershipPlan(VenueMembershipCreateRequest request) {
        entitlementService.assertFeature(request.getOrganizationUuid(), VenueFeatureCode.VENUE_MEMBERSHIPS);

        VenueMembership m = new VenueMembership(
                request.getOrganizationUuid(),
                request.getName().trim(),
                request.getDescription(),
                request.getMembershipType(),
                request.getTotalCredits(),
                request.getPrice(),
                request.getValidityDays()
        );
        m.setEligibleFacilities(request.getEligibleFacilities() != null ? request.getEligibleFacilities() : "ALL");

        VenueMembership saved = membershipRepository.save(m);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<VenueMembershipDto> getMembershipPlans(UUID organizationUuid) {
        return membershipRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VenueCustomerMembershipDto assignMembership(AssignMembershipRequest request) {
        entitlementService.assertFeature(request.getOrganizationUuid(), VenueFeatureCode.VENUE_MEMBERSHIPS);

        VenueCustomerProfile customer = customerRepository.findByCustomerUuid(request.getCustomerUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with UUID: " + request.getCustomerUuid()));

        VenueMembership plan = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership Plan not found with ID: " + request.getMembershipId()));

        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(plan.getValidityDays());

        VenueCustomerMembership cm = new VenueCustomerMembership(
                request.getOrganizationUuid(),
                customer.getCustomerId(),
                customer.getCustomerUuid(),
                plan.getMembershipId(),
                start,
                end,
                plan.getTotalCredits()
        );

        VenueCustomerMembership saved = customerMembershipRepository.save(cm);

        // Record credit purchase in immutable ledger
        VenueCustomerMembershipLedger ledger = new VenueCustomerMembershipLedger(
                saved.getCustomerMembershipId(),
                customer.getCustomerId(),
                null,
                "CREDIT_PURCHASE",
                plan.getTotalCredits(),
                plan.getTotalCredits(),
                "Initial purchase of " + plan.getName()
        );
        ledgerRepository.save(ledger);

        return mapToCustomerMembershipDto(saved, customer, plan);
    }

    @Transactional(readOnly = true)
    public List<VenueCustomerMembershipDto> getActiveMembershipsForCustomer(UUID customerUuid) {
        List<VenueCustomerMembership> memberships = customerMembershipRepository.findByCustomerUuidAndStatus(customerUuid, "ACTIVE");
        return memberships.stream().map(cm -> {
            VenueCustomerProfile cust = customerRepository.findById(cm.getCustomerId()).orElse(null);
            VenueMembership plan = membershipRepository.findById(cm.getMembershipId()).orElse(null);
            return mapToCustomerMembershipDto(cm, cust, plan);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VenueCustomerMembershipDto> getAllCustomerMemberships(UUID organizationUuid) {
        List<VenueCustomerMembership> list = customerMembershipRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        return list.stream().map(cm -> {
            VenueCustomerProfile cust = customerRepository.findById(cm.getCustomerId()).orElse(null);
            VenueMembership plan = membershipRepository.findById(cm.getMembershipId()).orElse(null);
            return mapToCustomerMembershipDto(cm, cust, plan);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deductCredits(Long customerMembershipId, Long bookingId, BigDecimal credits, String notes) {
        VenueCustomerMembership cm = customerMembershipRepository.findByIdForUpdate(customerMembershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer Membership not found with ID: " + customerMembershipId));

        if (!"ACTIVE".equals(cm.getStatus())) {
            throw new IllegalStateException("Membership is not active (Status: " + cm.getStatus() + ")");
        }

        if (cm.getRemainingCredits().compareTo(credits) < 0) {
            throw new IllegalStateException("Insufficient membership credits. Available: " + cm.getRemainingCredits() + ", Required: " + credits);
        }

        BigDecimal balanceAfter = cm.getRemainingCredits().subtract(credits);
        cm.setRemainingCredits(balanceAfter);

        if (balanceAfter.compareTo(BigDecimal.ZERO) == 0) {
            cm.setStatus("EXHAUSTED");
        }

        customerMembershipRepository.save(cm);

        VenueCustomerMembershipLedger ledger = new VenueCustomerMembershipLedger(
                cm.getCustomerMembershipId(),
                cm.getCustomerId(),
                bookingId,
                "HOURLY_DEDUCTION",
                credits.negate(),
                balanceAfter,
                notes != null ? notes : "Deduction for court booking"
        );
        ledgerRepository.save(ledger);
    }

    private VenueMembershipDto mapToDto(VenueMembership m) {
        VenueMembershipDto dto = new VenueMembershipDto();
        dto.setMembershipId(m.getMembershipId());
        dto.setMembershipUuid(m.getMembershipUuid());
        dto.setOrganizationUuid(m.getOrganizationUuid());
        dto.setName(m.getName());
        dto.setDescription(m.getDescription());
        dto.setMembershipType(m.getMembershipType());
        dto.setTotalCredits(m.getTotalCredits());
        dto.setPrice(m.getPrice());
        dto.setValidityDays(m.getValidityDays());
        dto.setEligibleFacilities(m.getEligibleFacilities());
        dto.setIsActive(m.getIsActive());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    private VenueCustomerMembershipDto mapToCustomerMembershipDto(VenueCustomerMembership cm, VenueCustomerProfile cust, VenueMembership plan) {
        VenueCustomerMembershipDto dto = new VenueCustomerMembershipDto();
        dto.setCustomerMembershipId(cm.getCustomerMembershipId());
        dto.setCustomerMembershipUuid(cm.getCustomerMembershipUuid());
        dto.setOrganizationUuid(cm.getOrganizationUuid());
        dto.setCustomerId(cm.getCustomerId());
        dto.setCustomerUuid(cm.getCustomerUuid());
        if (cust != null) {
            dto.setCustomerName(cust.getGuestName());
            dto.setCustomerPhone(cust.getGuestPhone());
        }
        dto.setMembershipId(cm.getMembershipId());
        if (plan != null) {
            dto.setMembershipName(plan.getName());
            dto.setMembershipType(plan.getMembershipType());
        }
        dto.setStartDate(cm.getStartDate());
        dto.setEndDate(cm.getEndDate());
        dto.setRemainingCredits(cm.getRemainingCredits());
        dto.setStatus(cm.getStatus());
        dto.setCreatedAt(cm.getCreatedAt());
        return dto;
    }
}

