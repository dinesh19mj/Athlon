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
import com.athlon.identityservice.organization.dto.request.BulkCoachAttendanceRequest;
import com.athlon.identityservice.organization.dto.request.CreateCoachFeePackageRequest;
import com.athlon.identityservice.organization.dto.request.CreateCoachFeeTransactionRequest;
import com.athlon.identityservice.organization.dto.request.CreateCoachScheduleRequest;
import com.athlon.identityservice.organization.dto.request.CreateCoachTraineeRequest;
import com.athlon.identityservice.organization.dto.request.MarkCoachAttendanceRequest;
import com.athlon.identityservice.organization.dto.request.RecordCoachPaymentRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCoachFeePackageRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCoachScheduleRequest;
import com.athlon.identityservice.organization.dto.request.UpdateCoachTraineeRequest;
import com.athlon.identityservice.organization.dto.response.CoachAttendanceResponse;
import com.athlon.identityservice.organization.dto.response.CoachAttendanceSummaryResponse;
import com.athlon.identityservice.organization.dto.response.CoachDashboardSummaryResponse;
import com.athlon.identityservice.organization.dto.response.CoachFeePackageResponse;
import com.athlon.identityservice.organization.dto.response.CoachFeeTransactionResponse;
import com.athlon.identityservice.organization.dto.response.CoachScheduleResponse;
import com.athlon.identityservice.organization.dto.response.CoachTraineeResponse;
import com.athlon.identityservice.organization.service.CoachService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/coach")
public class CoachController {

    private final CoachService coachService;

    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TRAINEE / STUDENT ROSTER ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/trainees/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<CoachTraineeResponse>>> getTrainees(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "status", required = false) String status) {

        List<CoachTraineeResponse> list = coachService.getTrainees(organizationUuid, status);
        return ResponseEntity.ok(ApiResponse.success("Coach trainees retrieved successfully", list));
    }

    @GetMapping("/trainees/{traineeUuid}")
    public ResponseEntity<ApiResponse<CoachTraineeResponse>> getTrainee(
            @PathVariable("traineeUuid") UUID traineeUuid) {

        CoachTraineeResponse trainee = coachService.getTraineeByUuid(traineeUuid);
        return ResponseEntity.ok(ApiResponse.success("Coach trainee retrieved successfully", trainee));
    }

    @PostMapping("/trainees/create")
    public ResponseEntity<ApiResponse<CoachTraineeResponse>> createTrainee(
            @Valid @RequestBody CreateCoachTraineeRequest request) {

        CoachTraineeResponse trainee = coachService.createTrainee(request);
        return ResponseEntity.ok(ApiResponse.success("Trainee enrolled successfully", trainee));
    }

    @PostMapping("/trainees/update")
    public ResponseEntity<ApiResponse<CoachTraineeResponse>> updateTrainee(
            @Valid @RequestBody UpdateCoachTraineeRequest request) {

        CoachTraineeResponse trainee = coachService.updateTrainee(request);
        return ResponseEntity.ok(ApiResponse.success("Trainee updated successfully", trainee));
    }

    @PostMapping("/trainees/delete/{traineeUuid}")
    public ResponseEntity<ApiResponse<String>> deleteTrainee(
            @PathVariable("traineeUuid") UUID traineeUuid) {

        coachService.deleteTrainee(traineeUuid);
        return ResponseEntity.ok(ApiResponse.success("Trainee deleted successfully", "DELETED"));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // COACHING FEE PACKAGES ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/packages/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<CoachFeePackageResponse>>> getPackages(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "activeOnly", required = false) Boolean activeOnly) {

        List<CoachFeePackageResponse> list = coachService.getPackages(organizationUuid, activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Coach fee packages retrieved successfully", list));
    }

    @GetMapping("/packages/{packageUuid}")
    public ResponseEntity<ApiResponse<CoachFeePackageResponse>> getPackage(
            @PathVariable("packageUuid") UUID packageUuid) {

        CoachFeePackageResponse pkg = coachService.getPackageByUuid(packageUuid);
        return ResponseEntity.ok(ApiResponse.success("Coach fee package retrieved successfully", pkg));
    }

    @PostMapping("/packages/create")
    public ResponseEntity<ApiResponse<CoachFeePackageResponse>> createPackage(
            @Valid @RequestBody CreateCoachFeePackageRequest request) {

        CoachFeePackageResponse pkg = coachService.createPackage(request);
        return ResponseEntity.ok(ApiResponse.success("Fee package created successfully", pkg));
    }

    @PostMapping("/packages/update")
    public ResponseEntity<ApiResponse<CoachFeePackageResponse>> updatePackage(
            @Valid @RequestBody UpdateCoachFeePackageRequest request) {

        CoachFeePackageResponse pkg = coachService.updatePackage(request);
        return ResponseEntity.ok(ApiResponse.success("Fee package updated successfully", pkg));
    }

    @PostMapping("/packages/delete/{packageUuid}")
    public ResponseEntity<ApiResponse<String>> deletePackage(
            @PathVariable("packageUuid") UUID packageUuid) {

        coachService.deletePackage(packageUuid);
        return ResponseEntity.ok(ApiResponse.success("Fee package deleted successfully", "DELETED"));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCHEDULE & SESSIONS ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/schedules/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<CoachScheduleResponse>>> getSchedules(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<CoachScheduleResponse> list = coachService.getSchedules(organizationUuid, date);
        return ResponseEntity.ok(ApiResponse.success("Coach schedules retrieved successfully", list));
    }

    @PostMapping("/schedules/create")
    public ResponseEntity<ApiResponse<CoachScheduleResponse>> createSchedule(
            @Valid @RequestBody CreateCoachScheduleRequest request) {

        CoachScheduleResponse schedule = coachService.createSchedule(request);
        return ResponseEntity.ok(ApiResponse.success("Training session scheduled successfully", schedule));
    }

    @PostMapping("/schedules/update")
    public ResponseEntity<ApiResponse<CoachScheduleResponse>> updateSchedule(
            @Valid @RequestBody UpdateCoachScheduleRequest request) {

        CoachScheduleResponse schedule = coachService.updateSchedule(request);
        return ResponseEntity.ok(ApiResponse.success("Training session updated successfully", schedule));
    }

    @PostMapping("/schedules/check-in/{sessionUuid}")
    public ResponseEntity<ApiResponse<CoachScheduleResponse>> checkInSession(
            @PathVariable("sessionUuid") UUID sessionUuid) {

        CoachScheduleResponse schedule = coachService.checkInSession(sessionUuid);
        return ResponseEntity.ok(ApiResponse.success("Session checked in successfully", schedule));
    }

    @PostMapping("/schedules/delete/{sessionUuid}")
    public ResponseEntity<ApiResponse<String>> deleteSchedule(
            @PathVariable("sessionUuid") UUID sessionUuid) {

        coachService.deleteSchedule(sessionUuid);
        return ResponseEntity.ok(ApiResponse.success("Training session deleted successfully", "DELETED"));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // FEE TRANSACTIONS & INVOICES ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/transactions/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<CoachFeeTransactionResponse>>> getTransactions(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "status", required = false) String status) {

        List<CoachFeeTransactionResponse> list = coachService.getTransactions(organizationUuid, status);
        return ResponseEntity.ok(ApiResponse.success("Coach fee transactions retrieved successfully", list));
    }

    @PostMapping("/transactions/create")
    public ResponseEntity<ApiResponse<CoachFeeTransactionResponse>> createTransaction(
            @Valid @RequestBody CreateCoachFeeTransactionRequest request) {

        CoachFeeTransactionResponse tx = coachService.createTransaction(request);
        return ResponseEntity.ok(ApiResponse.success("Fee invoice created successfully", tx));
    }

    @PostMapping("/transactions/record-payment")
    public ResponseEntity<ApiResponse<CoachFeeTransactionResponse>> recordPayment(
            @Valid @RequestBody RecordCoachPaymentRequest request) {

        CoachFeeTransactionResponse tx = coachService.recordPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", tx));
    }

    @PostMapping("/transactions/send-reminder/{transactionUuid}")
    public ResponseEntity<ApiResponse<CoachFeeTransactionResponse>> sendReminder(
            @PathVariable("transactionUuid") UUID transactionUuid) {

        CoachFeeTransactionResponse tx = coachService.sendReminder(transactionUuid);
        return ResponseEntity.ok(ApiResponse.success("Payment reminder sent successfully", tx));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // DASHBOARD SUMMARY TELEMETRY
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/dashboard/summary/{organizationUuid}")
    public ResponseEntity<ApiResponse<CoachDashboardSummaryResponse>> getDashboardSummary(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        CoachDashboardSummaryResponse summary = coachService.getDashboardSummary(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Coach dashboard telemetry retrieved successfully", summary));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // COACH TRAINEE ATTENDANCE ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/attendance/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<CoachAttendanceResponse>>> getAttendance(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<CoachAttendanceResponse> list = coachService.getAttendanceByDate(organizationUuid, date);
        return ResponseEntity.ok(ApiResponse.success("Coach trainee attendance retrieved successfully", list));
    }

    @GetMapping("/attendance/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<CoachAttendanceSummaryResponse>> getAttendanceSummary(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        CoachAttendanceSummaryResponse summary = coachService.getAttendanceSummary(organizationUuid, date);
        return ResponseEntity.ok(ApiResponse.success("Attendance summary retrieved successfully", summary));
    }

    @GetMapping("/attendance/trainee/{traineeUuid}")
    public ResponseEntity<ApiResponse<List<CoachAttendanceResponse>>> getTraineeAttendanceHistory(
            @PathVariable("traineeUuid") UUID traineeUuid,
            @RequestParam("orgUuid") UUID orgUuid,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<CoachAttendanceResponse> history = coachService.getTraineeAttendanceHistory(orgUuid, traineeUuid, from, to);
        return ResponseEntity.ok(ApiResponse.success("Trainee attendance history retrieved successfully", history));
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<ApiResponse<CoachAttendanceResponse>> markAttendance(
            @Valid @RequestBody MarkCoachAttendanceRequest request) {

        CoachAttendanceResponse response = coachService.markAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", response));
    }

    @PostMapping("/attendance/bulk-mark")
    public ResponseEntity<ApiResponse<List<CoachAttendanceResponse>>> bulkMarkAttendance(
            @Valid @RequestBody BulkCoachAttendanceRequest request) {

        List<CoachAttendanceResponse> responses = coachService.bulkMarkAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance updated successfully", responses));
    }

    @PostMapping("/attendance/delete/{attendanceUuid}")
    public ResponseEntity<ApiResponse<String>> deleteAttendance(
            @PathVariable("attendanceUuid") UUID attendanceUuid) {

        coachService.deleteAttendance(attendanceUuid);
        return ResponseEntity.ok(ApiResponse.success("Attendance record deleted successfully", "DELETED"));
    }
}
