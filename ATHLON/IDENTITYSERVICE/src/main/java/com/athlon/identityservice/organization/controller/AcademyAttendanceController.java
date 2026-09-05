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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.BulkAcademyAttendanceRequest;
import com.athlon.identityservice.organization.dto.request.MarkAcademyAttendanceRequest;
import com.athlon.identityservice.organization.dto.response.AcademyAttendanceResponse;
import com.athlon.identityservice.organization.dto.response.AcademyAttendanceSummaryResponse;
import com.athlon.identityservice.organization.service.AcademyAttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/attendance")
public class AcademyAttendanceController {

    private final AcademyAttendanceService attendanceService;

    public AcademyAttendanceController(AcademyAttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyAttendanceResponse>>> getDailyAttendance(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "batchUuid", required = false) UUID batchUuid) {

        List<AcademyAttendanceResponse> list = attendanceService.getDailyAttendance(organizationUuid, date, type, batchUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy attendance retrieved successfully", list));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<AcademyAttendanceSummaryResponse>> getSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        AcademyAttendanceSummaryResponse summary = attendanceService.getAttendanceSummary(organizationUuid, date);
        return ResponseEntity.ok(ApiResponse.success("Academy attendance summary retrieved successfully", summary));
    }

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AcademyAttendanceResponse>> markAttendance(
            @Valid @RequestBody MarkAcademyAttendanceRequest request) {

        AcademyAttendanceResponse resp = attendanceService.markAttendance(request, null);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", resp));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<AcademyAttendanceResponse>>> bulkMarkAttendance(
            @Valid @RequestBody BulkAcademyAttendanceRequest request) {

        List<AcademyAttendanceResponse> list = attendanceService.bulkMarkAttendance(request, null);
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance updated successfully", list));
    }
}
