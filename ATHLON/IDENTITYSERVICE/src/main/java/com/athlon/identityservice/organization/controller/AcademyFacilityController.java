package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.CreateFacilityRequest;
import com.athlon.identityservice.organization.dto.request.UpdateFacilityRequest;
import com.athlon.identityservice.organization.dto.response.AcademyFacilityResponse;
import com.athlon.identityservice.organization.service.AcademyFacilityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/facilities")
public class AcademyFacilityController {

    private final AcademyFacilityService facilityService;

    public AcademyFacilityController(AcademyFacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyFacilityResponse>>> getFacilities(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "centreUuid", required = false) UUID centreUuid,
            @RequestParam(value = "sportType", required = false) String sportType,
            @RequestParam(value = "status", required = false) String status) {

        List<AcademyFacilityResponse> list = facilityService.getFacilities(organizationUuid, centreUuid, sportType, status);
        return ResponseEntity.ok(ApiResponse.success("Academy facilities retrieved successfully", list));
    }

    @GetMapping("/{facilityUuid}")
    public ResponseEntity<ApiResponse<AcademyFacilityResponse>> getFacility(
            @PathVariable("facilityUuid") UUID facilityUuid) {

        AcademyFacilityResponse facility = facilityService.getFacilityByUuid(facilityUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy facility retrieved successfully", facility));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AcademyFacilityResponse>> createFacility(
            @Valid @RequestBody CreateFacilityRequest request) {

        AcademyFacilityResponse facility = facilityService.createFacility(request);
        return ResponseEntity.ok(ApiResponse.success("Academy facility created successfully", facility));
    }

    @PostMapping("/update/{facilityUuid}")
    public ResponseEntity<ApiResponse<AcademyFacilityResponse>> updateFacility(
            @PathVariable("facilityUuid") UUID facilityUuid,
            @Valid @RequestBody UpdateFacilityRequest request) {

        AcademyFacilityResponse facility = facilityService.updateFacility(facilityUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Academy facility updated successfully", facility));
    }

    @PostMapping("/delete/{facilityUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(
            @PathVariable("facilityUuid") UUID facilityUuid) {

        facilityService.deleteFacility(facilityUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy facility deleted successfully", null));
    }
}
