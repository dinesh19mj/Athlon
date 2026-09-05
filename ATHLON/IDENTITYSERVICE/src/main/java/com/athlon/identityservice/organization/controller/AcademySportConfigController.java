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
import com.athlon.identityservice.organization.dto.request.CreateSportConfigRequest;
import com.athlon.identityservice.organization.dto.response.AcademySportConfigResponse;
import com.athlon.identityservice.organization.service.AcademySportConfigService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/sports")
public class AcademySportConfigController {

    private final AcademySportConfigService sportConfigService;

    public AcademySportConfigController(AcademySportConfigService sportConfigService) {
        this.sportConfigService = sportConfigService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademySportConfigResponse>>> getSports(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "status", required = false) String status) {

        List<AcademySportConfigResponse> list = sportConfigService.getSports(organizationUuid, status);
        return ResponseEntity.ok(ApiResponse.success("Academy sports retrieved successfully", list));
    }

    @PostMapping("/save")
    public ResponseEntity<ApiResponse<AcademySportConfigResponse>> saveSport(
            @Valid @RequestBody CreateSportConfigRequest request) {

        AcademySportConfigResponse sport = sportConfigService.createOrUpdateSport(request);
        return ResponseEntity.ok(ApiResponse.success("Academy sport saved successfully", sport));
    }

    @PostMapping("/delete/{sportUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteSport(
            @PathVariable("sportUuid") UUID sportUuid) {

        sportConfigService.deleteSport(sportUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy sport deleted successfully", null));
    }
}
