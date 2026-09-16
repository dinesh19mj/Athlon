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
import com.athlon.identityservice.organization.dto.request.CreateCoachFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCoachFinanceRequest;
import com.athlon.identityservice.organization.dto.response.CoachFinanceResponse;
import com.athlon.identityservice.organization.dto.response.CoachFinanceSummaryResponse;
import com.athlon.identityservice.organization.service.CoachFinanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/coach/finances")
public class CoachFinanceController {

    private final CoachFinanceService financeService;

    public CoachFinanceController(CoachFinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<CoachFinanceResponse>>> getFinances(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<CoachFinanceResponse> list = financeService.getFinances(organizationUuid, type, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Coach finances retrieved successfully", list));
    }

    @GetMapping("/trainee/{traineeUuid}")
    public ResponseEntity<ApiResponse<List<CoachFinanceResponse>>> getTraineeFinances(
            @RequestParam("organizationUuid") UUID organizationUuid,
            @PathVariable("traineeUuid") UUID traineeUuid) {

        List<CoachFinanceResponse> list = financeService.getTraineeFinances(organizationUuid, traineeUuid);
        return ResponseEntity.ok(ApiResponse.success("Trainee finances retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CoachFinanceResponse>> createFinance(
            @Valid @RequestBody CreateCoachFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        CoachFinanceResponse response = financeService.createFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<CoachFinanceResponse>> updateFinance(
            @Valid @RequestBody UpdateCoachFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        CoachFinanceResponse response = financeService.updateFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", response));
    }

    @PostMapping("/delete/{financeUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteFinance(
            @PathVariable("financeUuid") UUID financeUuid) {

        financeService.deleteFinance(financeUuid);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<CoachFinanceSummaryResponse>> getFinanceSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        CoachFinanceSummaryResponse summary = financeService.getFinanceSummary(organizationUuid, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Coach finance summary retrieved successfully", summary));
    }
}
