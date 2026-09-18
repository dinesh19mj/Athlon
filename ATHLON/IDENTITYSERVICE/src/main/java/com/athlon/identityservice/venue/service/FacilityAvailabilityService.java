package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.dto.FacilityAvailabilityResponse;
import com.athlon.identityservice.venue.dto.SlotDto;
import com.athlon.identityservice.venue.dto.VenueDailyAvailabilityResponse;
import com.athlon.identityservice.venue.entity.*;
import com.athlon.identityservice.venue.enums.BookingStatus;
import com.athlon.identityservice.venue.enums.ExceptionType;
import com.athlon.identityservice.venue.enums.FacilityStatus;
import com.athlon.identityservice.venue.enums.ReservationStatus;
import com.athlon.identityservice.venue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class FacilityAvailabilityService {

    private final VenueRepository venueRepository;
    private final VenueFacilityRepository facilityRepository;
    private final VenueOperatingHourRepository operatingHourRepository;
    private final FacilityAvailabilityRuleRepository availabilityRuleRepository;
    private final FacilityBookingRepository bookingRepository;
    private final FacilityBlockRepository blockRepository;
    private final FacilityMaintenanceRepository maintenanceRepository;
    private final RecurringReservationRepository recurringReservationRepository;
    private final RecurringReservationExceptionRepository exceptionRepository;
    private final FacilityPricingService pricingService;

    public FacilityAvailabilityService(
            VenueRepository venueRepository,
            VenueFacilityRepository facilityRepository,
            VenueOperatingHourRepository operatingHourRepository,
            FacilityAvailabilityRuleRepository availabilityRuleRepository,
            FacilityBookingRepository bookingRepository,
            FacilityBlockRepository blockRepository,
            FacilityMaintenanceRepository maintenanceRepository,
            RecurringReservationRepository recurringReservationRepository,
            RecurringReservationExceptionRepository exceptionRepository,
            FacilityPricingService pricingService
    ) {
        this.venueRepository = venueRepository;
        this.facilityRepository = facilityRepository;
        this.operatingHourRepository = operatingHourRepository;
        this.availabilityRuleRepository = availabilityRuleRepository;
        this.bookingRepository = bookingRepository;
        this.blockRepository = blockRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.recurringReservationRepository = recurringReservationRepository;
        this.exceptionRepository = exceptionRepository;
        this.pricingService = pricingService;
    }

    /**
     * Authoritative availability calculation for a single facility on a date
     */
    @Transactional(readOnly = true)
    public FacilityAvailabilityResponse getFacilityAvailability(Long facilityId, LocalDate date) {
        VenueFacility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + facilityId));

        Venue venue = venueRepository.findById(facility.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + facility.getVenueId()));

        return calculateFacilitySlots(venue, facility, date);
    }

    /**
     * Authoritative availability calculation for all facilities in a venue on a date
     */
    @Transactional(readOnly = true)
    public VenueDailyAvailabilityResponse getVenueDailyAvailability(Long venueId, LocalDate date) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        List<VenueFacility> facilities = facilityRepository.findByVenueIdAndStatus(venueId, FacilityStatus.ACTIVE);
        List<FacilityAvailabilityResponse> facilityResponses = new ArrayList<>();

        for (VenueFacility fac : facilities) {
            facilityResponses.add(calculateFacilitySlots(venue, fac, date));
        }

        return new VenueDailyAvailabilityResponse(
                venue.getVenueId(),
                venue.getVenueUuid(),
                venue.getName(),
                date,
                facilityResponses
        );
    }

    private FacilityAvailabilityResponse calculateFacilitySlots(Venue venue, VenueFacility facility, LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        String dayName = dow.name();

        // 1. Determine operating window for this facility on the given day
        LocalTime windowStart = LocalTime.of(6, 0); // fallback default 6 AM
        LocalTime windowEnd = LocalTime.of(23, 0);   // fallback default 11 PM
        boolean isClosed = false;

        // Check facility availability rules first
        List<FacilityAvailabilityRule> customRules = availabilityRuleRepository.findByFacilityIdAndDayOfWeekAndIsActiveTrue(facility.getFacilityId(), dow);
        if (!customRules.isEmpty()) {
            FacilityAvailabilityRule rule = customRules.get(0);
            if (rule.getAvailableFrom() != null) windowStart = rule.getAvailableFrom();
            if (rule.getAvailableTo() != null) windowEnd = rule.getAvailableTo();
        } else {
            // Fallback to venue operating hours
            List<VenueOperatingHour> venueHours = operatingHourRepository.findByVenueId(venue.getVenueId());
            for (VenueOperatingHour h : venueHours) {
                if (h.getDayOfWeek() == dow) {
                    if (Boolean.TRUE.equals(h.getIsClosed())) {
                        isClosed = true;
                    } else {
                        if (h.getOpeningTime() != null) windowStart = h.getOpeningTime();
                        if (h.getClosingTime() != null) windowEnd = h.getClosingTime();
                    }
                    break;
                }
            }
        }

        if (windowStart == null) windowStart = LocalTime.of(6, 0);
        if (windowEnd == null) windowEnd = LocalTime.of(23, 0);
        if (!windowStart.isBefore(windowEnd)) {
            windowStart = LocalTime.of(6, 0);
            windowEnd = LocalTime.of(23, 0);
        }

        int slotDuration = facility.getSlotDurationMinutes() != null && facility.getSlotDurationMinutes() > 0 ? facility.getSlotDurationMinutes() : 60;
        List<SlotDto> slots = new ArrayList<>();

        if (isClosed || Boolean.FALSE.equals(facility.getBookingEnabled()) || facility.getStatus() == FacilityStatus.INACTIVE) {
            return new FacilityAvailabilityResponse(
                    facility.getFacilityId(),
                    facility.getFacilityUuid(),
                    facility.getName(),
                    venue.getVenueId(),
                    venue.getVenueUuid(),
                    date,
                    slotDuration,
                    slots
            );
        }

        // Fetch bookings for this facility on this date
        List<FacilityBooking> bookings = bookingRepository.findByFacilityIdAndBookingDate(facility.getFacilityId(), date);

        // Fetch blocks
        List<FacilityBlock> blocks = blockRepository.findByFacilityIdAndBlockDate(facility.getFacilityId(), date);

        // Fetch maintenance
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        List<FacilityMaintenance> maintenances = maintenanceRepository.findOverlappingMaintenance(facility.getFacilityId(), startOfDay, endOfDay);

        // Fetch recurring reservations
        List<RecurringReservation> recurringReservations = recurringReservationRepository.findByFacilityIdAndStatus(facility.getFacilityId(), ReservationStatus.ACTIVE);

        // Generate discrete slots
        LocalTime curr = windowStart;
        LocalDateTime now = LocalDateTime.now();

        while (true) {
            LocalTime slotEnd = curr.plusMinutes(slotDuration);
            // Guard against past-window bounds or midnight wrap-around (e.g. 23:00 + 60min = 00:00)
            if (slotEnd.isBefore(curr) || slotEnd.isAfter(windowEnd)) {
                break;
            }

            SlotDto slot = new SlotDto();
            slot.setStartTime(curr);
            slot.setEndTime(slotEnd);

            // Compute dynamic pricing
            FacilityPricingService.PriceCalculationResult priceResult = pricingService.calculatePrice(facility.getFacilityId(), date, curr, slotEnd);
            slot.setPrice(priceResult.getPrice());
            slot.setPricingType(priceResult.getPricingType());

            boolean occupied = false;

            // 1. Check Maintenance
            for (FacilityMaintenance m : maintenances) {
                LocalDateTime slotStartDt = date.atTime(curr);
                LocalDateTime slotEndDt = date.atTime(slotEnd);
                if (slotStartDt.isBefore(m.getEndDateTime()) && slotEndDt.isAfter(m.getStartDateTime())) {
                    slot.setIsAvailable(false);
                    slot.setStatus("MAINTENANCE");
                    slot.setReason(m.getDescription() != null ? m.getDescription() : "Scheduled Maintenance (" + m.getMaintenanceType() + ")");
                    occupied = true;
                    break;
                }
            }

            // 2. Check Blocks
            if (!occupied) {
                for (FacilityBlock b : blocks) {
                    if (curr.isBefore(b.getEndTime()) && slotEnd.isAfter(b.getStartTime())) {
                        slot.setIsAvailable(false);
                        slot.setStatus("BLOCKED");
                        slot.setReason(b.getReason());
                        slot.setBlockUuid(b.getBlockUuid());
                        occupied = true;
                        break;
                    }
                }
            }

            // 3. Check Recurring Reservations
            if (!occupied) {
                for (RecurringReservation r : recurringReservations) {
                    if (isRecurringReservationActiveOnDate(r, date)) {
                        // Check if there is an exception for this date
                        Optional<RecurringReservationException> exc = exceptionRepository.findByRecurringReservationIdAndOccurrenceDate(r.getRecurringReservationId(), date);
                        if (exc.isPresent()) {
                            RecurringReservationException e = exc.get();
                            if (e.getExceptionType() == ExceptionType.CANCELLED) {
                                continue; // Cancelled for today, slot is free from this recurring series!
                            }
                            if (e.getNewStartTime() != null && e.getNewEndTime() != null) {
                                if (curr.isBefore(e.getNewEndTime()) && slotEnd.isAfter(e.getNewStartTime())) {
                                    slot.setIsAvailable(false);
                                    slot.setStatus("RESERVED");
                                    slot.setReason(r.getTitle() + " (Rescheduled)");
                                    occupied = true;
                                    break;
                                }
                                continue;
                            }
                        }

                        // Standard recurrence time check
                        if (curr.isBefore(r.getEndTime()) && slotEnd.isAfter(r.getStartTime())) {
                            slot.setIsAvailable(false);
                            slot.setStatus("RESERVED");
                            slot.setReason(r.getTitle() + " (" + r.getReservationType() + ")");
                            occupied = true;
                            break;
                        }
                    }
                }
            }

            // 4. Check Bookings & Holds
            if (!occupied) {
                for (FacilityBooking b : bookings) {
                    if (b.getBookingStatus() == BookingStatus.CANCELLED || b.getBookingStatus() == BookingStatus.NO_SHOW) {
                        continue;
                    }
                    if (curr.isBefore(b.getEndTime()) && slotEnd.isAfter(b.getStartTime())) {
                        if (b.getBookingStatus() == BookingStatus.HELD) {
                            if (b.getHoldExpiresAt() != null && b.getHoldExpiresAt().isAfter(now)) {
                                slot.setIsAvailable(false);
                                slot.setStatus("HELD");
                                slot.setReason("Temporarily held by customer");
                                slot.setBookingUuid(b.getBookingUuid());
                                slot.setBookingNumber(b.getBookingNumber());
                                occupied = true;
                                break;
                            }
                        } else {
                            slot.setIsAvailable(false);
                            slot.setStatus("BOOKED");
                            slot.setReason("Booked (" + b.getBookingStatus() + ")");
                            slot.setBookingUuid(b.getBookingUuid());
                            slot.setBookingNumber(b.getBookingNumber());
                            slot.setCustomerName(b.getGuestName());
                            slot.setSportName(b.getSportName());
                            occupied = true;
                            break;
                        }
                    }
                }
            }

            if (!occupied) {
                slot.setIsAvailable(true);
                slot.setStatus("AVAILABLE");
            }

            slots.add(slot);
            curr = curr.plusMinutes(slotDuration);
        }

        return new FacilityAvailabilityResponse(
                facility.getFacilityId(),
                facility.getFacilityUuid(),
                facility.getName(),
                venue.getVenueId(),
                venue.getVenueUuid(),
                date,
                slotDuration,
                slots
        );
    }

    public boolean isRecurringReservationActiveOnDate(RecurringReservation r, LocalDate date) {
        if (date.isBefore(r.getStartDate())) return false;
        if (r.getEndDate() != null && date.isAfter(r.getEndDate())) return false;

        String dayName = date.getDayOfWeek().name();
        String daysOfWeek = r.getDaysOfWeek();
        if (daysOfWeek == null || !daysOfWeek.toUpperCase().contains(dayName)) {
            return false;
        }

        // Interval checks (daily, weekly)
        if ("WEEKLY".equalsIgnoreCase(r.getRecurrenceType().name())) {
            long weeksBetween = java.time.temporal.ChronoUnit.WEEKS.between(r.getStartDate(), date);
            int interval = r.getRepeatInterval() != null && r.getRepeatInterval() > 0 ? r.getRepeatInterval() : 1;
            return weeksBetween % interval == 0;
        }

        return true;
    }
}
