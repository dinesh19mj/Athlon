package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.CreateCentreRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCentreRequest;
import com.athlon.identityservice.organization.dto.response.AcademyCentreResponse;
import com.athlon.identityservice.organization.service.AcademyCentreService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/centres")
public class AcademyCentreController {

    private final AcademyCentreService centreService;

    public AcademyCentreController(AcademyCentreService centreService) {
        this.centreService = centreService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyCentreResponse>>> getCentres(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "status", required = false) String status) {

        List<AcademyCentreResponse> list = centreService.getCentres(organizationUuid, status);
        return ResponseEntity.ok(ApiResponse.success("Academy centres retrieved successfully", list));
    }

    @GetMapping("/{centreUuid}")
    public ResponseEntity<ApiResponse<AcademyCentreResponse>> getCentre(
            @PathVariable("centreUuid") UUID centreUuid) {

        AcademyCentreResponse centre = centreService.getCentreByUuid(centreUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy centre retrieved successfully", centre));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademyCentreResponse>> createCentre(
            @Valid @RequestBody CreateCentreRequest request) {

        AcademyCentreResponse centre = centreService.createCentre(request);
        return ResponseEntity.ok(ApiResponse.success("Academy centre created successfully", centre));
    }

    @PutMapping("/{centreUuid}")
    public ResponseEntity<ApiResponse<AcademyCentreResponse>> updateCentre(
            @PathVariable("centreUuid") UUID centreUuid,
            @Valid @RequestBody UpdateCentreRequest request) {

        AcademyCentreResponse centre = centreService.updateCentre(centreUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Academy centre updated successfully", centre));
    }

    @DeleteMapping("/{centreUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteCentre(
            @PathVariable("centreUuid") UUID centreUuid) {

        centreService.deleteCentre(centreUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy centre deleted successfully", null));
    }
}
