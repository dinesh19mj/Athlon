package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.subscription.enums.VenueFeatureCode;
import com.athlon.identityservice.subscription.service.SubscriptionEntitlementService;
import com.athlon.identityservice.venue.dto.VenueCustomerCreateRequest;
import com.athlon.identityservice.venue.dto.VenueCustomerDto;
import com.athlon.identityservice.venue.entity.VenueCustomerProfile;
import com.athlon.identityservice.venue.repository.VenueCustomerProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class VenueCustomerService {

    private final VenueCustomerProfileRepository customerRepository;
    private final SubscriptionEntitlementService entitlementService;

    public VenueCustomerService(
            VenueCustomerProfileRepository customerRepository,
            SubscriptionEntitlementService entitlementService
    ) {
        this.customerRepository = customerRepository;
        this.entitlementService = entitlementService;
    }

    @Transactional(readOnly = true)
    public Page<VenueCustomerDto> getCustomers(UUID organizationUuid, String query, Pageable pageable) {
        Page<VenueCustomerProfile> page;
        if (query != null && !query.trim().isEmpty()) {
            page = customerRepository.searchCustomers(organizationUuid, query.trim(), pageable);
        } else {
            page = customerRepository.findByOrganizationUuidOrderByLastBookingAtDesc(organizationUuid, pageable);
        }
        return page.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public VenueCustomerDto getCustomerByUuid(UUID customerUuid) {
        VenueCustomerProfile profile = customerRepository.findByCustomerUuid(customerUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with UUID: " + customerUuid));
        return mapToDto(profile);
    }

    @Transactional
    public VenueCustomerDto createOrUpdateCustomer(VenueCustomerCreateRequest request) {
        // Enforce CRM entitlement
        entitlementService.assertFeature(request.getOrganizationUuid(), VenueFeatureCode.VENUE_ADVANCED_CRM);

        Optional<VenueCustomerProfile> existing = customerRepository.findByOrganizationUuidAndGuestPhone(
                request.getOrganizationUuid(), request.getGuestPhone().trim()
        );

        VenueCustomerProfile profile = existing.orElseGet(() -> {
            VenueCustomerProfile p = new VenueCustomerProfile();
            p.setOrganizationUuid(request.getOrganizationUuid());
            p.setGuestPhone(request.getGuestPhone().trim());
            return p;
        });

        profile.setGuestName(request.getGuestName().trim());
        if (request.getGuestEmail() != null) profile.setGuestEmail(request.getGuestEmail().trim());
        if (request.getVipTier() != null) profile.setVipTier(request.getVipTier());
        if (request.getTags() != null) profile.setTags(request.getTags());
        if (request.getNotes() != null) profile.setNotes(request.getNotes());

        VenueCustomerProfile saved = customerRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public void recordBookingVisit(UUID organizationUuid, String name, String phone, String email, BigDecimal amount, Long userId) {
        if (organizationUuid == null || phone == null || phone.trim().isEmpty()) return;

        Optional<VenueCustomerProfile> opt = customerRepository.findByOrganizationUuidAndGuestPhone(
                organizationUuid, phone.trim()
        );

        VenueCustomerProfile profile = opt.orElseGet(() -> {
            VenueCustomerProfile p = new VenueCustomerProfile();
            p.setOrganizationUuid(organizationUuid);
            p.setGuestName(name != null && !name.trim().isEmpty() ? name.trim() : "Guest Player");
            p.setGuestPhone(phone.trim());
            p.setVipTier("STANDARD");
            p.setTotalBookings(0);
            p.setTotalSpent(BigDecimal.ZERO);
            return p;
        });

        if (email != null && !email.trim().isEmpty() && profile.getGuestEmail() == null) {
            profile.setGuestEmail(email.trim());
        }
        if (userId != null && profile.getUserId() == null) {
            profile.setUserId(userId);
        }

        profile.setTotalBookings(profile.getTotalBookings() + 1);
        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            profile.setTotalSpent(profile.getTotalSpent().add(amount));
        }
        profile.setLastBookingAt(LocalDateTime.now());

        // Automatic VIP tier elevation
        if (profile.getTotalBookings() >= 20 || profile.getTotalSpent().compareTo(BigDecimal.valueOf(15000)) >= 0) {
            profile.setVipTier("VIP");
        } else if (profile.getTotalBookings() >= 10 || profile.getTotalSpent().compareTo(BigDecimal.valueOf(7000)) >= 0) {
            profile.setVipTier("GOLD");
        } else if (profile.getTotalBookings() >= 5) {
            profile.setVipTier("SILVER");
        }

        customerRepository.save(profile);
    }

    private VenueCustomerDto mapToDto(VenueCustomerProfile p) {
        VenueCustomerDto dto = new VenueCustomerDto();
        dto.setCustomerId(p.getCustomerId());
        dto.setCustomerUuid(p.getCustomerUuid());
        dto.setOrganizationUuid(p.getOrganizationUuid());
        dto.setGuestName(p.getGuestName());
        dto.setGuestPhone(p.getGuestPhone());
        dto.setGuestEmail(p.getGuestEmail());
        dto.setVipTier(p.getVipTier());
        dto.setTags(p.getTags());
        dto.setNotes(p.getNotes());
        dto.setTotalBookings(p.getTotalBookings());
        dto.setTotalSpent(p.getTotalSpent());
        dto.setLastBookingAt(p.getLastBookingAt());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}

