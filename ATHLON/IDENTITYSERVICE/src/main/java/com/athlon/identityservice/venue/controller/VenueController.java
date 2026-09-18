package com.athlon.identityservice.venue.controller;

import com.athlon.identityservice.venue.dto.FacilityAvailabilityResponse;
import com.athlon.identityservice.venue.dto.VenueCreateRequest;
import com.athlon.identityservice.venue.dto.VenueDailyAvailabilityResponse;
import com.athlon.identityservice.venue.dto.VenueDto;
import com.athlon.identityservice.venue.dto.VenueReportSummaryDto;
import com.athlon.identityservice.venue.service.FacilityAvailabilityService;
import com.athlon.identityservice.venue.service.VenueReportService;
import com.athlon.identityservice.venue.service.VenueService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/venues")
public class VenueController {

    private final VenueService venueService;
    private final FacilityAvailabilityService availabilityService;
    private final VenueReportService reportService;

    public VenueController(
            VenueService venueService,
            FacilityAvailabilityService availabilityService,
            VenueReportService reportService
    ) {
        this.venueService = venueService;
        this.availabilityService = availabilityService;
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVenue(
            @RequestBody VenueCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        VenueDto created = venueService.createVenue(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        response.put("message", "Venue created successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{venueUuid}")
    public ResponseEntity<Map<String, Object>> updateVenue(
            @PathVariable("venueUuid") UUID venueUuid,
            @RequestBody VenueCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        VenueDto updated = venueService.updateVenue(venueUuid, request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Venue updated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{venueUuid}")
    public ResponseEntity<Map<String, Object>> getVenueByUuid(@PathVariable("venueUuid") UUID venueUuid) {
        VenueDto venue = venueService.getVenueByUuid(venueUuid);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", venue);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/organization/{orgUuid}")
    public ResponseEntity<Map<String, Object>> getVenuesByOrganization(@PathVariable("orgUuid") UUID orgUuid) {
        List<VenueDto> venues = venueService.getVenuesByOrganization(orgUuid);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", venues);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicVenues(@RequestParam(value = "city", required = false) String city) {
        List<VenueDto> venues = venueService.getPublicVenues(city);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", venues);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{venueId}/availability")
    public ResponseEntity<Map<String, Object>> getVenueAvailability(
            @PathVariable("venueId") Long venueId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        VenueDailyAvailabilityResponse dailyAvail = availabilityService.getVenueDailyAvailability(venueId, date);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", dailyAvail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{venueId}/report")
    public ResponseEntity<Map<String, Object>> getVenueReport(
            @PathVariable("venueId") Long venueId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        VenueReportSummaryDto report = reportService.getVenueReportSummary(venueId, startDate, endDate);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", report);
        return ResponseEntity.ok(response);
    }
}
