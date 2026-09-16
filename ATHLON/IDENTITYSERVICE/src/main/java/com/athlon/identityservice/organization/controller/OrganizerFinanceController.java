package com.athlon.identityservice.organization.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.CreateOrganizerFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizerFinanceRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerFinanceResponse;
import com.athlon.identityservice.organization.dto.response.OrganizerFinanceSummaryResponse;
import com.athlon.identityservice.organization.service.OrganizerFinanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizer/finances")
public class OrganizerFinanceController {

    private final OrganizerFinanceService financeService;

    public OrganizerFinanceController(OrganizerFinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<OrganizerFinanceResponse>>> getFinances(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "tournamentUuid", required = false) UUID tournamentUuid,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<OrganizerFinanceResponse> list = financeService.getFinances(organizationUuid, tournamentUuid, type, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Organizer finances retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<OrganizerFinanceResponse>> createFinance(
            @Valid @RequestBody CreateOrganizerFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerFinanceResponse response = financeService.createFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Tournament transaction recorded successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<OrganizerFinanceResponse>> updateFinance(
            @Valid @RequestBody UpdateOrganizerFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerFinanceResponse response = financeService.updateFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Tournament transaction updated successfully", response));
    }

    @PostMapping("/delete/{financeUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteFinance(
            @PathVariable("financeUuid") UUID financeUuid) {

        financeService.deleteFinance(financeUuid);
        return ResponseEntity.ok(ApiResponse.success("Tournament transaction deleted successfully", null));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<OrganizerFinanceSummaryResponse>> getSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "tournamentUuid", required = false) UUID tournamentUuid,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        OrganizerFinanceSummaryResponse summary = financeService.getSummary(organizationUuid, tournamentUuid, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Organizer finance summary retrieved successfully", summary));
    }
}
