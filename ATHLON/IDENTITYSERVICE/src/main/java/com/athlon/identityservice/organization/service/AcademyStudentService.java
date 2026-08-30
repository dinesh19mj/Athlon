package com.athlon.identityservice.organization.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.CreateBatchRequest;
import com.athlon.identityservice.organization.dto.request.EnrollStudentRequest;
import com.athlon.identityservice.organization.dto.request.UpdateBatchRequest;
import com.athlon.identityservice.organization.dto.request.UpdateStudentRequest;
import com.athlon.identityservice.organization.dto.response.AcademyBatchResponse;
import com.athlon.identityservice.organization.dto.response.AcademyStudentResponse;
import com.athlon.identityservice.organization.dto.response.AcademySummaryResponse;
import com.athlon.identityservice.organization.entity.AcademyBatch;
import com.athlon.identityservice.organization.entity.AcademyStudent;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyBatchRepository;
import com.athlon.identityservice.organization.repository.AcademyStudentRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class AcademyStudentService {

    private final AcademyStudentRepository studentRepository;
    private final AcademyBatchRepository batchRepository;
    private final OrganizationRepository organizationRepository;

    public AcademyStudentService(
            AcademyStudentRepository studentRepository,
            AcademyBatchRepository batchRepository,
            OrganizationRepository organizationRepository) {
        this.studentRepository = studentRepository;
        this.batchRepository = batchRepository;
        this.organizationRepository = organizationRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STUDENT MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AcademyStudentResponse> getStudents(
            UUID organizationUuid,
            String level,
            UUID batchUuid,
            String feeStatus,
            String status,
            String search) {

        List<AcademyStudent> students = studentRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);

        return students.stream()
                .filter(s -> status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status) || status.equalsIgnoreCase(s.getStatus()))
                .filter(s -> level == null || level.trim().isEmpty() || "ALL".equalsIgnoreCase(level) || level.equalsIgnoreCase(s.getLevel()))
                .filter(s -> batchUuid == null || (s.getBatchUuid() != null && batchUuid.equals(s.getBatchUuid())))
                .filter(s -> feeStatus == null || feeStatus.trim().isEmpty() || "ALL".equalsIgnoreCase(feeStatus) || feeStatus.equalsIgnoreCase(s.getFeeStatus()))
                .filter(s -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.trim().toLowerCase();
                    boolean nameMatch = s.getFullName() != null && s.getFullName().toLowerCase().contains(q);
                    boolean parentMatch = s.getParentName() != null && s.getParentName().toLowerCase().contains(q);
                    boolean phoneMatch = s.getParentPhone() != null && s.getParentPhone().contains(q);
                    boolean batchMatch = s.getBatchName() != null && s.getBatchName().toLowerCase().contains(q);
                    return nameMatch || parentMatch || phoneMatch || batchMatch;
                })
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademyStudentResponse getStudentByUuid(UUID studentUuid) {
        AcademyStudent student = studentRepository.findByStudentUuid(studentUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy student not found with UUID: " + studentUuid));
        return mapToStudentResponse(student);
    }

    @Transactional
    public AcademyStudentResponse enrollStudent(EnrollStudentRequest request) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        AcademyStudent student = new AcademyStudent();
        student.setOrganizationId(org.getOrganizationId());
        student.setOrganizationUuid(request.getOrganizationUuid());
        student.setUserUuid(request.getUserUuid());
        student.setFullName(request.getFullName().trim());
        student.setGender(request.getGender());
        student.setDob(request.getDob());
        student.setAge(request.getAge());
        student.setBloodGroup(request.getBloodGroup());
        student.setLevel(request.getLevel() != null ? request.getLevel().toUpperCase() : "BEGINNER");
        student.setSportType(request.getSportType());

        // Batch Assignment
        if (request.getBatchUuid() != null) {
            batchRepository.findByBatchUuid(request.getBatchUuid()).ifPresent(b -> {
                student.setBatchUuid(b.getBatchUuid());
                student.setBatchName(b.getBatchName());
                if (b.getStartTime() != null && b.getEndTime() != null) {
                    student.setBatchTiming(b.getStartTime() + " - " + b.getEndTime());
                }
            });
        } else {
            student.setBatchName(request.getBatchName());
            student.setBatchTiming(request.getBatchTiming());
        }

        student.setParentName(request.getParentName());
        student.setParentPhone(request.getParentPhone());
        student.setParentEmail(request.getParentEmail());
        student.setEmergencyContact(request.getEmergencyContact());
        student.setAddress(request.getAddress());
        student.setPhoto(request.getPhoto());
        student.setMedicalNotes(request.getMedicalNotes());
        student.setEnrollmentDate(request.getEnrollmentDate());
        student.setMonthlyFee(request.getMonthlyFee());
        student.setFeeFrequency(request.getFeeFrequency() != null ? request.getFeeFrequency().toUpperCase() : "MONTHLY");
        student.setFeeStatus(request.getFeeStatus() != null ? request.getFeeStatus().toUpperCase() : "PENDING");
        student.setStatus("ACTIVE");

        AcademyStudent saved = studentRepository.save(student);
        return mapToStudentResponse(saved);
    }

    @Transactional
    public AcademyStudentResponse updateStudent(UpdateStudentRequest request) {
        AcademyStudent student = studentRepository.findByStudentUuid(request.getStudentUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Academy student not found with UUID: " + request.getStudentUuid()));

        if (request.getFullName() != null) student.setFullName(request.getFullName().trim());
        if (request.getGender() != null) student.setGender(request.getGender());
        if (request.getDob() != null) student.setDob(request.getDob());
        if (request.getAge() != null) student.setAge(request.getAge());
        if (request.getBloodGroup() != null) student.setBloodGroup(request.getBloodGroup());
        if (request.getLevel() != null) student.setLevel(request.getLevel().toUpperCase());
        if (request.getSportType() != null) student.setSportType(request.getSportType());

        if (request.getBatchUuid() != null) {
            batchRepository.findByBatchUuid(request.getBatchUuid()).ifPresent(b -> {
                student.setBatchUuid(b.getBatchUuid());
                student.setBatchName(b.getBatchName());
                if (b.getStartTime() != null && b.getEndTime() != null) {
                    student.setBatchTiming(b.getStartTime() + " - " + b.getEndTime());
                }
            });
        } else if (request.getBatchName() != null) {
            student.setBatchName(request.getBatchName());
            student.setBatchTiming(request.getBatchTiming());
        }

        if (request.getParentName() != null) student.setParentName(request.getParentName());
        if (request.getParentPhone() != null) student.setParentPhone(request.getParentPhone());
        if (request.getParentEmail() != null) student.setParentEmail(request.getParentEmail());
        if (request.getEmergencyContact() != null) student.setEmergencyContact(request.getEmergencyContact());
        if (request.getAddress() != null) student.setAddress(request.getAddress());
        if (request.getPhoto() != null) student.setPhoto(request.getPhoto());
        if (request.getMedicalNotes() != null) student.setMedicalNotes(request.getMedicalNotes());
        if (request.getMonthlyFee() != null) student.setMonthlyFee(request.getMonthlyFee());
        if (request.getFeeFrequency() != null) student.setFeeFrequency(request.getFeeFrequency().toUpperCase());
        if (request.getFeeStatus() != null) student.setFeeStatus(request.getFeeStatus().toUpperCase());
        if (request.getStatus() != null) student.setStatus(request.getStatus().toUpperCase());

        AcademyStudent updated = studentRepository.save(student);
        return mapToStudentResponse(updated);
    }

    @Transactional
    public void deleteStudent(UUID studentUuid) {
        AcademyStudent student = studentRepository.findByStudentUuid(studentUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy student not found with UUID: " + studentUuid));
        studentRepository.delete(student);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // BATCH MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AcademyBatchResponse> getBatches(UUID organizationUuid, String status) {
        List<AcademyBatch> batches = batchRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        List<AcademyStudent> allStudents = studentRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);

        Map<UUID, Long> studentCountByBatch = allStudents.stream()
                .filter(s -> s.getBatchUuid() != null && "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .collect(Collectors.groupingBy(AcademyStudent::getBatchUuid, Collectors.counting()));

        return batches.stream()
                .filter(b -> status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status) || status.equalsIgnoreCase(b.getStatus()))
                .map(b -> {
                    AcademyBatchResponse resp = mapToBatchResponse(b);
                    resp.setEnrolledCount(studentCountByBatch.getOrDefault(b.getBatchUuid(), 0L).intValue());
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public AcademyBatchResponse createBatch(CreateBatchRequest request) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        AcademyBatch batch = new AcademyBatch();
        batch.setOrganizationId(org.getOrganizationId());
        batch.setOrganizationUuid(request.getOrganizationUuid());
        batch.setBatchName(request.getBatchName().trim());
        batch.setSportType(request.getSportType());
        batch.setLevel(request.getLevel() != null ? request.getLevel().toUpperCase() : "ALL");
        batch.setCoachUuid(request.getCoachUuid());
        batch.setCoachName(request.getCoachName());
        batch.setDaysOfWeek(request.getDaysOfWeek());
        batch.setStartTime(request.getStartTime());
        batch.setEndTime(request.getEndTime());
        batch.setMaxCapacity(request.getMaxCapacity() != null ? request.getMaxCapacity() : 20);
        batch.setMonthlyFee(request.getMonthlyFee());
        batch.setStatus("ACTIVE");

        AcademyBatch saved = batchRepository.save(batch);
        AcademyBatchResponse resp = mapToBatchResponse(saved);
        resp.setEnrolledCount(0);
        return resp;
    }

    @Transactional
    public AcademyBatchResponse updateBatch(UpdateBatchRequest request) {
        AcademyBatch batch = batchRepository.findByBatchUuid(request.getBatchUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Academy batch not found with UUID: " + request.getBatchUuid()));

        if (request.getBatchName() != null) batch.setBatchName(request.getBatchName().trim());
        if (request.getSportType() != null) batch.setSportType(request.getSportType());
        if (request.getLevel() != null) batch.setLevel(request.getLevel().toUpperCase());
        if (request.getCoachUuid() != null) batch.setCoachUuid(request.getCoachUuid());
        if (request.getCoachName() != null) batch.setCoachName(request.getCoachName());
        if (request.getDaysOfWeek() != null) batch.setDaysOfWeek(request.getDaysOfWeek());
        if (request.getStartTime() != null) batch.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) batch.setEndTime(request.getEndTime());
        if (request.getMaxCapacity() != null) batch.setMaxCapacity(request.getMaxCapacity());
        if (request.getMonthlyFee() != null) batch.setMonthlyFee(request.getMonthlyFee());
        if (request.getStatus() != null) batch.setStatus(request.getStatus().toUpperCase());

        AcademyBatch updated = batchRepository.save(batch);
        AcademyBatchResponse resp = mapToBatchResponse(updated);

        long enrolled = studentRepository.findByOrganizationUuidAndBatchUuidOrderByCreatedAtDesc(batch.getOrganizationUuid(), batch.getBatchUuid()).size();
        resp.setEnrolledCount((int) enrolled);
        return resp;
    }

    @Transactional
    public void deleteBatch(UUID batchUuid) {
        AcademyBatch batch = batchRepository.findByBatchUuid(batchUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy batch not found with UUID: " + batchUuid));
        batchRepository.delete(batch);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TELEMETRY & SUMMARY
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AcademySummaryResponse getSummary(UUID organizationUuid) {
        List<AcademyStudent> students = studentRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);
        List<AcademyBatch> batches = batchRepository.findByOrganizationUuidOrderByCreatedAtDesc(organizationUuid);

        long total = students.size();
        long active = students.stream().filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus())).count();
        long paid = students.stream().filter(s -> "PAID".equalsIgnoreCase(s.getFeeStatus())).count();
        long pending = students.stream().filter(s -> "PENDING".equalsIgnoreCase(s.getFeeStatus())).count();
        long overdue = students.stream().filter(s -> "OVERDUE".equalsIgnoreCase(s.getFeeStatus())).count();

        int feePercent = total > 0 ? (int) Math.round(((double) paid / (double) total) * 100.0) : 0;

        Map<String, Long> byLevel = students.stream()
                .collect(Collectors.groupingBy(s -> s.getLevel() != null ? s.getLevel() : "BEGINNER", Collectors.counting()));

        Map<String, Long> byBatch = students.stream()
                .collect(Collectors.groupingBy(s -> s.getBatchName() != null ? s.getBatchName() : "Unassigned", Collectors.counting()));

        AcademySummaryResponse summary = new AcademySummaryResponse();
        summary.setTotalStudents(total);
        summary.setActiveStudents(active);
        summary.setTotalBatches(batches.size());
        summary.setPaidCount(paid);
        summary.setPendingCount(pending);
        summary.setOverdueCount(overdue);
        summary.setFeeCollectionPercentage(feePercent);
        summary.setStudentsByLevel(byLevel);
        summary.setStudentsByBatch(byBatch);

        return summary;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPER MAPPERS
    // ─────────────────────────────────────────────────────────────────────────────

    private AcademyStudentResponse mapToStudentResponse(AcademyStudent s) {
        AcademyStudentResponse r = new AcademyStudentResponse();
        r.setStudentId(s.getStudentId());
        r.setStudentUuid(s.getStudentUuid());
        r.setOrganizationId(s.getOrganizationId());
        r.setOrganizationUuid(s.getOrganizationUuid());
        r.setUserId(s.getUserId());
        r.setUserUuid(s.getUserUuid());
        r.setFullName(s.getFullName());
        r.setGender(s.getGender());
        r.setDob(s.getDob());
        r.setAge(s.getAge());
        r.setBloodGroup(s.getBloodGroup());
        r.setLevel(s.getLevel());
        r.setBatchUuid(s.getBatchUuid());
        r.setBatchName(s.getBatchName());
        r.setBatchTiming(s.getBatchTiming());
        r.setSportType(s.getSportType());
        r.setParentName(s.getParentName());
        r.setParentPhone(s.getParentPhone());
        r.setParentEmail(s.getParentEmail());
        r.setEmergencyContact(s.getEmergencyContact());
        r.setAddress(s.getAddress());
        r.setPhoto(s.getPhoto());
        r.setMedicalNotes(s.getMedicalNotes());
        r.setEnrollmentDate(s.getEnrollmentDate());
        r.setMonthlyFee(s.getMonthlyFee());
        r.setFeeFrequency(s.getFeeFrequency());
        r.setFeeStatus(s.getFeeStatus());
        r.setStatus(s.getStatus());
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }

    private AcademyBatchResponse mapToBatchResponse(AcademyBatch b) {
        AcademyBatchResponse r = new AcademyBatchResponse();
        r.setBatchId(b.getBatchId());
        r.setBatchUuid(b.getBatchUuid());
        r.setOrganizationId(b.getOrganizationId());
        r.setOrganizationUuid(b.getOrganizationUuid());
        r.setBatchName(b.getBatchName());
        r.setSportType(b.getSportType());
        r.setLevel(b.getLevel());
        r.setCoachUuid(b.getCoachUuid());
        r.setCoachName(b.getCoachName());
        r.setDaysOfWeek(b.getDaysOfWeek());
        r.setStartTime(b.getStartTime());
        r.setEndTime(b.getEndTime());
        r.setMaxCapacity(b.getMaxCapacity());
        r.setMonthlyFee(b.getMonthlyFee());
        r.setStatus(b.getStatus());
        r.setCreatedAt(b.getCreatedAt());
        r.setUpdatedAt(b.getUpdatedAt());
        return r;
    }
}
