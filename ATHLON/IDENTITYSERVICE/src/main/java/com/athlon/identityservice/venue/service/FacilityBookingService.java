package com.athlon.identityservice.venue.service;

import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.entity.*;
import com.athlon.identityservice.venue.enums.*;
import com.athlon.identityservice.venue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacilityBookingService {

    private final FacilityBookingRepository bookingRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final BookingPaymentRepository paymentRepository;
    private final VenueFacilityRepository facilityRepository;
    private final VenueRepository venueRepository;
    private final FacilityBlockRepository blockRepository;
    private final FacilityMaintenanceRepository maintenanceRepository;
    private final RecurringReservationRepository recurringReservationRepository;
    private final RecurringReservationExceptionRepository exceptionRepository;
    private final FacilityPricingService pricingService;
    private final FacilityAvailabilityService availabilityService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public FacilityBookingService(
            FacilityBookingRepository bookingRepository,
            BookingStatusHistoryRepository statusHistoryRepository,
            BookingPaymentRepository paymentRepository,
            VenueFacilityRepository facilityRepository,
            VenueRepository venueRepository,
            FacilityBlockRepository blockRepository,
            FacilityMaintenanceRepository maintenanceRepository,
            RecurringReservationRepository recurringReservationRepository,
            RecurringReservationExceptionRepository exceptionRepository,
            FacilityPricingService pricingService,
            FacilityAvailabilityService availabilityService
    ) {
        this.bookingRepository = bookingRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.paymentRepository = paymentRepository;
        this.facilityRepository = facilityRepository;
        this.venueRepository = venueRepository;
        this.blockRepository = blockRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.recurringReservationRepository = recurringReservationRepository;
        this.exceptionRepository = exceptionRepository;
        this.pricingService = pricingService;
        this.availabilityService = availabilityService;
    }

    /**
     * Create a confirmed booking with double-booking concurrency protection
     */
    @Transactional
    public BookingDto createBooking(BookingCreateRequest request, Long performedByUserId) {
        VenueFacility facility = resolveFacility(request.getFacilityId(), request.getFacilityUuid());
        // Acquire pessimistic write lock on facility to serialize concurrent booking attempts
        facilityRepository.findByIdForUpdate(facility.getFacilityId());

        Venue venue = venueRepository.findById(facility.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + facility.getVenueId()));

        LocalDate bookingDate = request.getBookingDate();
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();

        // Check for conflicts
        validateSlotAvailability(facility.getFacilityId(), bookingDate, startTime, endTime, null);

        FacilityBooking booking = new FacilityBooking();
        booking.setVenueId(venue.getVenueId());
        booking.setFacilityId(facility.getFacilityId());
        booking.setBookingNumber(generateBookingNumber());
        booking.setCustomerUserId(request.getCustomerUserId());
        booking.setCustomerUserUuid(request.getCustomerUserUuid());
        booking.setGuestName(request.getGuestName() != null ? request.getGuestName() : "Guest Player");
        booking.setGuestPhone(request.getGuestPhone());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setBookingDate(bookingDate);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);

        long duration = java.time.Duration.between(startTime, endTime).toMinutes();
        booking.setDurationMinutes((int) duration);
        booking.setSportName(request.getSportName());

        // Pricing calculation
        BigDecimal basePrice = request.getBaseAmount();
        if (basePrice == null || basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            basePrice = pricingService.calculatePrice(facility.getFacilityId(), bookingDate, startTime, endTime).getPrice();
        }
        booking.setBaseAmount(basePrice);
        booking.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        booking.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        booking.setTotalAmount(basePrice.subtract(booking.getDiscountAmount()).add(booking.getTaxAmount()));

        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setBookingSource(request.getBookingSource() != null ? request.getBookingSource() : BookingSource.ATHLON_APP);
        booking.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        booking.setNotes(request.getNotes());
        booking.setCreatedBy(performedByUserId);

        FacilityBooking saved = bookingRepository.save(booking);

        // Record Initial Status History
        BookingStatusHistory history = new BookingStatusHistory(
                saved.getBookingId(),
                null,
                BookingStatus.CONFIRMED,
                "Booking created via " + saved.getBookingSource().name(),
                performedByUserId
        );
        statusHistoryRepository.save(history);

        // If payment details provided, record payment
        if (request.getPaidAmount() != null && request.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            BookingPayment payment = new BookingPayment();
            payment.setBookingId(saved.getBookingId());
            payment.setAmount(request.getPaidAmount());
            payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.UPI);
            payment.setPaymentStatus(PaymentStatus.PAID);
            payment.setTransactionReference(request.getTransactionReference());
            payment.setRecordedBy(performedByUserId);
            payment.setNotes("Initial payment during booking creation");
            paymentRepository.save(payment);

            if (request.getPaidAmount().compareTo(saved.getTotalAmount()) >= 0) {
                saved.setPaymentStatus(PaymentStatus.PAID);
            } else {
                saved.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
            }
            saved = bookingRepository.save(saved);
        }

        return mapToDto(saved, facility.getName(), venue.getName());
    }

    /**
     * Temporarily hold a slot for 10 minutes during checkout flow
     */
    @Transactional
    public BookingDto holdSlot(BookingHoldRequest request, Long performedByUserId) {
        VenueFacility facility = resolveFacility(request.getFacilityId(), request.getFacilityUuid());
        // Acquire pessimistic write lock on facility to serialize concurrent booking attempts
        facilityRepository.findByIdForUpdate(facility.getFacilityId());

        Venue venue = venueRepository.findById(facility.getVenueId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + facility.getVenueId()));

        LocalDate bookingDate = request.getBookingDate();
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();

        validateSlotAvailability(facility.getFacilityId(), bookingDate, startTime, endTime, null);

        FacilityBooking holdBooking = new FacilityBooking();
        holdBooking.setVenueId(venue.getVenueId());
        holdBooking.setFacilityId(facility.getFacilityId());
        holdBooking.setBookingNumber(generateBookingNumber());
        holdBooking.setCustomerUserId(request.getCustomerUserId());
        holdBooking.setCustomerUserUuid(request.getCustomerUserUuid());
        holdBooking.setGuestName(request.getGuestName() != null ? request.getGuestName() : "Held Slot");
        holdBooking.setGuestPhone(request.getGuestPhone());
        holdBooking.setBookingDate(bookingDate);
        holdBooking.setStartTime(startTime);
        holdBooking.setEndTime(endTime);
        holdBooking.setDurationMinutes((int) java.time.Duration.between(startTime, endTime).toMinutes());
        holdBooking.setSportName(request.getSportName());

        BigDecimal basePrice = pricingService.calculatePrice(facility.getFacilityId(), bookingDate, startTime, endTime).getPrice();
        holdBooking.setBaseAmount(basePrice);
        holdBooking.setTotalAmount(basePrice);

        holdBooking.setBookingStatus(BookingStatus.HELD);
        holdBooking.setBookingSource(BookingSource.ATHLON_APP);
        holdBooking.setPaymentStatus(PaymentStatus.UNPAID);

        int holdMinutes = request.getHoldDurationMinutes() != null && request.getHoldDurationMinutes() > 0 ? request.getHoldDurationMinutes() : 10;
        holdBooking.setHoldExpiresAt(LocalDateTime.now().plusMinutes(holdMinutes));
        holdBooking.setCreatedBy(performedByUserId);

        FacilityBooking saved = bookingRepository.save(holdBooking);

        BookingStatusHistory history = new BookingStatusHistory(
                saved.getBookingId(),
                null,
                BookingStatus.HELD,
                "Slot held for checkout",
                performedByUserId
        );
        statusHistoryRepository.save(history);

        return mapToDto(saved, facility.getName(), venue.getName());
    }

    /**
     * Update booking status (e.g. CHECKED_IN, COMPLETED, NO_SHOW)
     */
    @Transactional
    public BookingDto updateBookingStatus(UUID bookingUuid, BookingStatus newStatus, String reason, Long performedByUserId) {
        FacilityBooking booking = bookingRepository.findByBookingUuid(bookingUuid)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with UUID: " + bookingUuid));

        BookingStatus previousStatus = booking.getBookingStatus();
        booking.setBookingStatus(newStatus);
        booking.setUpdatedBy(performedByUserId);

        FacilityBooking saved = bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory(
                saved.getBookingId(),
                previousStatus,
                newStatus,
                reason,
                performedByUserId
        );
        statusHistoryRepository.save(history);

        VenueFacility facility = facilityRepository.findById(saved.getFacilityId()).orElse(null);
        Venue venue = venueRepository.findById(saved.getVenueId()).orElse(null);

        return mapToDto(saved, facility != null ? facility.getName() : "", venue != null ? venue.getName() : "");
    }

    /**
     * Cancel a booking
     */
    @Transactional
    public BookingDto cancelBooking(UUID bookingUuid, String reason, Long performedByUserId) {
        FacilityBooking booking = bookingRepository.findByBookingUuid(bookingUuid)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with UUID: " + bookingUuid));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        BookingStatus previousStatus = booking.getBookingStatus();
        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledBy(performedByUserId);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedBy(performedByUserId);

        FacilityBooking saved = bookingRepository.save(booking);

        BookingStatusHistory history = new BookingStatusHistory(
                saved.getBookingId(),
                previousStatus,
                BookingStatus.CANCELLED,
                reason != null ? reason : "Cancelled by user/manager",
                performedByUserId
        );
        statusHistoryRepository.save(history);

        VenueFacility facility = facilityRepository.findById(saved.getFacilityId()).orElse(null);
        Venue venue = venueRepository.findById(saved.getVenueId()).orElse(null);

        return mapToDto(saved, facility != null ? facility.getName() : "", venue != null ? venue.getName() : "");
    }

    /**
     * Record a payment for a booking
     */
    @Transactional
    public BookingDto recordPayment(UUID bookingUuid, BookingPaymentCreateRequest request, Long performedByUserId) {
        FacilityBooking booking = bookingRepository.findByBookingUuid(bookingUuid)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with UUID: " + bookingUuid));

        BookingPayment payment = new BookingPayment();
        payment.setBookingId(booking.getBookingId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.UPI);
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setTransactionReference(request.getTransactionReference());
        payment.setRecordedBy(performedByUserId);
        payment.setNotes(request.getNotes());
        paymentRepository.save(payment);

        // Recalculate total paid
        List<BookingPayment> allPayments = paymentRepository.findByBookingIdOrderByPaidAtAsc(booking.getBookingId());
        BigDecimal totalPaid = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PAID)
                .map(BookingPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(booking.getTotalAmount()) >= 0) {
            booking.setPaymentStatus(PaymentStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            booking.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        }

        FacilityBooking saved = bookingRepository.save(booking);

        VenueFacility facility = facilityRepository.findById(saved.getFacilityId()).orElse(null);
        Venue venue = venueRepository.findById(saved.getVenueId()).orElse(null);

        return mapToDto(saved, facility != null ? facility.getName() : "", venue != null ? venue.getName() : "");
    }

    /**
     * Get booking details with history and payments
     */
    @Transactional(readOnly = true)
    public BookingDto getBookingByUuid(UUID bookingUuid) {
        FacilityBooking booking = bookingRepository.findByBookingUuid(bookingUuid)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with UUID: " + bookingUuid));

        VenueFacility facility = facilityRepository.findById(booking.getFacilityId()).orElse(null);
        Venue venue = venueRepository.findById(booking.getVenueId()).orElse(null);

        return mapToDto(booking, facility != null ? facility.getName() : "", venue != null ? venue.getName() : "");
    }

    /**
     * Get bookings by venue in date range
     */
    @Transactional(readOnly = true)
    public List<BookingDto> getBookingsByVenue(Long venueId, LocalDate startDate, LocalDate endDate) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + venueId));

        List<FacilityBooking> bookings;
        if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByVenueIdAndBookingDateBetween(venueId, startDate, endDate);
        } else {
            bookings = bookingRepository.findByVenueId(venueId);
        }

        Map<Long, String> facilityNames = facilityRepository.findByVenueId(venueId).stream()
                .collect(Collectors.toMap(VenueFacility::getFacilityId, VenueFacility::getName));

        return bookings.stream()
                .map(b -> mapToDto(b, facilityNames.getOrDefault(b.getFacilityId(), ""), venue.getName()))
                .collect(Collectors.toList());
    }

    /**
     * Get bookings by customer user UUID
     */
    @Transactional(readOnly = true)
    public List<BookingDto> getCustomerBookings(UUID customerUserUuid) {
        List<FacilityBooking> bookings = bookingRepository.findByCustomerUserUuidOrderByBookingDateDescStartTimeDesc(customerUserUuid);
        return bookings.stream()
                .map(b -> {
                    VenueFacility facility = facilityRepository.findById(b.getFacilityId()).orElse(null);
                    Venue venue = venueRepository.findById(b.getVenueId()).orElse(null);
                    return mapToDto(b, facility != null ? facility.getName() : "", venue != null ? venue.getName() : "");
                })
                .collect(Collectors.toList());
    }

    public void validateSlotAvailability(Long facilityId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
        // 1. Check existing overlapping bookings
        List<FacilityBooking> overlaps;
        if (excludeBookingId != null) {
            overlaps = bookingRepository.findOverlappingBookingsExcluding(facilityId, bookingDate, startTime, endTime, excludeBookingId);
        } else {
            overlaps = bookingRepository.findOverlappingBookings(facilityId, bookingDate, startTime, endTime);
        }
        if (!overlaps.isEmpty()) {
            throw new IllegalStateException("The selected time slot is already booked.");
        }

        // 2. Check blocks
        List<FacilityBlock> blocks = blockRepository.findByFacilityIdAndBlockDate(facilityId, bookingDate);
        for (FacilityBlock block : blocks) {
            if (startTime.isBefore(block.getEndTime()) && endTime.isAfter(block.getStartTime())) {
                throw new IllegalStateException("The selected time slot is blocked for: " + block.getReason());
            }
        }

        // 3. Check maintenance
        LocalDateTime slotStartDt = bookingDate.atTime(startTime);
        LocalDateTime slotEndDt = bookingDate.atTime(endTime);
        List<FacilityMaintenance> maintenances = maintenanceRepository.findOverlappingMaintenance(facilityId, slotStartDt, slotEndDt);
        if (!maintenances.isEmpty()) {
            throw new IllegalStateException("The selected time slot is unavailable due to scheduled maintenance.");
        }

        // 4. Check recurring reservations
        List<RecurringReservation> recurring = recurringReservationRepository.findByFacilityIdAndStatus(facilityId, ReservationStatus.ACTIVE);
        for (RecurringReservation r : recurring) {
            if (availabilityService.isRecurringReservationActiveOnDate(r, bookingDate)) {
                Optional<RecurringReservationException> exc = exceptionRepository.findByRecurringReservationIdAndOccurrenceDate(r.getRecurringReservationId(), bookingDate);
                if (exc.isPresent() && exc.get().getExceptionType() == ExceptionType.CANCELLED) {
                    continue;
                }
                if (startTime.isBefore(r.getEndTime()) && endTime.isAfter(r.getStartTime())) {
                    throw new IllegalStateException("The selected time slot is reserved for " + r.getTitle() + " (" + r.getReservationType() + ").");
                }
            }
        }
    }

    private VenueFacility resolveFacility(Long facilityId, UUID facilityUuid) {
        if (facilityId != null) {
            return facilityRepository.findById(facilityId)
                    .orElseThrow(() -> new IllegalArgumentException("Facility not found with ID: " + facilityId));
        } else if (facilityUuid != null) {
            return facilityRepository.findByFacilityUuid(facilityUuid)
                    .orElseThrow(() -> new IllegalArgumentException("Facility not found with UUID: " + facilityUuid));
        }
        throw new IllegalArgumentException("Facility ID or UUID is required.");
    }

    private String generateBookingNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 1000 + RANDOM.nextInt(9000);
        return "ATH-BK-" + datePart + "-" + rand;
    }

    private BookingDto mapToDto(FacilityBooking b, String facilityName, String venueName) {
        BookingDto dto = new BookingDto();
        dto.setBookingId(b.getBookingId());
        dto.setBookingUuid(b.getBookingUuid());
        dto.setBookingNumber(b.getBookingNumber());
        dto.setVenueId(b.getVenueId());
        dto.setFacilityId(b.getFacilityId());
        dto.setFacilityName(facilityName);
        dto.setVenueName(venueName);
        dto.setCustomerUserId(b.getCustomerUserId());
        dto.setCustomerUserUuid(b.getCustomerUserUuid());
        dto.setGuestName(b.getGuestName());
        dto.setGuestPhone(b.getGuestPhone());
        dto.setGuestEmail(b.getGuestEmail());
        dto.setBookingDate(b.getBookingDate());
        dto.setStartTime(b.getStartTime());
        dto.setEndTime(b.getEndTime());
        dto.setDurationMinutes(b.getDurationMinutes());
        dto.setSportName(b.getSportName());
        dto.setBaseAmount(b.getBaseAmount());
        dto.setDiscountAmount(b.getDiscountAmount());
        dto.setTaxAmount(b.getTaxAmount());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setBookingStatus(b.getBookingStatus());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setBookingSource(b.getBookingSource());
        dto.setHoldExpiresAt(b.getHoldExpiresAt());
        dto.setCancellationReason(b.getCancellationReason());
        dto.setCancelledBy(b.getCancelledBy());
        dto.setCancelledAt(b.getCancelledAt());
        dto.setNotes(b.getNotes());
        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());

        // Attach histories
        List<BookingStatusHistory> histories = statusHistoryRepository.findByBookingIdOrderByChangedAtAsc(b.getBookingId());
        dto.setStatusHistories(histories.stream()
                .map(h -> new BookingDto.BookingStatusHistoryDto(
                        h.getId(), h.getPreviousStatus(), h.getNewStatus(), h.getReason(), h.getChangedBy(), h.getChangedAt()
                )).collect(Collectors.toList()));

        // Attach payments
        List<BookingPayment> payments = paymentRepository.findByBookingIdOrderByPaidAtAsc(b.getBookingId());
        dto.setPayments(payments.stream()
                .map(p -> {
                    BookingDto.BookingPaymentDto payDto = new BookingDto.BookingPaymentDto();
                    payDto.setPaymentId(p.getPaymentId());
                    payDto.setPaymentUuid(p.getPaymentUuid());
                    payDto.setBookingId(p.getBookingId());
                    payDto.setAmount(p.getAmount());
                    payDto.setPaymentMethod(p.getPaymentMethod());
                    payDto.setPaymentStatus(p.getPaymentStatus());
                    payDto.setTransactionReference(p.getTransactionReference());
                    payDto.setPaidAt(p.getPaidAt());
                    payDto.setRecordedBy(p.getRecordedBy());
                    payDto.setNotes(p.getNotes());
                    return payDto;
                }).collect(Collectors.toList()));

        return dto;
    }
}
