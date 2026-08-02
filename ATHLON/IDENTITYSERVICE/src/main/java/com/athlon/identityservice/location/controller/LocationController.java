package com.athlon.identityservice.location.controller;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.request.CountryRequest;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.location.dto.request.StateRequest;
import com.athlon.identityservice.location.dto.response.CountryResponse;
import com.athlon.identityservice.location.dto.response.StateResponse;
import com.athlon.identityservice.location.service.LocationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/countries/create")
    public ResponseEntity<ApiResponse<CountryResponse>> createCountry(@Valid @RequestBody CountryRequest request) {
        Long currentUserId = 1L;
        CountryResponse response = locationService.createCountry(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Country created successfully", response));
    }

    @GetMapping("/countries/get-all")
    public ResponseEntity<ApiResponse<List<CountryResponse>>> getAllCountries() {
        List<CountryResponse> responses = locationService.getAllCountries();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/states/create")
    public ResponseEntity<ApiResponse<StateResponse>> createState(@Valid @RequestBody StateRequest request) {
        Long currentUserId = 1L;
        StateResponse response = locationService.createState(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("State created successfully", response));
    }
}
