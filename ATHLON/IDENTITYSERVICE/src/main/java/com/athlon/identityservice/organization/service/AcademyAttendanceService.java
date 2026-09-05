package com.athlon.identityservice.organization.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.BulkAcademyAttendanceRequest;
import com.athlon.identityservice.organization.dto.request.MarkAcademyAttendanceRequest;
import com.athlon.identityservice.organization.dto.response.AcademyAttendanceResponse;
import com.athlon.identityservice.organization.dto.response.AcademyAttendanceSummaryResponse;
import com.athlon.identityservice.organization.entity.AcademyAttendance;
import com.athlon.identityservice.organization.entity.AcademyBatch;
import com.athlon.identityservice.organization.entity.AcademyCentre;
import com.athlon.identityservice.organization.entity.AcademyStaff;
import com.athlon.identityservice.organization.entity.AcademyStudent;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyAttendanceRepository;
import com.athlon.identityservice.organization.repository.AcademyBatchRepository;
import com.athlon.identityservice.organization.repository.AcademyCentreRepository;
import com.athlon.identityservice.organization.repository.AcademyStaffRepository;
import com.athlon.identityservice.organization.repository.AcademyStudentRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;

@Service
public class AcademyAttendanceService {

    private final AcademyAttendanceRepository attendanceRepository;
    private final OrganizationRepository organizationRepository;
    private final AcademyStudentRepository studentRepository;
    private final AcademyStaffRepository staffRepository;
    private final AcademyBatchRepository batchRepository;
    private final AcademyCentreRepository centreRepository;
    private final UserProfileRepository userProfileRepository;

    public AcademyAttendanceService(AcademyAttendanceRepository attendanceRepository,
                                  OrganizationRepository organizationRepository,
                                  AcademyStudentRepository studentRepository,
                                  AcademyStaffRepository staffRepository,
                                  AcademyBatchRepository batchRepository,
                                  AcademyCentreRepository centreRepository,
                                  UserProfileRepository userProfileRepository) {
        this.attendanceRepository = attendanceRepository;
        this.organizationRepository = organizationRepository;
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.batchRepository = batchRepository;
        this.centreRepository = centreRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public List<AcademyAttendanceResponse> getDailyAttendance(UUID organizationUuid,
                                                            LocalDate date,
                                                            String attendeeType,
                                                            UUID batchUuid) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<AcademyAttendance> existingList;

        if (batchUuid != null) {
            existingList = attendanceRepository.findByOrganizationUuidAndBatchUuidAndAttendanceDate(organizationUuid, batchUuid, targetDate);
        } else if (attendeeType != null && !attendeeType.trim().isEmpty() && !attendeeType.equalsIgnoreCase("ALL")) {
            existingList = attendanceRepository.findByOrganizationUuidAndAttendeeTypeAndAttendanceDate(organizationUuid, attendeeType.toUpperCase(), targetDate);
        } else {
            existingList = attendanceRepository.findByOrganizationUuidAndAttendanceDate(organizationUuid, targetDate);
        }

        return existingList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AcademyAttendanceResponse markAttendance(MarkAcademyAttendanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();

        Optional<AcademyAttendance> existingOpt = attendanceRepository
                .findByOrganizationUuidAndAttendeeUuidAndAttendanceDate(request.getOrganizationUuid(), request.getAttendeeUuid(), date);

        AcademyAttendance record;
        if (existingOpt.isPresent()) {
            record = existingOpt.get();
            record.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "PRESENT");
            if (request.getCheckInTime() != null) record.setCheckInTime(request.getCheckInTime());
            if (request.getNotes() != null) record.setNotes(request.getNotes());
            if (request.getBatchUuid() != null) record.setBatchUuid(request.getBatchUuid());
            if (request.getBatchName() != null) record.setBatchName(request.getBatchName());
            if (request.getCentreUuid() != null) record.setCentreUuid(request.getCentreUuid());
            record.setUpdatedBy(currentUserId);
        } else {
            record = new AcademyAttendance(
                    organization.getOrganizationId(),
                    organization.getOrganizationUuid(),
                    request.getAttendeeType() != null ? request.getAttendeeType().toUpperCase() : "STUDENT",
                    request.getAttendeeUuid(),
                    request.getAttendeeName(),
                    request.getBatchUuid(),
                    request.getBatchName(),
                    request.getCentreUuid(),
                    date,
                    request.getStatus() != null ? request.getStatus().toUpperCase() : "PRESENT",
                    request.getCheckInTime() != null ? request.getCheckInTime() : LocalTime.now(),
                    request.getNotes(),
                    currentUserId
            );
        }

        record = attendanceRepository.save(record);
        return mapToResponse(record);
    }

    @Transactional
    public List<AcademyAttendanceResponse> bulkMarkAttendance(BulkAcademyAttendanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        List<AcademyAttendanceResponse> responses = new ArrayList<>();

        for (MarkAcademyAttendanceRequest item : request.getRecords()) {
            item.setOrganizationUuid(organization.getOrganizationUuid());
            responses.add(markAttendance(item, currentUserId));
        }

        return responses;
    }

    public AcademyAttendanceSummaryResponse getAttendanceSummary(UUID organizationUuid, LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<AcademyAttendance> records = attendanceRepository.findByOrganizationUuidAndAttendanceDate(organizationUuid, targetDate);

        AcademyAttendanceSummaryResponse summary = new AcademyAttendanceSummaryResponse();
        summary.setOrganizationUuid(organizationUuid);
        summary.setAttendanceDate(targetDate);

        int totalPresent = 0;
        int totalAbsent = 0;
        int totalLate = 0;
        int totalExcused = 0;

        int stuTotal = 0, stuPres = 0, stuAbs = 0;
        int coachTotal = 0, coachPres = 0, coachAbs = 0;
        int staffTotal = 0, staffPres = 0, staffAbs = 0;

        for (AcademyAttendance r : records) {
            String status = r.getStatus() != null ? r.getStatus().toUpperCase() : "PRESENT";
            String type = r.getAttendeeType() != null ? r.getAttendeeType().toUpperCase() : "STUDENT";

            boolean isPres = "PRESENT".equals(status) || "LATE".equals(status);

            if ("PRESENT".equals(status)) totalPresent++;
            else if ("ABSENT".equals(status)) totalAbsent++;
            else if ("LATE".equals(status)) { totalLate++; totalPresent++; }
            else if ("EXCUSED".equals(status)) totalExcused++;

            if ("STUDENT".equals(type)) {
                stuTotal++;
                if (isPres) stuPres++; else stuAbs++;
            } else if ("COACH".equals(type)) {
                coachTotal++;
                if (isPres) coachPres++; else coachAbs++;
            } else if ("STAFF".equals(type) || "OPERATIONAL".equals(type)) {
                staffTotal++;
                if (isPres) staffPres++; else staffAbs++;
            }
        }

        summary.setTotalHeadcount(records.size());
        summary.setTotalPresent(totalPresent);
        summary.setTotalAbsent(totalAbsent);
        summary.setTotalLate(totalLate);
        summary.setTotalExcused(totalExcused);
        summary.setOverallPercentage(records.size() > 0 ? Math.round(((double) totalPresent / records.size()) * 1000.0) / 10.0 : 0.0);

        summary.setStudentsTotal(stuTotal);
        summary.setStudentsPresent(stuPres);
        summary.setStudentsAbsent(stuAbs);
        summary.setStudentsPercentage(stuTotal > 0 ? Math.round(((double) stuPres / stuTotal) * 1000.0) / 10.0 : 0.0);

        summary.setCoachesTotal(coachTotal);
        summary.setCoachesPresent(coachPres);
        summary.setCoachesAbsent(coachAbs);
        summary.setCoachesPercentage(coachTotal > 0 ? Math.round(((double) coachPres / coachTotal) * 1000.0) / 10.0 : 0.0);

        summary.setStaffTotal(staffTotal);
        summary.setStaffPresent(staffPres);
        summary.setStaffAbsent(staffAbs);
        summary.setStaffPercentage(staffTotal > 0 ? Math.round(((double) staffPres / staffTotal) * 1000.0) / 10.0 : 0.0);

        return summary;
    }

    private AcademyAttendanceResponse mapToResponse(AcademyAttendance record) {
        AcademyAttendanceResponse resp = new AcademyAttendanceResponse();
        resp.setAttendanceUuid(record.getAttendanceUuid());
        resp.setAttendanceId(record.getAttendanceId());
        resp.setOrganizationUuid(record.getOrganizationUuid());
        resp.setOrganizationId(record.getOrganizationId());
        resp.setAttendeeType(record.getAttendeeType());
        resp.setAttendeeUuid(record.getAttendeeUuid());
        resp.setAttendeeName(record.getAttendeeName());
        resp.setBatchUuid(record.getBatchUuid());
        resp.setBatchName(record.getBatchName());
        resp.setCentreUuid(record.getCentreUuid());
        resp.setAttendanceDate(record.getAttendanceDate());
        resp.setStatus(record.getStatus());
        resp.setCheckInTime(record.getCheckInTime());
        resp.setCheckOutTime(record.getCheckOutTime());
        resp.setNotes(record.getNotes());
        resp.setCreatedAt(record.getCreatedAt());
        resp.setUpdatedAt(record.getUpdatedAt());

        // Resolve attendee name/photo if not cached
        if (record.getAttendeeUuid() != null) {
            if ("STUDENT".equalsIgnoreCase(record.getAttendeeType())) {
                studentRepository.findByStudentUuid(record.getAttendeeUuid()).ifPresent(s -> {
                    if (resp.getAttendeeName() == null || resp.getAttendeeName().isEmpty()) {
                        resp.setAttendeeName(s.getFullName());
                    }
                    resp.setAttendeePhoto(s.getPhoto());
                    resp.setAttendeePhone(s.getParentPhone());
                    if (resp.getBatchName() == null && s.getBatchName() != null) {
                        resp.setBatchName(s.getBatchName());
                    }
                });
            } else if ("COACH".equalsIgnoreCase(record.getAttendeeType()) || "STAFF".equalsIgnoreCase(record.getAttendeeType())) {
                staffRepository.findByStaffUuid(record.getAttendeeUuid()).ifPresent(st -> {
                    if (resp.getAttendeeName() == null || resp.getAttendeeName().isEmpty()) {
                        resp.setAttendeeName(st.getFullName());
                    }
                    resp.setAttendeePhoto(st.getPhoto());
                    resp.setAttendeePhone(st.getPhone());
                });
            }
        }

        // Resolve Centre Name if assigned
        if (record.getCentreUuid() != null) {
            centreRepository.findByCentreUuid(record.getCentreUuid()).ifPresent(c -> {
                resp.setCentreName(c.getName());
            });
        }

        return resp;
    }
}
