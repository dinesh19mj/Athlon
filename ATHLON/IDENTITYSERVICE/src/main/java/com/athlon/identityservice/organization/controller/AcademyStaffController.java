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
import com.athlon.identityservice.organization.dto.request.AddAcademyStaffRequest;
import com.athlon.identityservice.organization.dto.response.AcademyStaffResponse;
import com.athlon.identityservice.organization.service.AcademyStaffService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/staff")
public class AcademyStaffController {

    private final AcademyStaffService staffService;

    public AcademyStaffController(AcademyStaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyStaffResponse>>> getStaff(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "type", required = false) String type) {

        List<AcademyStaffResponse> list = staffService.getStaffByOrganization(organizationUuid, type);
        return ResponseEntity.ok(ApiResponse.success("Academy staff retrieved successfully", list));
    }

    @GetMapping("/coaches/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyStaffResponse>>> getCoaches(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<AcademyStaffResponse> list = staffService.getCoaches(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy coaches retrieved successfully", list));
    }

    @GetMapping("/operations/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyStaffResponse>>> getOperationalStaff(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        List<AcademyStaffResponse> list = staffService.getOperationalStaff(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy operational staff retrieved successfully", list));
    }

    @GetMapping("/{staffUuid}")
    public ResponseEntity<ApiResponse<AcademyStaffResponse>> getStaffByUuid(
            @PathVariable("staffUuid") UUID staffUuid) {

        AcademyStaffResponse staff = staffService.getStaffByUuid(staffUuid);
        return ResponseEntity.ok(ApiResponse.success("Staff record retrieved successfully", staff));
    }

    @PostMapping("/add/{organizationUuid}")
    public ResponseEntity<ApiResponse<AcademyStaffResponse>> addStaff(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @Valid @RequestBody AddAcademyStaffRequest request) {

        AcademyStaffResponse staff = staffService.addStaffByPhone(organizationUuid, request, null);
        return ResponseEntity.ok(ApiResponse.success("Staff member added successfully", staff));
    }

    @PostMapping("/remove/{organizationUuid}/{staffUuid}")
    public ResponseEntity<ApiResponse<Void>> removeStaff(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @PathVariable("staffUuid") UUID staffUuid) {

        staffService.removeStaff(organizationUuid, staffUuid, null);
        return ResponseEntity.ok(ApiResponse.success("Staff member removed successfully", null));
    }
}
