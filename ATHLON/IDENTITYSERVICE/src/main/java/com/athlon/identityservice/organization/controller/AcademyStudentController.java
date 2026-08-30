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
import com.athlon.identityservice.organization.dto.request.CreateBatchRequest;
import com.athlon.identityservice.organization.dto.request.EnrollStudentRequest;
import com.athlon.identityservice.organization.dto.request.UpdateBatchRequest;
import com.athlon.identityservice.organization.dto.request.UpdateStudentRequest;
import com.athlon.identityservice.organization.dto.response.AcademyBatchResponse;
import com.athlon.identityservice.organization.dto.response.AcademyStudentResponse;
import com.athlon.identityservice.organization.dto.response.AcademySummaryResponse;
import com.athlon.identityservice.organization.service.AcademyStudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy")
public class AcademyStudentController {

    private final AcademyStudentService academyStudentService;

    public AcademyStudentController(AcademyStudentService academyStudentService) {
        this.academyStudentService = academyStudentService;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STUDENT ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/students/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyStudentResponse>>> getStudents(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "batchUuid", required = false) UUID batchUuid,
            @RequestParam(value = "feeStatus", required = false) String feeStatus,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search) {

        List<AcademyStudentResponse> list = academyStudentService.getStudents(organizationUuid, level, batchUuid, feeStatus, status, search);
        return ResponseEntity.ok(ApiResponse.success("Academy students retrieved successfully", list));
    }

    @GetMapping("/students/{studentUuid}")
    public ResponseEntity<ApiResponse<AcademyStudentResponse>> getStudent(
            @PathVariable("studentUuid") UUID studentUuid) {

        AcademyStudentResponse student = academyStudentService.getStudentByUuid(studentUuid);
        return ResponseEntity.ok(ApiResponse.success("Student details retrieved successfully", student));
    }

    @PostMapping("/students/enroll")
    public ResponseEntity<ApiResponse<AcademyStudentResponse>> enrollStudent(
            @Valid @RequestBody EnrollStudentRequest request) {

        AcademyStudentResponse student = academyStudentService.enrollStudent(request);
        return ResponseEntity.ok(ApiResponse.success("Student enrolled successfully", student));
    }

    @PutMapping("/students/update")
    public ResponseEntity<ApiResponse<AcademyStudentResponse>> updateStudent(
            @Valid @RequestBody UpdateStudentRequest request) {

        AcademyStudentResponse student = academyStudentService.updateStudent(request);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", student));
    }

    @DeleteMapping("/students/{studentUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(
            @PathVariable("studentUuid") UUID studentUuid) {

        academyStudentService.deleteStudent(studentUuid);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    @GetMapping("/students/summary/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<AcademySummaryResponse>> getSummary(
            @PathVariable("organizationUuid") UUID organizationUuid) {

        AcademySummaryResponse summary = academyStudentService.getSummary(organizationUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy summary retrieved successfully", summary));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // BATCH ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/batches/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<AcademyBatchResponse>>> getBatches(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "status", required = false) String status) {

        List<AcademyBatchResponse> batches = academyStudentService.getBatches(organizationUuid, status);
        return ResponseEntity.ok(ApiResponse.success("Academy batches retrieved successfully", batches));
    }

    @PostMapping("/batches/create")
    public ResponseEntity<ApiResponse<AcademyBatchResponse>> createBatch(
            @Valid @RequestBody CreateBatchRequest request) {

        AcademyBatchResponse batch = academyStudentService.createBatch(request);
        return ResponseEntity.ok(ApiResponse.success("Batch created successfully", batch));
    }

    @PutMapping("/batches/update")
    public ResponseEntity<ApiResponse<AcademyBatchResponse>> updateBatch(
            @Valid @RequestBody UpdateBatchRequest request) {

        AcademyBatchResponse batch = academyStudentService.updateBatch(request);
        return ResponseEntity.ok(ApiResponse.success("Batch updated successfully", batch));
    }

    @DeleteMapping("/batches/{batchUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(
            @PathVariable("batchUuid") UUID batchUuid) {

        academyStudentService.deleteBatch(batchUuid);
        return ResponseEntity.ok(ApiResponse.success("Batch deleted successfully", null));
    }
}
