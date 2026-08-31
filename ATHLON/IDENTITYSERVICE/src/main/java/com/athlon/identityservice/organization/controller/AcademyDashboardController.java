package com.athlon.identityservice.organization.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.response.AcademyDashboardSummaryResponse;
import com.athlon.identityservice.organization.service.AcademyDashboardService;

@RestController
@RequestMapping("/api/identity/academy/dashboard")
public class AcademyDashboardController {

    private final AcademyDashboardService dashboardService;

    public AcademyDashboardController(AcademyDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<AcademyDashboardSummaryResponse>> getDashboard(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        AcademyDashboardSummaryResponse summary = dashboardService.getDashboardSummary(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy dashboard summary retrieved successfully", summary));
    }
}
