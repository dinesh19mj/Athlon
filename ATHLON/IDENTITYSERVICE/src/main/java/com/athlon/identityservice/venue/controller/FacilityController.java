package com.athlon.identityservice.venue.controller;

import com.athlon.identityservice.venue.dto.*;
import com.athlon.identityservice.venue.service.FacilityAvailabilityService;
import com.athlon.identityservice.venue.service.FacilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/facilities")
public class FacilityController {

    private final FacilityService facilityService;
    private final FacilityAvailabilityService availabilityService;

    public FacilityController(
            FacilityService facilityService,
            FacilityAvailabilityService availabilityService
    ) {
        this.facilityService = facilityService;
        this.availabilityService = availabilityService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createFacility(
            @RequestBody FacilityCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        FacilityDto created = facilityService.createFacility(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        response.put("message", "Facility created successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{facilityUuid}")
    public ResponseEntity<Map<String, Object>> updateFacility(
            @PathVariable("facilityUuid") UUID facilityUuid,
            @RequestBody FacilityCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        FacilityDto updated = facilityService.updateFacility(facilityUuid, request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Facility updated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{facilityUuid}")
    public ResponseEntity<Map<String, Object>> getFacilityByUuid(@PathVariable("facilityUuid") UUID facilityUuid) {
        FacilityDto facility = facilityService.getFacilityByUuid(facilityUuid);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", facility);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<Map<String, Object>> getFacilitiesByVenue(@PathVariable("venueId") Long venueId) {
        List<FacilityDto> facilities = facilityService.getFacilitiesByVenue(venueId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", facilities);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{facilityId}/availability")
    public ResponseEntity<Map<String, Object>> getFacilityAvailability(
            @PathVariable("facilityId") Long facilityId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        FacilityAvailabilityResponse avail = availabilityService.getFacilityAvailability(facilityId, date);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", avail);
        return ResponseEntity.ok(response);
    }

    // Blocks
    @PostMapping("/blocks")
    public ResponseEntity<Map<String, Object>> createBlock(
            @RequestBody FacilityBlockCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        FacilityBlockDto block = facilityService.createBlock(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", block);
        response.put("message", "Facility block created successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/blocks/venue/{venueId}")
    public ResponseEntity<Map<String, Object>> getBlocksByVenue(
            @PathVariable("venueId") Long venueId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<FacilityBlockDto> blocks = facilityService.getBlocksByVenue(venueId, startDate, endDate);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", blocks);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/blocks/{blockUuid}")
    public ResponseEntity<Map<String, Object>> deleteBlock(@PathVariable("blockUuid") UUID blockUuid) {
        facilityService.deleteBlock(blockUuid);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Block deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Maintenance
    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> createMaintenance(
            @RequestBody FacilityMaintenanceCreateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        FacilityMaintenanceDto maintenance = facilityService.createMaintenance(request, userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", maintenance);
        response.put("message", "Maintenance scheduled successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/maintenance/facility/{facilityId}")
    public ResponseEntity<Map<String, Object>> getMaintenanceByFacility(@PathVariable("facilityId") Long facilityId) {
        List<FacilityMaintenanceDto> list = facilityService.getMaintenanceByFacility(facilityId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        return ResponseEntity.ok(response);
    }
}
