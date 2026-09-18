package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.entity.*;
import com.athlon.identityservice.venue.enums.*;
import com.athlon.identityservice.venue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private final VenueFacilityRepository facilityRepository;
    private final VenueRepository venueRepository;
    private final FacilitySportRepository sportRepository;
    private final FacilityAvailabilityRuleRepository availabilityRuleRepository;
    private final FacilityPricingRuleRepository pricingRuleRepository;
    private final FacilityBlockRepository blockRepository;
    private final FacilityMaintenanceRepository maintenanceRepository;

    public FacilityService(
            VenueFacilityRepository facilityRepository,
            VenueRepository venueRepository,
            FacilitySportRepository sportRepository,
            FacilityAvailabilityRuleRepository availabilityRuleRepository,
            FacilityPricingRuleRepository pricingRuleRepository,
            FacilityBlockRepository blockRepository,
            FacilityMaintenanceRepository maintenanceRepository
    ) {
        this.facilityRepository = facilityRepository;
        this.venueRepository = venueRepository;
        this.sportRepository = sportRepository;
        this.availabilityRuleRepository = availabilityRuleRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.blockRepository = blockRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Transactional
    public FacilityDto createFacility(FacilityCreateRequest request, Long performedByUserId) {
        Venue venue;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + request.getVenueId()));
        } else if (request.getVenueUuid() != null) {
            venue = venueRepository.findByVenueUuid(request.getVenueUuid())
                    .orElseThrow(() -> new IllegalArgumentException("Venue not found with UUID: " + request.getVenueUuid()));
        } else {
            throw new IllegalArgumentException("Venue ID or UUID is required.");
        }

        VenueFacility facility = new VenueFacility();
        facility.setFacilityUuid(UUID.randomUUID());
        facility.setVenueId(venue.getVenueId());
        facility.setVenueUuid(venue.getVenueUuid());
        facility.setName(request.getName() != null && !request.getName().trim().isEmpty() ? request.getName().trim() : "Court 1");
        facility.setDescription(request.getDescription());
        facility.setFacilityType(request.getFacilityType() != null ? request.getFacilityType() : FacilityType.COURT);
        facility.setIndoorOutdoor(request.getIndoorOutdoor() != null ? request.getIndoorOutdoor() : "INDOOR");
        facility.setSurfaceType(request.getSurfaceType() != null ? request.getSurfaceType() : SurfaceType.SYNTHETIC);
        facility.setCapacity(request.getCapacity() != null ? request.getCapacity() : 1);
        facility.setBookingEnabled(request.getBookingEnabled() != null ? request.getBookingEnabled() : true);
        facility.setSlotDurationMinutes(request.getSlotDurationMinutes() != null ? request.getSlotDurationMinutes() : 60);
        facility.setMinimumBookingMinutes(request.getMinimumBookingMinutes() != null ? request.getMinimumBookingMinutes() : 60);
        facility.setMaximumBookingMinutes(request.getMaximumBookingMinutes() != null ? request.getMaximumBookingMinutes() : 180);
        facility.setAdvanceBookingDays(request.getAdvanceBookingDays() != null ? request.getAdvanceBookingDays() : 14);
        facility.setCancellationEnabled(request.getCancellationEnabled() != null ? request.getCancellationEnabled() : true);
        facility.setStatus(request.getStatus() != null ? request.getStatus() : FacilityStatus.ACTIVE);
        facility.setCreatedBy(performedByUserId);

        VenueFacility saved = facilityRepository.save(facility);

        // Save Sports
        if (request.getSports() != null) {
            for (FacilityCreateRequest.SportInput s : request.getSports()) {
                FacilitySport sport = new FacilitySport(saved.getFacilityId(), s.getSportId(), s.getSportName(), s.getIsPrimary());
                sportRepository.save(sport);
            }
        }

        // Save Availability Rules
        if (request.getAvailabilityRules() != null) {
            for (FacilityCreateRequest.AvailabilityRuleInput r : request.getAvailabilityRules()) {
                DayOfWeek dow = parseDayOfWeek(r.getDayOfWeek());
                FacilityAvailabilityRule rule = new FacilityAvailabilityRule(
                        saved.getFacilityId(), dow, r.getAvailableFrom(), r.getAvailableTo(),
                        r.getSlotDurationMinutes(), r.getIsActive(), r.getEffectiveFrom(), r.getEffectiveTo()
                );
                availabilityRuleRepository.save(rule);
            }
        }

        // Save Pricing Rules
        if (request.getPricingRules() != null) {
            for (FacilityCreateRequest.PricingRuleInput p : request.getPricingRules()) {
                DayOfWeek dow = p.getDayOfWeek() != null && !p.getDayOfWeek().trim().isEmpty() ? parseDayOfWeek(p.getDayOfWeek()) : null;
                FacilityPricingRule rule = new FacilityPricingRule(
                        saved.getFacilityId(), p.getPricingType(), dow, p.getStartTime(), p.getEndTime(),
                        p.getPrice(), p.getDurationMinutes(), p.getEffectiveFrom(), p.getEffectiveTo(),
                        p.getPriority(), p.getIsActive()
                );
                pricingRuleRepository.save(rule);
            }
        }

        return getFacilityByUuid(saved.getFacilityUuid());
    }

    @Transactional
    public FacilityDto updateFacility(UUID facilityUuid, FacilityCreateRequest request, Long performedByUserId) {
        VenueFacility facility = facilityRepository.findByFacilityUuid(facilityUuid)
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with UUID: " + facilityUuid));

        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        facility.setFacilityType(request.getFacilityType());
        facility.setIndoorOutdoor(request.getIndoorOutdoor());
        facility.setSurfaceType(request.getSurfaceType());
        if (request.getCapacity() != null) facility.setCapacity(request.getCapacity());
        if (request.getBookingEnabled() != null) facility.setBookingEnabled(request.getBookingEnabled());
        if (request.getSlotDurationMinutes() != null) facility.setSlotDurationMinutes(request.getSlotDurationMinutes());
        if (request.getMinimumBookingMinutes() != null) facility.setMinimumBookingMinutes(request.getMinimumBookingMinutes());
        if (request.getMaximumBookingMinutes() != null) facility.setMaximumBookingMinutes(request.getMaximumBookingMinutes());
        if (request.getAdvanceBookingDays() != null) facility.setAdvanceBookingDays(request.getAdvanceBookingDays());
        if (request.getCancellationEnabled() != null) facility.setCancellationEnabled(request.getCancellationEnabled());
        if (request.getStatus() != null) facility.setStatus(request.getStatus());
        facility.setUpdatedBy(performedByUserId);

        facilityRepository.save(facility);

        if (request.getSports() != null) {
            sportRepository.deleteByFacilityId(facility.getFacilityId());
            for (FacilityCreateRequest.SportInput s : request.getSports()) {
                sportRepository.save(new FacilitySport(facility.getFacilityId(), s.getSportId(), s.getSportName(), s.getIsPrimary()));
            }
        }

        if (request.getAvailabilityRules() != null) {
            availabilityRuleRepository.deleteByFacilityId(facility.getFacilityId());
            for (FacilityCreateRequest.AvailabilityRuleInput r : request.getAvailabilityRules()) {
                DayOfWeek dow = parseDayOfWeek(r.getDayOfWeek());
                availabilityRuleRepository.save(new FacilityAvailabilityRule(
                        facility.getFacilityId(), dow, r.getAvailableFrom(), r.getAvailableTo(),
                        r.getSlotDurationMinutes(), r.getIsActive(), r.getEffectiveFrom(), r.getEffectiveTo()
                ));
            }
        }

        if (request.getPricingRules() != null) {
            pricingRuleRepository.deleteByFacilityId(facility.getFacilityId());
            for (FacilityCreateRequest.PricingRuleInput p : request.getPricingRules()) {
                DayOfWeek dow = p.getDayOfWeek() != null && !p.getDayOfWeek().trim().isEmpty() ? parseDayOfWeek(p.getDayOfWeek()) : null;
                pricingRuleRepository.save(new FacilityPricingRule(
                        facility.getFacilityId(), p.getPricingType(), dow, p.getStartTime(), p.getEndTime(),
                        p.getPrice(), p.getDurationMinutes(), p.getEffectiveFrom(), p.getEffectiveTo(),
                        p.getPriority(), p.getIsActive()
                ));
            }
        }

        return getFacilityByUuid(facility.getFacilityUuid());
    }

    @Transactional(readOnly = true)
    public FacilityDto getFacilityByUuid(UUID facilityUuid) {
        VenueFacility facility = facilityRepository.findByFacilityUuid(facilityUuid)
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with UUID: " + facilityUuid));
        Venue venue = venueRepository.findById(facility.getVenueId()).orElse(null);
        return mapToDto(facility, venue != null ? venue.getName() : "");
    }

    @Transactional(readOnly = true)
    public List<FacilityDto> getFacilitiesByVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));
        List<VenueFacility> facilities = facilityRepository.findByVenueId(venueId);
        return facilities.stream().map(f -> mapToDto(f, venue.getName())).collect(Collectors.toList());
    }

    // Blocks
    @Transactional
    public FacilityBlockDto createBlock(FacilityBlockCreateRequest request, Long performedByUserId) {
        VenueFacility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + request.getFacilityId()));

        FacilityBlock block = new FacilityBlock();
        block.setVenueId(facility.getVenueId());
        block.setFacilityId(facility.getFacilityId());
        block.setBlockType(request.getBlockType());
        block.setBlockDate(request.getBlockDate());
        block.setStartTime(request.getStartTime());
        block.setEndTime(request.getEndTime());
        block.setReason(request.getReason());
        block.setNotes(request.getNotes());
        block.setCreatedBy(performedByUserId);

        FacilityBlock saved = blockRepository.save(block);
        return mapBlockToDto(saved, facility.getName());
    }

    @Transactional(readOnly = true)
    public List<FacilityBlockDto> getBlocksByVenue(Long venueId, LocalDate startDate, LocalDate endDate) {
        List<FacilityBlock> blocks;
        if (startDate != null && endDate != null) {
            blocks = blockRepository.findByVenueIdAndBlockDateBetween(venueId, startDate, endDate);
        } else {
            blocks = blockRepository.findByVenueId(venueId);
        }
        return blocks.stream().map(b -> {
            VenueFacility fac = facilityRepository.findById(b.getFacilityId()).orElse(null);
            return mapBlockToDto(b, fac != null ? fac.getName() : "");
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBlock(UUID blockUuid) {
        FacilityBlock block = blockRepository.findByBlockUuid(blockUuid)
                .orElseThrow(() -> new IllegalArgumentException("Block not found with UUID: " + blockUuid));
        blockRepository.delete(block);
    }

    // Maintenance
    @Transactional
    public FacilityMaintenanceDto createMaintenance(FacilityMaintenanceCreateRequest request, Long performedByUserId) {
        VenueFacility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + request.getFacilityId()));

        FacilityMaintenance m = new FacilityMaintenance();
        m.setFacilityId(facility.getFacilityId());
        m.setMaintenanceType(request.getMaintenanceType());
        m.setStartDateTime(request.getStartDateTime());
        m.setEndDateTime(request.getEndDateTime());
        m.setDescription(request.getDescription());
        m.setStatus("SCHEDULED");
        m.setCreatedBy(performedByUserId);

        FacilityMaintenance saved = maintenanceRepository.save(m);
        return mapMaintenanceToDto(saved, facility.getName());
    }

    @Transactional(readOnly = true)
    public List<FacilityMaintenanceDto> getMaintenanceByFacility(Long facilityId) {
        VenueFacility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + facilityId));
        List<FacilityMaintenance> list = maintenanceRepository.findByFacilityId(facilityId);
        return list.stream().map(m -> mapMaintenanceToDto(m, facility.getName())).collect(Collectors.toList());
    }

    private DayOfWeek parseDayOfWeek(String dow) {
        if (dow == null || dow.trim().isEmpty()) return DayOfWeek.MONDAY;
        try {
            return DayOfWeek.valueOf(dow.toUpperCase().trim());
        } catch (Exception e) {
            return DayOfWeek.MONDAY;
        }
    }

    private FacilityDto mapToDto(VenueFacility f, String venueName) {
        FacilityDto dto = new FacilityDto();
        dto.setFacilityId(f.getFacilityId());
        dto.setFacilityUuid(f.getFacilityUuid());
        dto.setVenueId(f.getVenueId());
        dto.setVenueUuid(f.getVenueUuid());
        dto.setVenueName(venueName);
        dto.setName(f.getName());
        dto.setDescription(f.getDescription());
        dto.setFacilityType(f.getFacilityType());
        dto.setIndoorOutdoor(f.getIndoorOutdoor());
        dto.setSurfaceType(f.getSurfaceType());
        dto.setCapacity(f.getCapacity());
        dto.setBookingEnabled(f.getBookingEnabled());
        dto.setSlotDurationMinutes(f.getSlotDurationMinutes());
        dto.setMinimumBookingMinutes(f.getMinimumBookingMinutes());
        dto.setMaximumBookingMinutes(f.getMaximumBookingMinutes());
        dto.setAdvanceBookingDays(f.getAdvanceBookingDays());
        dto.setCancellationEnabled(f.getCancellationEnabled());
        dto.setStatus(f.getStatus());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setUpdatedAt(f.getUpdatedAt());

        // Sports
        List<FacilitySport> sports = sportRepository.findByFacilityId(f.getFacilityId());
        dto.setSports(sports.stream().map(s -> new FacilityDto.SportDto(
                s.getId(), s.getSportId(), s.getSportName(), s.getIsPrimary()
        )).collect(Collectors.toList()));

        // Availability Rules
        List<FacilityAvailabilityRule> rules = availabilityRuleRepository.findByFacilityId(f.getFacilityId());
        dto.setAvailabilityRules(rules.stream().map(r -> new FacilityDto.AvailabilityRuleDto(
                r.getId(), r.getDayOfWeek() != null ? r.getDayOfWeek().name() : "MONDAY", r.getAvailableFrom(), r.getAvailableTo(),
                r.getSlotDurationMinutes(), r.getIsActive(), r.getEffectiveFrom(), r.getEffectiveTo()
        )).collect(Collectors.toList()));

        // Pricing Rules
        List<FacilityPricingRule> pricingRules = pricingRuleRepository.findByFacilityId(f.getFacilityId());
        dto.setPricingRules(pricingRules.stream().map(p -> new FacilityDto.PricingRuleDto(
                p.getId(), p.getPricingType(), p.getDayOfWeek() != null ? p.getDayOfWeek().name() : null, p.getStartTime(), p.getEndTime(),
                p.getPrice(), p.getDurationMinutes(), p.getEffectiveFrom(), p.getEffectiveTo(),
                p.getPriority(), p.getIsActive()
        )).collect(Collectors.toList()));

        return dto;
    }

    private FacilityBlockDto mapBlockToDto(FacilityBlock b, String facilityName) {
        FacilityBlockDto dto = new FacilityBlockDto();
        dto.setId(b.getId());
        dto.setBlockUuid(b.getBlockUuid());
        dto.setVenueId(b.getVenueId());
        dto.setFacilityId(b.getFacilityId());
        dto.setFacilityName(facilityName);
        dto.setBlockType(b.getBlockType());
        dto.setBlockDate(b.getBlockDate());
        dto.setStartTime(b.getStartTime());
        dto.setEndTime(b.getEndTime());
        dto.setReason(b.getReason());
        dto.setNotes(b.getNotes());
        dto.setCreatedBy(b.getCreatedBy());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }

    private FacilityMaintenanceDto mapMaintenanceToDto(FacilityMaintenance m, String facilityName) {
        FacilityMaintenanceDto dto = new FacilityMaintenanceDto();
        dto.setId(m.getId());
        dto.setMaintenanceUuid(m.getMaintenanceUuid());
        dto.setFacilityId(m.getFacilityId());
        dto.setFacilityName(facilityName);
        dto.setMaintenanceType(m.getMaintenanceType());
        dto.setStartDateTime(m.getStartDateTime());
        dto.setEndDateTime(m.getEndDateTime());
        dto.setDescription(m.getDescription());
        dto.setStatus(m.getStatus());
        dto.setCreatedBy(m.getCreatedBy());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());
        return dto;
    }
}
