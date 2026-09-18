package com.athlon.identityservice.venue.controller;

import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.enums.BookingStatus;
import com.athlon.identityservice.venue.service.FacilityBookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/bookings")
public class BookingController {

    private final FacilityBookingService bookingService;

    public BookingController(FacilityBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestBody BookingCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        BookingDto booking = bookingService.createBooking(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", booking);
        response.put("message", "Booking confirmed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/hold")
    public ResponseEntity<Map<String, Object>> holdSlot(
            @RequestBody BookingHoldRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        BookingDto booking = bookingService.holdSlot(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", booking);
        response.put("message", "Slot held successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingUuid}")
    public ResponseEntity<Map<String, Object>> getBookingByUuid(@PathVariable("bookingUuid") UUID bookingUuid) {
        BookingDto booking = bookingService.getBookingByUuid(bookingUuid);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", booking);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<Map<String, Object>> getBookingsByVenue(
            @PathVariable("venueId") Long venueId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<BookingDto> bookings = bookingService.getBookingsByVenue(venueId, startDate, endDate);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<Map<String, Object>> getMyBookings(
            @RequestHeader(value = "X-User-Uuid", required = false) UUID headerUserUuid,
            @RequestParam(value = "userUuid", required = false) UUID paramUserUuid
    ) {
        UUID targetUuid = headerUserUuid != null ? headerUserUuid : paramUserUuid;
        if (targetUuid == null) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("success", false);
            errorRes.put("message", "User UUID header (X-User-Uuid) or query parameter is required.");
            return ResponseEntity.badRequest().body(errorRes);
        }

        List<BookingDto> bookings = bookingService.getCustomerBookings(targetUuid);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{bookingUuid}/status")
    public ResponseEntity<Map<String, Object>> updateBookingStatus(
            @PathVariable("bookingUuid") UUID bookingUuid,
            @RequestParam("status") BookingStatus status,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        BookingDto booking = bookingService.updateBookingStatus(bookingUuid, status, reason, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", booking);
        response.put("message", "Booking status updated to " + status.name());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingUuid}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(
            @PathVariable("bookingUuid") UUID bookingUuid,
            @RequestBody(required = false) BookingCancellationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Cancelled by user";
        BookingDto booking = bookingService.cancelBooking(bookingUuid, reason, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", booking);
        response.put("message", "Booking cancelled successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingUuid}/payments")
    public ResponseEntity<Map<String, Object>> recordPayment(
            @PathVariable("bookingUuid") UUID bookingUuid,
            @RequestBody BookingPaymentCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        BookingDto booking = bookingService.recordPayment(bookingUuid, request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", booking);
        response.put("message", "Payment recorded successfully");
        return ResponseEntity.ok(response);
    }
}
