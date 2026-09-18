package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.entity.*;
import com.athlon.identityservice.venue.enums.ExceptionType;
import com.athlon.identityservice.venue.enums.ReservationStatus;
import com.athlon.identityservice.venue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecurringReservationService {

    private final RecurringReservationRepository reservationRepository;
    private final RecurringReservationExceptionRepository exceptionRepository;
    private final VenueFacilityRepository facilityRepository;
    private final VenueRepository venueRepository;
    private final FacilityBookingRepository bookingRepository;
    private final FacilityBlockRepository blockRepository;
    private final FacilityMaintenanceRepository maintenanceRepository;

    public RecurringReservationService(
            RecurringReservationRepository reservationRepository,
            RecurringReservationExceptionRepository exceptionRepository,
            VenueFacilityRepository facilityRepository,
            VenueRepository venueRepository,
            FacilityBookingRepository bookingRepository,
            FacilityBlockRepository blockRepository,
            FacilityMaintenanceRepository maintenanceRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.exceptionRepository = exceptionRepository;
        this.facilityRepository = facilityRepository;
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
        this.blockRepository = blockRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    /**
     * Pre-flight Conflict Analyzer for recurring series
     */
    @Transactional(readOnly = true)
    public RecurringConflictReportDto checkConflicts(RecurringConflictCheckRequest request) {
        VenueFacility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + request.getFacilityId()));

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate() != null ? request.getEndDate() : start.plusMonths(3); // default test up to 3 months
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();

        List<LocalDate> candidateDates = expandOccurrences(start, end, request.getDaysOfWeek(), request.getRepeatInterval());
        List<RecurringConflictReportDto.OccurrenceConflictDto> conflicts = new ArrayList<>();
        List<LocalDate> validDates = new ArrayList<>();

        for (LocalDate date : candidateDates) {
            boolean hasConflict = false;

            // 1. Check existing Bookings
            List<FacilityBooking> bookings = bookingRepository.findOverlappingBookings(facility.getFacilityId(), date, startTime, endTime);
            for (FacilityBooking b : bookings) {
                conflicts.add(new RecurringConflictReportDto.OccurrenceConflictDto(
                        date, startTime, endTime, "BOOKING",
                        "Customer Booking (" + (b.getGuestName() != null ? b.getGuestName() : "Confirmed") + ")",
                        b.getBookingNumber()
                ));
                hasConflict = true;
            }

            // 2. Check blocks
            List<FacilityBlock> blocks = blockRepository.findByFacilityIdAndBlockDate(facility.getFacilityId(), date);
            for (FacilityBlock blk : blocks) {
                if (startTime.isBefore(blk.getEndTime()) && endTime.isAfter(blk.getStartTime())) {
                    conflicts.add(new RecurringConflictReportDto.OccurrenceConflictDto(
                            date, startTime, endTime, "BLOCK",
                            "Admin Block: " + blk.getReason(),
                            blk.getBlockUuid().toString()
                    ));
                    hasConflict = true;
                }
            }

            // 3. Check maintenance
            LocalDateTime slotStartDt = date.atTime(startTime);
            LocalDateTime slotEndDt = date.atTime(endTime);
            List<FacilityMaintenance> maintenances = maintenanceRepository.findOverlappingMaintenance(facility.getFacilityId(), slotStartDt, slotEndDt);
            for (FacilityMaintenance m : maintenances) {
                conflicts.add(new RecurringConflictReportDto.OccurrenceConflictDto(
                        date, startTime, endTime, "MAINTENANCE",
                        "Scheduled Maintenance (" + m.getMaintenanceType() + ")",
                        m.getMaintenanceUuid().toString()
                ));
                hasConflict = true;
            }

            if (!hasConflict) {
                validDates.add(date);
            }
        }

        RecurringConflictReportDto report = new RecurringConflictReportDto();
        report.setHasConflicts(!conflicts.isEmpty());
        report.setTotalOccurrences(candidateDates.size());
        report.setConflictingOccurrencesCount(conflicts.size());
        report.setConflicts(conflicts);
        report.setValidOccurrenceDates(validDates);
        return report;
    }

    /**
     * Create a new Recurring Reservation series
     */
    @Transactional
    public RecurringReservationDto createRecurringReservation(RecurringReservationCreateRequest request, Long performedByUserId) {
        VenueFacility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + request.getFacilityId()));

        RecurringReservation r = new RecurringReservation();
        r.setVenueId(facility.getVenueId());
        r.setFacilityId(facility.getFacilityId());
        r.setReservationType(request.getReservationType());
        r.setReferenceId(request.getReferenceId());
        r.setTitle(request.getTitle());
        r.setRecurrenceType(request.getRecurrenceType());
        r.setStartDate(request.getStartDate());
        r.setEndDate(request.getEndDate());
        r.setStartTime(request.getStartTime());
        r.setEndTime(request.getEndTime());
        r.setRepeatInterval(request.getRepeatInterval() != null ? request.getRepeatInterval() : 1);
        r.setDaysOfWeek(request.getDaysOfWeek() != null ? request.getDaysOfWeek().toUpperCase() : "MONDAY");
        r.setDayOfMonth(request.getDayOfMonth());
        r.setUntilCancelled(request.getUntilCancelled() != null ? request.getUntilCancelled() : false);
        r.setStatus(ReservationStatus.ACTIVE);
        r.setNotes(request.getNotes());
        r.setCreatedBy(performedByUserId);

        RecurringReservation saved = reservationRepository.save(r);
        return mapToDto(saved, facility.getName());
    }

    /**
     * Add single-occurrence exception (override/cancel)
     */
    @Transactional
    public RecurringReservationDto addException(Long reservationId, RecurringExceptionCreateRequest request, Long performedByUserId) {
        RecurringReservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Recurring reservation not found with ID: " + reservationId));

        RecurringReservationException exc = new RecurringReservationException();
        exc.setRecurringReservationId(r.getRecurringReservationId());
        exc.setOccurrenceDate(request.getOccurrenceDate());
        exc.setExceptionType(request.getExceptionType() != null ? request.getExceptionType() : ExceptionType.CANCELLED);
        exc.setNewStartTime(request.getNewStartTime());
        exc.setNewEndTime(request.getNewEndTime());
        exc.setNewFacilityId(request.getNewFacilityId());
        exc.setReason(request.getReason());
        exc.setCreatedBy(performedByUserId);

        exceptionRepository.save(exc);

        VenueFacility facility = facilityRepository.findById(r.getFacilityId()).orElse(null);
        return mapToDto(r, facility != null ? facility.getName() : "");
    }

    /**
     * Get recurring reservations for venue
     */
    @Transactional(readOnly = true)
    public List<RecurringReservationDto> getByVenue(Long venueId) {
        List<RecurringReservation> list = reservationRepository.findByVenueId(venueId);
        Map<Long, String> facilityNames = facilityRepository.findByVenueId(venueId).stream()
                .collect(Collectors.toMap(VenueFacility::getFacilityId, VenueFacility::getName));

        return list.stream()
                .map(r -> mapToDto(r, facilityNames.getOrDefault(r.getFacilityId(), "")))
                .collect(Collectors.toList());
    }

    /**
     * Cancel or pause a series
     */
    @Transactional
    public RecurringReservationDto updateStatus(Long reservationId, ReservationStatus newStatus, Long performedByUserId) {
        RecurringReservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Recurring reservation not found with ID: " + reservationId));

        r.setStatus(newStatus);
        r.setUpdatedBy(performedByUserId);
        RecurringReservation saved = reservationRepository.save(r);

        VenueFacility facility = facilityRepository.findById(saved.getFacilityId()).orElse(null);
        return mapToDto(saved, facility != null ? facility.getName() : "");
    }

    private List<LocalDate> expandOccurrences(LocalDate start, LocalDate end, String daysOfWeekStr, Integer repeatInterval) {
        List<LocalDate> dates = new ArrayList<>();
        if (daysOfWeekStr == null || daysOfWeekStr.trim().isEmpty()) {
            return dates;
        }

        Set<String> targetDays = Arrays.stream(daysOfWeekStr.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        int intervalWeeks = (repeatInterval != null && repeatInterval > 0) ? repeatInterval : 1;
        LocalDate curr = start;

        while (!curr.isAfter(end)) {
            String dayName = curr.getDayOfWeek().name();
            if (targetDays.contains(dayName)) {
                dates.add(curr);
            }
            curr = curr.plusDays(1);
        }
        return dates;
    }

    private RecurringReservationDto mapToDto(RecurringReservation r, String facilityName) {
        RecurringReservationDto dto = new RecurringReservationDto();
        dto.setRecurringReservationId(r.getRecurringReservationId());
        dto.setRecurringReservationUuid(r.getRecurringReservationUuid());
        dto.setVenueId(r.getVenueId());
        dto.setFacilityId(r.getFacilityId());
        dto.setFacilityName(facilityName);
        dto.setReservationType(r.getReservationType());
        dto.setReferenceId(r.getReferenceId());
        dto.setTitle(r.getTitle());
        dto.setRecurrenceType(r.getRecurrenceType());
        dto.setStartDate(r.getStartDate());
        dto.setEndDate(r.getEndDate());
        dto.setStartTime(r.getStartTime());
        dto.setEndTime(r.getEndTime());
        dto.setRepeatInterval(r.getRepeatInterval());
        dto.setDaysOfWeek(r.getDaysOfWeek());
        dto.setDayOfMonth(r.getDayOfMonth());
        dto.setUntilCancelled(r.getUntilCancelled());
        dto.setStatus(r.getStatus());
        dto.setNotes(r.getNotes());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());

        List<RecurringReservationException> excs = exceptionRepository.findByRecurringReservationId(r.getRecurringReservationId());
        dto.setExceptions(excs.stream().map(e -> {
            RecurringReservationDto.ExceptionDto ed = new RecurringReservationDto.ExceptionDto();
            ed.setId(e.getId());
            ed.setOccurrenceDate(e.getOccurrenceDate());
            ed.setExceptionType(e.getExceptionType());
            ed.setNewStartTime(e.getNewStartTime());
            ed.setNewEndTime(e.getNewEndTime());
            ed.setNewFacilityId(e.getNewFacilityId());
            ed.setReason(e.getReason());
            ed.setCreatedAt(e.getCreatedAt());
            return ed;
        }).collect(Collectors.toList()));

        return dto;
    }
}
