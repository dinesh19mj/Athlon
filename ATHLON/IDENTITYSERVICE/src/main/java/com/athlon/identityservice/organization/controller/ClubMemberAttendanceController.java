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
import com.athlon.identityservice.organization.dto.request.BulkAttendanceRequest;
import com.athlon.identityservice.organization.dto.request.MarkAttendanceRequest;
import com.athlon.identityservice.organization.dto.response.AttendanceSummaryResponse;
import com.athlon.identityservice.organization.dto.response.ClubMemberAttendanceResponse;
import com.athlon.identityservice.organization.service.ClubMemberAttendanceService;

@RestController
@RequestMapping("/api/identity/club/attendance")
public class ClubMemberAttendanceController {

    private final ClubMemberAttendanceService attendanceService;

    public ClubMemberAttendanceController(ClubMemberAttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<ClubMemberAttendanceResponse>>> getDailyAttendance(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate queryDate = date != null ? date : LocalDate.now();
        List<ClubMemberAttendanceResponse> list = attendanceService.getDailyAttendance(organizationUuid, queryDate);
        return ResponseEntity.ok(ApiResponse.success("Daily attendance retrieved successfully", list));
    }

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<ClubMemberAttendanceResponse>> markAttendance(
            @RequestBody MarkAttendanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
        ClubMemberAttendanceResponse response = attendanceService.markAttendance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Member attendance recorded successfully", response));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<ClubMemberAttendanceResponse>>> bulkMarkAttendance(
            @RequestBody BulkAttendanceRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
        List<ClubMemberAttendanceResponse> list = attendanceService.bulkMarkAttendance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Attendance sheet saved successfully", list));
    }

    @GetMapping("/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> getAttendanceSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        LocalDate queryDate = date != null ? date : LocalDate.now();
        AttendanceSummaryResponse summary = attendanceService.getAttendanceSummary(organizationUuid, queryDate);
        return ResponseEntity.ok(ApiResponse.success("Attendance summary retrieved successfully", summary));
    }
}
