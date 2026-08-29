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
import com.athlon.identityservice.organization.dto.request.CreateFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateFinanceRequest;
import com.athlon.identityservice.organization.dto.response.ClubFinanceResponse;
import com.athlon.identityservice.organization.dto.response.FinanceSummaryResponse;
import com.athlon.identityservice.organization.service.ClubFinanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/club/finances")
public class ClubFinanceController {

    private final ClubFinanceService financeService;

    public ClubFinanceController(ClubFinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<ClubFinanceResponse>>> getFinances(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ClubFinanceResponse> list = financeService.getFinances(organizationUuid, type, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Finances retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<ClubFinanceResponse>> createFinance(
            @Valid @RequestBody CreateFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        ClubFinanceResponse response = financeService.createFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<ClubFinanceResponse>> updateFinance(
            @Valid @RequestBody UpdateFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        ClubFinanceResponse response = financeService.updateFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", response));
    }

    @PostMapping("/delete/{financeUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteFinance(
            @PathVariable("financeUuid") UUID financeUuid) {

        financeService.deleteFinance(financeUuid);
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<FinanceSummaryResponse>> getFinanceSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        FinanceSummaryResponse summary = financeService.getFinanceSummary(organizationUuid, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Finance summary retrieved successfully", summary));
    }
}
