package com.athlon.tournamentservice.court.controller;

import com.athlon.tournamentservice.court.service.CourtVenueService;
import com.athlon.tournamentservice.dto.request.VenueCreateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.VenueResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/venues")
public class VenueController {

    private final CourtVenueService courtVenueService;

    public VenueController(CourtVenueService courtVenueService) {
        this.courtVenueService = courtVenueService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<VenueResponse>> createVenue(@Valid @RequestBody VenueCreateRequest request) {
        VenueResponse response = courtVenueService.createVenue(request);
        return new ResponseEntity<>(ApiResponse.success("Venue created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<VenueResponse>> getVenueByUuid(@PathVariable UUID uuid) {
        VenueResponse response = courtVenueService.getVenueByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Venue retrieved successfully", response));
    }
}

