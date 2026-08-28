package com.athlon.identityservice.location.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.request.CountryRequest;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.location.dto.request.CityRequest;
import com.athlon.identityservice.location.dto.request.DistrictRequest;
import com.athlon.identityservice.location.dto.request.StateRequest;
import com.athlon.identityservice.location.dto.response.CityResponse;
import com.athlon.identityservice.location.dto.response.CountryResponse;
import com.athlon.identityservice.location.dto.response.DistrictResponse;
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

    @GetMapping("/states/get-all")
    public ResponseEntity<ApiResponse<List<StateResponse>>> getAllStates() {
        List<StateResponse> responses = locationService.getAllStates();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/states/by-country/{countryUuid}")
    public ResponseEntity<ApiResponse<List<StateResponse>>> getStatesByCountry(@PathVariable("countryUuid") UUID countryUuid) {
        List<StateResponse> responses = locationService.getStatesByCountryUuid(countryUuid);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/districts/create")
    public ResponseEntity<ApiResponse<DistrictResponse>> createDistrict(@Valid @RequestBody DistrictRequest request) {
        Long currentUserId = 1L;
        DistrictResponse response = locationService.createDistrict(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("District created successfully", response));
    }

    @GetMapping("/districts/get-all")
    public ResponseEntity<ApiResponse<List<DistrictResponse>>> getAllDistricts() {
        List<DistrictResponse> responses = locationService.getAllDistricts();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/districts/by-state/{stateUuid}")
    public ResponseEntity<ApiResponse<List<DistrictResponse>>> getDistrictsByState(@PathVariable("stateUuid") UUID stateUuid) {
        List<DistrictResponse> responses = locationService.getDistrictsByStateUuid(stateUuid);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/districts/by-state-name/{stateName}")
    public ResponseEntity<ApiResponse<List<DistrictResponse>>> getDistrictsByStateName(@PathVariable("stateName") String stateName) {
        List<DistrictResponse> responses = locationService.getDistrictsByStateName(stateName);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/cities/create")
    public ResponseEntity<ApiResponse<CityResponse>> createCity(@Valid @RequestBody CityRequest request) {
        Long currentUserId = 1L;
        CityResponse response = locationService.createCity(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("City created successfully", response));
    }

    @GetMapping("/cities/by-district/{districtUuid}")
    public ResponseEntity<ApiResponse<List<CityResponse>>> getCitiesByDistrict(@PathVariable("districtUuid") UUID districtUuid) {
        List<CityResponse> responses = locationService.getCitiesByDistrictUuid(districtUuid);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/cities/by-district-name/{districtName}")
    public ResponseEntity<ApiResponse<List<CityResponse>>> getCitiesByDistrictName(@PathVariable("districtName") String districtName) {
        List<CityResponse> responses = locationService.getCitiesByDistrictName(districtName);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
