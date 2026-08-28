package com.athlon.identityservice.organization.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.BulkAttendanceRequest;
import com.athlon.identityservice.organization.dto.request.MarkAttendanceRequest;
import com.athlon.identityservice.organization.dto.response.AttendanceSummaryResponse;
import com.athlon.identityservice.organization.dto.response.ClubMemberAttendanceResponse;
import com.athlon.identityservice.organization.dto.response.OrganizationMemberResponse;
import com.athlon.identityservice.organization.entity.ClubMemberAttendance;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.repository.ClubMemberAttendanceRepository;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class ClubMemberAttendanceService {

    private final ClubMemberAttendanceRepository attendanceRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationService organizationService;

    public ClubMemberAttendanceService(
            ClubMemberAttendanceRepository attendanceRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            OrganizationService organizationService) {
        this.attendanceRepository = attendanceRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.organizationService = organizationService;
    }

    @Transactional(readOnly = true)
    public List<ClubMemberAttendanceResponse> getDailyAttendance(UUID organizationUuid, LocalDate attendanceDate) {
        // Fetch all active members
        List<OrganizationMemberResponse> members = organizationService.getOrganizationMembers(organizationUuid);

        // Fetch existing attendance records for the given date
        List<ClubMemberAttendance> attendances = attendanceRepository.findByOrganizationUuidAndAttendanceDate(organizationUuid, attendanceDate);
        Map<UUID, ClubMemberAttendance> attendanceMap = attendances.stream()
                .collect(Collectors.toMap(ClubMemberAttendance::getOrganizationMemberUuid, Function.identity(), (a1, a2) -> a1));

        return members.stream().map(m -> {
            ClubMemberAttendanceResponse resp = new ClubMemberAttendanceResponse();
            resp.setOrganizationMemberUuid(m.getOrganizationMemberUuid());
            resp.setOrganizationMemberId(m.getOrganizationMemberId());
            resp.setUserUuid(m.getUserUuid());
            resp.setUserId(m.getUserId());
            resp.setFullName(m.getFullName());
            resp.setPhoto(m.getPhoto());
            resp.setPhone(m.getPhone());
            resp.setRole(m.getRole());
            resp.setAttendanceDate(attendanceDate);

            ClubMemberAttendance record = attendanceMap.get(m.getOrganizationMemberUuid());
            if (record != null) {
                resp.setAttendanceUuid(record.getAttendanceUuid());
                resp.setStatus(record.getStatus());
                resp.setCheckInTime(record.getCheckInTime());
                resp.setNotes(record.getNotes());
                resp.setUpdatedAt(record.getUpdatedAt());
            } else {
                resp.setStatus("UNMARKED");
            }

            return resp;
        }).collect(Collectors.toList());
    }

    @Transactional
    public ClubMemberAttendanceResponse markAttendance(MarkAttendanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        OrganizationMember member = organizationMemberRepository.findByOrganizationMemberUuid(request.getOrganizationMemberUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();

        ClubMemberAttendance attendance = attendanceRepository
                .findByOrganizationMemberUuidAndAttendanceDate(member.getOrganizationMemberUuid(), date)
                .orElseGet(() -> {
                    ClubMemberAttendance newAtt = new ClubMemberAttendance();
                    newAtt.setOrganizationId(organization.getOrganizationId());
                    newAtt.setOrganizationUuid(organization.getOrganizationUuid());
                    newAtt.setOrganizationMemberId(member.getOrganizationMemberId());
                    newAtt.setOrganizationMemberUuid(member.getOrganizationMemberUuid());
                    newAtt.setUserId(member.getUserId());
                    newAtt.setUserUuid(member.getUserUuid());
                    newAtt.setAttendanceDate(date);
                    newAtt.setCreatedBy(currentUserId);
                    return newAtt;
                });

        attendance.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "PRESENT");
        if (request.getCheckInTime() != null) {
            attendance.setCheckInTime(request.getCheckInTime());
        } else if ("PRESENT".equalsIgnoreCase(attendance.getStatus()) && attendance.getCheckInTime() == null) {
            attendance.setCheckInTime(LocalTime.now());
        }
        if (request.getNotes() != null) {
            attendance.setNotes(request.getNotes());
        }
        attendance.setUpdatedBy(currentUserId);

        ClubMemberAttendance saved = attendanceRepository.save(attendance);

        List<ClubMemberAttendanceResponse> daily = getDailyAttendance(organization.getOrganizationUuid(), date);
        return daily.stream()
                .filter(r -> r.getOrganizationMemberUuid().equals(member.getOrganizationMemberUuid()))
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public List<ClubMemberAttendanceResponse> bulkMarkAttendance(BulkAttendanceRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();

        if (request.getRecords() != null) {
            for (BulkAttendanceRequest.MemberAttendanceItem item : request.getRecords()) {
                Optional<OrganizationMember> memberOpt = organizationMemberRepository.findByOrganizationMemberUuid(item.getOrganizationMemberUuid());
                if (memberOpt.isPresent()) {
                    OrganizationMember member = memberOpt.get();
                    ClubMemberAttendance attendance = attendanceRepository
                            .findByOrganizationMemberUuidAndAttendanceDate(member.getOrganizationMemberUuid(), date)
                            .orElseGet(() -> {
                                ClubMemberAttendance newAtt = new ClubMemberAttendance();
                                newAtt.setOrganizationId(organization.getOrganizationId());
                                newAtt.setOrganizationUuid(organization.getOrganizationUuid());
                                newAtt.setOrganizationMemberId(member.getOrganizationMemberId());
                                newAtt.setOrganizationMemberUuid(member.getOrganizationMemberUuid());
                                newAtt.setUserId(member.getUserId());
                                newAtt.setUserUuid(member.getUserUuid());
                                newAtt.setAttendanceDate(date);
                                newAtt.setCreatedBy(currentUserId);
                                return newAtt;
                            });

                    attendance.setStatus(item.getStatus() != null ? item.getStatus().toUpperCase() : "PRESENT");
                    if ("PRESENT".equalsIgnoreCase(attendance.getStatus()) && attendance.getCheckInTime() == null) {
                        attendance.setCheckInTime(LocalTime.now());
                    }
                    if (item.getNotes() != null) {
                        attendance.setNotes(item.getNotes());
                    }
                    attendance.setUpdatedBy(currentUserId);
                    attendanceRepository.save(attendance);
                }
            }
        }

        return getDailyAttendance(organization.getOrganizationUuid(), date);
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getAttendanceSummary(UUID organizationUuid, LocalDate date) {
        List<ClubMemberAttendanceResponse> daily = getDailyAttendance(organizationUuid, date);

        int total = daily.size();
        int present = (int) daily.stream().filter(d -> "PRESENT".equalsIgnoreCase(d.getStatus())).count();
        int absent = (int) daily.stream().filter(d -> "ABSENT".equalsIgnoreCase(d.getStatus())).count();
        int leave = (int) daily.stream().filter(d -> "LEAVE".equalsIgnoreCase(d.getStatus())).count();
        int unmarked = (int) daily.stream().filter(d -> "UNMARKED".equalsIgnoreCase(d.getStatus())).count();
        double pct = total > 0 ? ((double) present / total) * 100.0 : 0.0;

        AttendanceSummaryResponse summary = new AttendanceSummaryResponse();
        summary.setDate(date);
        summary.setTotalMembers(total);
        summary.setPresentCount(present);
        summary.setAbsentCount(absent);
        summary.setLeaveCount(leave);
        summary.setUnmarkedCount(unmarked);
        summary.setAttendancePercentage(Math.round(pct * 10.0) / 10.0);

        return summary;
    }
}
