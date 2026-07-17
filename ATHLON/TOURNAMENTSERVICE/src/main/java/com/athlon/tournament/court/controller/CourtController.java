package com.athlon.tournament.court.controller;

import com.athlon.tournament.court.service.CourtVenueService;
import com.athlon.tournament.dto.request.CourtCreateRequest;
import com.athlon.tournament.dto.response.ApiResponse;
import com.athlon.tournament.dto.response.CourtResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tournament/courts")
public class CourtController {

    private final CourtVenueService courtVenueService;

    public CourtController(CourtVenueService courtVenueService) {
        this.courtVenueService = courtVenueService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CourtResponse>> createCourt(@Valid @RequestBody CourtCreateRequest request) {
        CourtResponse response = courtVenueService.createCourt(request);
        return new ResponseEntity<>(ApiResponse.success("Court created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/get-by-venue")
    public ResponseEntity<ApiResponse<List<CourtResponse>>> getCourtsByVenue(@RequestParam("venueId") Long venueId) {
        List<CourtResponse> response = courtVenueService.getCourtsByVenue(venueId);
        return ResponseEntity.ok(ApiResponse.success("Courts retrieved successfully", response));
    }
}
