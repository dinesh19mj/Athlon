package com.athlon.identityservice.venue.controller;

import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.enums.ReservationStatus;
import com.athlon.identityservice.venue.service.RecurringReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/identity/recurring-reservations")
public class RecurringReservationController {

    private final RecurringReservationService reservationService;

    public RecurringReservationController(RecurringReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/check-conflicts")
    public ResponseEntity<Map<String, Object>> checkConflicts(@RequestBody RecurringConflictCheckRequest request) {
        RecurringConflictReportDto report = reservationService.checkConflicts(request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", report);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRecurringReservation(
            @RequestBody RecurringReservationCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        RecurringReservationDto created = reservationService.createRecurringReservation(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        response.put("message", "Recurring reservation created successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<Map<String, Object>> getByVenue(@PathVariable("venueId") Long venueId) {
        List<RecurringReservationDto> list = reservationService.getByVenue(venueId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reservationId}/exceptions")
    public ResponseEntity<Map<String, Object>> addException(
            @PathVariable("reservationId") Long reservationId,
            @RequestBody RecurringExceptionCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        RecurringReservationDto updated = reservationService.addException(reservationId, request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Exception override added successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reservationId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable("reservationId") Long reservationId,
            @RequestParam("status") ReservationStatus status,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        RecurringReservationDto updated = reservationService.updateStatus(reservationId, status, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Status updated successfully");
        return ResponseEntity.ok(response);
    }
}
