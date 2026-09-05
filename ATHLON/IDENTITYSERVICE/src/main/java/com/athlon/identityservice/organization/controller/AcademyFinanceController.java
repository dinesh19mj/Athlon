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
import com.athlon.identityservice.organization.dto.request.CreateAcademyFinanceRequest;
import com.athlon.identityservice.organization.dto.request.UpdateAcademyFinanceRequest;
import com.athlon.identityservice.organization.dto.response.AcademyFinanceResponse;
import com.athlon.identityservice.organization.dto.response.AcademyFinanceSummaryResponse;
import com.athlon.identityservice.organization.service.AcademyFinanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/finances")
public class AcademyFinanceController {

    private final AcademyFinanceService financeService;

    public AcademyFinanceController(AcademyFinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyFinanceResponse>>> getFinances(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "studentUuid", required = false) UUID studentUuid,
            @RequestParam(value = "batchUuid", required = false) UUID batchUuid,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<AcademyFinanceResponse> list = financeService.getFinances(
                organizationUuid, type, category, studentUuid, batchUuid, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Academy finances retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<AcademyFinanceResponse>> createFinance(
            @Valid @RequestBody CreateAcademyFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        AcademyFinanceResponse response = financeService.createFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Academy transaction recorded successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<AcademyFinanceResponse>> updateFinance(
            @Valid @RequestBody UpdateAcademyFinanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        AcademyFinanceResponse response = financeService.updateFinance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Academy transaction updated successfully", response));
    }

    @PostMapping("/delete/{financeUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteFinance(
            @PathVariable("financeUuid") UUID financeUuid) {

        financeService.deleteFinance(financeUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy transaction deleted successfully", null));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<AcademyFinanceSummaryResponse>> getFinanceSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        AcademyFinanceSummaryResponse summary = financeService.getFinanceSummary(organizationUuid, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Academy finance summary retrieved successfully", summary));
    }
}
