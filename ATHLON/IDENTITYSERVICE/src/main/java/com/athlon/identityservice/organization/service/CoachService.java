package com.athlon.identityservice.organization.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.athlon.identityservice.organization.entity.CoachFeePackage;
import com.athlon.identityservice.organization.entity.CoachFeeTransaction;
import com.athlon.identityservice.organization.entity.CoachSchedule;
import com.athlon.identityservice.organization.entity.CoachTrainee;
import com.athlon.identityservice.organization.entity.CoachTraineeAttendance;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.CoachFeePackageRepository;
import com.athlon.identityservice.organization.repository.CoachFeeTransactionRepository;
import com.athlon.identityservice.organization.repository.CoachScheduleRepository;
import com.athlon.identityservice.organization.repository.CoachTraineeAttendanceRepository;
import com.athlon.identityservice.organization.repository.CoachTraineeRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class CoachService {

    private final CoachTraineeRepository traineeRepository;
    private final CoachFeePackageRepository packageRepository;
    private final CoachScheduleRepository scheduleRepository;
    private final CoachFeeTransactionRepository transactionRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachTraineeAttendanceRepository attendanceRepository;

    public CoachService(
            CoachTraineeRepository traineeRepository,
            CoachFeePackageRepository packageRepository,
            CoachScheduleRepository scheduleRepository,
            CoachFeeTransactionRepository transactionRepository,
            OrganizationRepository organizationRepository,
            CoachTraineeAttendanceRepository attendanceRepository) {
        this.traineeRepository = traineeRepository;
        this.packageRepository = packageRepository;
        this.scheduleRepository = scheduleRepository;
        this.transactionRepository = transactionRepository;
        this.organizationRepository = organizationRepository;
        this.attendanceRepository = attendanceRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TRAINEE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CoachTraineeResponse> getTrainees(UUID orgUuid, String status) {
        List<CoachTrainee> trainees;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            trainees = traineeRepository.findByOrganizationUuidAndStatusOrderByCreatedAtDesc(orgUuid, status.toUpperCase());
        } else {
            trainees = traineeRepository.findByOrganizationUuidOrderByCreatedAtDesc(orgUuid);
        }
        return trainees.stream().map(this::mapToTraineeResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoachTraineeResponse getTraineeByUuid(UUID traineeUuid) {
        CoachTrainee trainee = traineeRepository.findByTraineeUuid(traineeUuid)
                .orElseThrow(() -> new RuntimeException("Coach trainee not found with uuid: " + traineeUuid));
        return mapToTraineeResponse(trainee);
    }

    @Transactional
    public CoachTraineeResponse createTrainee(CreateCoachTraineeRequest req) {
        CoachTrainee trainee = new CoachTrainee();
        trainee.setOrganizationUuid(req.getOrganizationUuid());
        trainee.setUserUuid(req.getUserUuid());
        trainee.setFullName(req.getFullName());
        trainee.setGender(req.getGender());
        trainee.setDob(req.getDob());
        trainee.setAge(req.getAge());
        trainee.setBloodGroup(req.getBloodGroup());
        trainee.setSkillLevel(req.getSkillLevel() != null ? req.getSkillLevel() : "BEGINNER");
        trainee.setSportType(req.getSportType());
        trainee.setPhone(req.getPhone());
        trainee.setEmail(req.getEmail());
        trainee.setPackageUuid(req.getPackageUuid());
        trainee.setPackageName(req.getPackageName());
        trainee.setParentName(req.getParentName());
        trainee.setParentPhone(req.getParentPhone());
        trainee.setEmergencyContact(req.getEmergencyContact());
        trainee.setAddress(req.getAddress());
        trainee.setPhoto(req.getPhoto());
        trainee.setMedicalNotes(req.getMedicalNotes());
        trainee.setNotes(req.getNotes());
        trainee.setAttendanceRate(req.getAttendanceRate() != null ? req.getAttendanceRate() : 100);
        trainee.setEnrollmentDate(req.getEnrollmentDate() != null ? req.getEnrollmentDate() : LocalDate.now());
        trainee.setStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");

        organizationRepository.findByOrganizationUuid(req.getOrganizationUuid()).ifPresent(org -> {
            trainee.setOrganizationId(org.getOrganizationId());
        });

        CoachTrainee saved = traineeRepository.save(trainee);
        return mapToTraineeResponse(saved);
    }

    @Transactional
    public CoachTraineeResponse updateTrainee(UpdateCoachTraineeRequest req) {
        CoachTrainee trainee = traineeRepository.findByTraineeUuid(req.getTraineeUuid())
                .orElseThrow(() -> new RuntimeException("Coach trainee not found with uuid: " + req.getTraineeUuid()));

        if (req.getFullName() != null) trainee.setFullName(req.getFullName());
        if (req.getGender() != null) trainee.setGender(req.getGender());
        if (req.getDob() != null) trainee.setDob(req.getDob());
        if (req.getAge() != null) trainee.setAge(req.getAge());
        if (req.getBloodGroup() != null) trainee.setBloodGroup(req.getBloodGroup());
        if (req.getSkillLevel() != null) trainee.setSkillLevel(req.getSkillLevel());
        if (req.getSportType() != null) trainee.setSportType(req.getSportType());
        if (req.getPhone() != null) trainee.setPhone(req.getPhone());
        if (req.getEmail() != null) trainee.setEmail(req.getEmail());
        if (req.getPackageUuid() != null) trainee.setPackageUuid(req.getPackageUuid());
        if (req.getPackageName() != null) trainee.setPackageName(req.getPackageName());
        if (req.getParentName() != null) trainee.setParentName(req.getParentName());
        if (req.getParentPhone() != null) trainee.setParentPhone(req.getParentPhone());
        if (req.getEmergencyContact() != null) trainee.setEmergencyContact(req.getEmergencyContact());
        if (req.getAddress() != null) trainee.setAddress(req.getAddress());
        if (req.getPhoto() != null) trainee.setPhoto(req.getPhoto());
        if (req.getMedicalNotes() != null) trainee.setMedicalNotes(req.getMedicalNotes());
        if (req.getNotes() != null) trainee.setNotes(req.getNotes());
        if (req.getAttendanceRate() != null) trainee.setAttendanceRate(req.getAttendanceRate());
        if (req.getEnrollmentDate() != null) trainee.setEnrollmentDate(req.getEnrollmentDate());
        if (req.getStatus() != null) trainee.setStatus(req.getStatus());

        CoachTrainee updated = traineeRepository.save(trainee);
        return mapToTraineeResponse(updated);
    }

    @Transactional
    public void deleteTrainee(UUID traineeUuid) {
        traineeRepository.deleteByTraineeUuid(traineeUuid);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // FEE PACKAGE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CoachFeePackageResponse> getPackages(UUID orgUuid, Boolean activeOnly) {
        List<CoachFeePackage> list;
        if (Boolean.TRUE.equals(activeOnly)) {
            list = packageRepository.findByOrganizationUuidAndActiveOrderByCreatedAtDesc(orgUuid, true);
        } else {
            list = packageRepository.findByOrganizationUuidOrderByCreatedAtDesc(orgUuid);
        }
        return list.stream().map(pkg -> mapToPackageResponse(pkg, orgUuid)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoachFeePackageResponse getPackageByUuid(UUID packageUuid) {
        CoachFeePackage pkg = packageRepository.findByPackageUuid(packageUuid)
                .orElseThrow(() -> new RuntimeException("Coach fee package not found with uuid: " + packageUuid));
        return mapToPackageResponse(pkg, pkg.getOrganizationUuid());
    }

    @Transactional
    public CoachFeePackageResponse createPackage(CreateCoachFeePackageRequest req) {
        CoachFeePackage pkg = new CoachFeePackage();
        pkg.setOrganizationUuid(req.getOrganizationUuid());
        pkg.setName(req.getName());
        pkg.setCategory(req.getCategory() != null ? req.getCategory() : "1on1");
        pkg.setCategoryLabel(req.getCategoryLabel() != null ? req.getCategoryLabel() : "Personal Training");
        pkg.setPrice(req.getPrice() != null ? req.getPrice() : BigDecimal.ZERO);
        pkg.setBillingCycle(req.getBillingCycle() != null ? req.getBillingCycle() : "monthly");
        pkg.setSessionsPerWeek(req.getSessionsPerWeek() != null ? req.getSessionsPerWeek() : 3);
        pkg.setMaxTrainees(req.getMaxTrainees() != null ? req.getMaxTrainees() : 1);
        pkg.setDescription(req.getDescription());
        pkg.setFeatures(req.getFeatures());
        pkg.setIsPopular(Boolean.TRUE.equals(req.getIsPopular()));
        pkg.setActive(req.getActive() != null ? req.getActive() : true);

        organizationRepository.findByOrganizationUuid(req.getOrganizationUuid()).ifPresent(org -> {
            pkg.setOrganizationId(org.getOrganizationId());
        });

        CoachFeePackage saved = packageRepository.save(pkg);
        return mapToPackageResponse(saved, req.getOrganizationUuid());
    }

    @Transactional
    public CoachFeePackageResponse updatePackage(UpdateCoachFeePackageRequest req) {
        CoachFeePackage pkg = packageRepository.findByPackageUuid(req.getPackageUuid())
                .orElseThrow(() -> new RuntimeException("Coach fee package not found with uuid: " + req.getPackageUuid()));

        if (req.getName() != null) pkg.setName(req.getName());
        if (req.getCategory() != null) pkg.setCategory(req.getCategory());
        if (req.getCategoryLabel() != null) pkg.setCategoryLabel(req.getCategoryLabel());
        if (req.getPrice() != null) pkg.setPrice(req.getPrice());
        if (req.getBillingCycle() != null) pkg.setBillingCycle(req.getBillingCycle());
        if (req.getSessionsPerWeek() != null) pkg.setSessionsPerWeek(req.getSessionsPerWeek());
        if (req.getMaxTrainees() != null) pkg.setMaxTrainees(req.getMaxTrainees());
        if (req.getDescription() != null) pkg.setDescription(req.getDescription());
        if (req.getFeatures() != null) pkg.setFeatures(req.getFeatures());
        if (req.getIsPopular() != null) pkg.setIsPopular(req.getIsPopular());
        if (req.getActive() != null) pkg.setActive(req.getActive());

        CoachFeePackage updated = packageRepository.save(pkg);
        return mapToPackageResponse(updated, pkg.getOrganizationUuid());
    }

    @Transactional
    public void deletePackage(UUID packageUuid) {
        packageRepository.deleteByPackageUuid(packageUuid);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCHEDULE & SESSION OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CoachScheduleResponse> getSchedules(UUID orgUuid, LocalDate date) {
        List<CoachSchedule> list;
        if (date != null) {
            list = scheduleRepository.findByOrganizationUuidAndSessionDateOrderByCreatedAtAsc(orgUuid, date);
        } else {
            list = scheduleRepository.findByOrganizationUuidOrderBySessionDateAscCreatedAtAsc(orgUuid);
        }
        return list.stream().map(this::mapToScheduleResponse).collect(Collectors.toList());
    }

    @Transactional
    public CoachScheduleResponse createSchedule(CreateCoachScheduleRequest req) {
        CoachSchedule schedule = new CoachSchedule();
        schedule.setOrganizationUuid(req.getOrganizationUuid());
        schedule.setTraineeUuid(req.getTraineeUuid());
        schedule.setTraineeName(req.getTraineeName());
        schedule.setTraineeAvatar(req.getTraineeAvatar());
        schedule.setPackageUuid(req.getPackageUuid());
        schedule.setPackageName(req.getPackageName());
        schedule.setSessionDate(req.getSessionDate() != null ? req.getSessionDate() : LocalDate.now());
        schedule.setTimeSlot(req.getTimeSlot());
        schedule.setVenue(req.getVenue());
        schedule.setCourt(req.getCourt());
        schedule.setFocusArea(req.getFocusArea());
        schedule.setStatus(req.getStatus() != null ? req.getStatus() : "SCHEDULED");
        schedule.setIsCheckedIn(Boolean.TRUE.equals(req.getIsCheckedIn()));
        schedule.setCoachNotes(req.getCoachNotes());

        organizationRepository.findByOrganizationUuid(req.getOrganizationUuid()).ifPresent(org -> {
            schedule.setOrganizationId(org.getOrganizationId());
        });

        CoachSchedule saved = scheduleRepository.save(schedule);
        return mapToScheduleResponse(saved);
    }

    @Transactional
    public CoachScheduleResponse updateSchedule(UpdateCoachScheduleRequest req) {
        CoachSchedule schedule = scheduleRepository.findBySessionUuid(req.getSessionUuid())
                .orElseThrow(() -> new RuntimeException("Coach schedule not found with uuid: " + req.getSessionUuid()));

        if (req.getTraineeName() != null) schedule.setTraineeName(req.getTraineeName());
        if (req.getTraineeAvatar() != null) schedule.setTraineeAvatar(req.getTraineeAvatar());
        if (req.getPackageUuid() != null) schedule.setPackageUuid(req.getPackageUuid());
        if (req.getPackageName() != null) schedule.setPackageName(req.getPackageName());
        if (req.getSessionDate() != null) schedule.setSessionDate(req.getSessionDate());
        if (req.getTimeSlot() != null) schedule.setTimeSlot(req.getTimeSlot());
        if (req.getVenue() != null) schedule.setVenue(req.getVenue());
        if (req.getCourt() != null) schedule.setCourt(req.getCourt());
        if (req.getFocusArea() != null) schedule.setFocusArea(req.getFocusArea());
        if (req.getStatus() != null) schedule.setStatus(req.getStatus());
        if (req.getIsCheckedIn() != null) schedule.setIsCheckedIn(req.getIsCheckedIn());
        if (req.getCheckInTime() != null) schedule.setCheckInTime(req.getCheckInTime());
        if (req.getCoachNotes() != null) schedule.setCoachNotes(req.getCoachNotes());

        CoachSchedule updated = scheduleRepository.save(schedule);
        return mapToScheduleResponse(updated);
    }

    @Transactional
    public CoachScheduleResponse checkInSession(UUID sessionUuid) {
        CoachSchedule schedule = scheduleRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new RuntimeException("Coach schedule not found with uuid: " + sessionUuid));

        schedule.setIsCheckedIn(true);
        schedule.setCheckInTime(LocalDateTime.now());
        schedule.setStatus("IN_PROGRESS");

        CoachSchedule saved = scheduleRepository.save(schedule);
        return mapToScheduleResponse(saved);
    }

    @Transactional
    public void deleteSchedule(UUID sessionUuid) {
        scheduleRepository.deleteBySessionUuid(sessionUuid);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // FEE TRANSACTIONS & INVOICES
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CoachFeeTransactionResponse> getTransactions(UUID orgUuid, String status) {
        List<CoachFeeTransaction> list;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = transactionRepository.findByOrganizationUuidAndStatusOrderByCreatedAtDesc(orgUuid, status.toUpperCase());
        } else {
            list = transactionRepository.findByOrganizationUuidOrderByCreatedAtDesc(orgUuid);
        }
        return list.stream().map(this::mapToTransactionResponse).collect(Collectors.toList());
    }

    @Transactional
    public CoachFeeTransactionResponse createTransaction(CreateCoachFeeTransactionRequest req) {
        CoachFeeTransaction tx = new CoachFeeTransaction();
        tx.setOrganizationUuid(req.getOrganizationUuid());
        tx.setTraineeUuid(req.getTraineeUuid());
        tx.setTraineeName(req.getTraineeName());
        tx.setTraineeAvatar(req.getTraineeAvatar());
        tx.setPackageUuid(req.getPackageUuid());
        tx.setPackageName(req.getPackageName());
        tx.setAmount(req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO);
        tx.setBillingPeriod(req.getBillingPeriod());
        tx.setDueDate(req.getDueDate());
        tx.setPaidDate(req.getPaidDate());
        tx.setStatus(req.getStatus() != null ? req.getStatus().toUpperCase() : "PENDING");
        tx.setPaymentMethod(req.getPaymentMethod());
        tx.setPaymentRef(req.getPaymentRef());
        tx.setNotes(req.getNotes());

        organizationRepository.findByOrganizationUuid(req.getOrganizationUuid()).ifPresent(org -> {
            tx.setOrganizationId(org.getOrganizationId());
        });

        CoachFeeTransaction saved = transactionRepository.save(tx);
        return mapToTransactionResponse(saved);
    }

    @Transactional
    public CoachFeeTransactionResponse recordPayment(RecordCoachPaymentRequest req) {
        CoachFeeTransaction tx = transactionRepository.findByTransactionUuid(req.getTransactionUuid())
                .orElseThrow(() -> new RuntimeException("Coach transaction not found with uuid: " + req.getTransactionUuid()));

        tx.setStatus("PAID");
        tx.setPaidDate(req.getPaidDate() != null ? req.getPaidDate() : LocalDate.now());
        if (req.getAmount() != null) tx.setAmount(req.getAmount());
        if (req.getPaymentMethod() != null) tx.setPaymentMethod(req.getPaymentMethod());
        if (req.getPaymentRef() != null) tx.setPaymentRef(req.getPaymentRef());
        if (req.getNotes() != null) tx.setNotes(req.getNotes());

        CoachFeeTransaction saved = transactionRepository.save(tx);
        return mapToTransactionResponse(saved);
    }

    @Transactional
    public CoachFeeTransactionResponse sendReminder(UUID transactionUuid) {
        CoachFeeTransaction tx = transactionRepository.findByTransactionUuid(transactionUuid)
                .orElseThrow(() -> new RuntimeException("Coach transaction not found with uuid: " + transactionUuid));

        tx.setReminderSentAt(LocalDateTime.now());
        CoachFeeTransaction saved = transactionRepository.save(tx);
        return mapToTransactionResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // DASHBOARD TELEMETRY AGGREGATION
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CoachDashboardSummaryResponse getDashboardSummary(UUID orgUuid) {
        CoachDashboardSummaryResponse summary = new CoachDashboardSummaryResponse();
        summary.setOrganizationUuid(orgUuid);

        long activeTrainees = traineeRepository.countByOrganizationUuidAndStatus(orgUuid, "ACTIVE");
        summary.setActiveTraineesCount(activeTrainees);

        LocalDate today = LocalDate.now();
        long totalToday = scheduleRepository.countByOrganizationUuidAndSessionDate(orgUuid, today);
        long completedToday = scheduleRepository.countByOrganizationUuidAndSessionDateAndIsCheckedIn(orgUuid, today, true);
        summary.setTotalSessionsToday(totalToday);
        summary.setCompletedSessionsToday(completedToday);

        BigDecimal paidRev = transactionRepository.sumPaidAmountByOrganizationUuid(orgUuid);
        BigDecimal pendingRev = transactionRepository.sumPendingAmountByOrganizationUuid(orgUuid);
        summary.setMonthlyRevenuePaid(paidRev != null ? paidRev : BigDecimal.ZERO);
        summary.setMonthlyRevenuePending(pendingRev != null ? pendingRev : BigDecimal.ZERO);

        List<CoachFeePackage> packages = packageRepository.findByOrganizationUuidAndActiveOrderByCreatedAtDesc(orgUuid, true);
        BigDecimal projected = BigDecimal.ZERO;
        for (CoachFeePackage p : packages) {
            long enrolled = traineeRepository.countByOrganizationUuidAndPackageUuid(orgUuid, p.getPackageUuid());
            BigDecimal price = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
            int mult = "per_session".equalsIgnoreCase(p.getBillingCycle()) ? (p.getSessionsPerWeek() * 4) : 1;
            BigDecimal pkgTotal = price.multiply(BigDecimal.valueOf(mult * enrolled));
            projected = projected.add(pkgTotal);
        }
        summary.setProjectedMonthlyRevenue(projected);

        List<CoachSchedule> todayList = scheduleRepository.findByOrganizationUuidAndSessionDateOrderByCreatedAtAsc(orgUuid, today);
        summary.setTodaySchedules(todayList.stream().map(this::mapToScheduleResponse).collect(Collectors.toList()));

        List<CoachTrainee> recent = traineeRepository.findByOrganizationUuidOrderByCreatedAtDesc(orgUuid);
        summary.setRecentTrainees(recent.stream().limit(5).map(this::mapToTraineeResponse).collect(Collectors.toList()));

        summary.setActivePackages(packages.stream().map(p -> mapToPackageResponse(p, orgUuid)).collect(Collectors.toList()));

        return summary;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MAPPER HELPERS
    // ─────────────────────────────────────────────────────────────────────────────

    private CoachTraineeResponse mapToTraineeResponse(CoachTrainee t) {
        CoachTraineeResponse r = new CoachTraineeResponse();
        r.setTraineeId(t.getTraineeId());
        r.setTraineeUuid(t.getTraineeUuid());
        r.setOrganizationId(t.getOrganizationId());
        r.setOrganizationUuid(t.getOrganizationUuid());
        r.setUserId(t.getUserId());
        r.setUserUuid(t.getUserUuid());
        r.setFullName(t.getFullName());
        r.setGender(t.getGender());
        r.setDob(t.getDob());
        r.setAge(t.getAge());
        r.setBloodGroup(t.getBloodGroup());
        r.setSkillLevel(t.getSkillLevel());
        r.setSportType(t.getSportType());
        r.setPhone(t.getPhone());
        r.setEmail(t.getEmail());
        r.setPackageUuid(t.getPackageUuid());
        r.setPackageName(t.getPackageName());
        r.setParentName(t.getParentName());
        r.setParentPhone(t.getParentPhone());
        r.setEmergencyContact(t.getEmergencyContact());
        r.setAddress(t.getAddress());
        r.setPhoto(t.getPhoto());
        r.setMedicalNotes(t.getMedicalNotes());
        r.setNotes(t.getNotes());
        r.setAttendanceRate(t.getAttendanceRate());
        r.setEnrollmentDate(t.getEnrollmentDate());
        r.setStatus(t.getStatus());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        return r;
    }

    private CoachFeePackageResponse mapToPackageResponse(CoachFeePackage p, UUID orgUuid) {
        CoachFeePackageResponse r = new CoachFeePackageResponse();
        r.setPackageId(p.getPackageId());
        r.setPackageUuid(p.getPackageUuid());
        r.setOrganizationId(p.getOrganizationId());
        r.setOrganizationUuid(p.getOrganizationUuid());
        r.setName(p.getName());
        r.setCategory(p.getCategory());
        r.setCategoryLabel(p.getCategoryLabel());
        r.setPrice(p.getPrice());
        r.setBillingCycle(p.getBillingCycle());
        r.setSessionsPerWeek(p.getSessionsPerWeek());
        r.setMaxTrainees(p.getMaxTrainees());
        long enrolled = traineeRepository.countByOrganizationUuidAndPackageUuid(orgUuid, p.getPackageUuid());
        r.setEnrolledCount((int) enrolled);
        r.setDescription(p.getDescription());
        r.setFeatures(p.getFeatures());
        r.setIsPopular(p.getIsPopular());
        r.setActive(p.getActive());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }

    private CoachScheduleResponse mapToScheduleResponse(CoachSchedule s) {
        CoachScheduleResponse r = new CoachScheduleResponse();
        r.setSessionId(s.getSessionId());
        r.setSessionUuid(s.getSessionUuid());
        r.setOrganizationId(s.getOrganizationId());
        r.setOrganizationUuid(s.getOrganizationUuid());
        r.setTraineeUuid(s.getTraineeUuid());
        r.setTraineeName(s.getTraineeName());
        r.setTraineeAvatar(s.getTraineeAvatar());
        r.setPackageUuid(s.getPackageUuid());
        r.setPackageName(s.getPackageName());
        r.setSessionDate(s.getSessionDate());
        r.setTimeSlot(s.getTimeSlot());
        r.setVenue(s.getVenue());
        r.setCourt(s.getCourt());
        r.setFocusArea(s.getFocusArea());
        r.setStatus(s.getStatus());
        r.setIsCheckedIn(s.getIsCheckedIn());
        r.setCheckInTime(s.getCheckInTime());
        r.setCoachNotes(s.getCoachNotes());
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }

    private CoachFeeTransactionResponse mapToTransactionResponse(CoachFeeTransaction tx) {
        CoachFeeTransactionResponse r = new CoachFeeTransactionResponse();
        r.setTransactionId(tx.getTransactionId());
        r.setTransactionUuid(tx.getTransactionUuid());
        r.setOrganizationId(tx.getOrganizationId());
        r.setOrganizationUuid(tx.getOrganizationUuid());
        r.setTraineeUuid(tx.getTraineeUuid());
        r.setTraineeName(tx.getTraineeName());
        r.setTraineeAvatar(tx.getTraineeAvatar());
        r.setPackageUuid(tx.getPackageUuid());
        r.setPackageName(tx.getPackageName());
        r.setAmount(tx.getAmount());
        r.setBillingPeriod(tx.getBillingPeriod());
        r.setDueDate(tx.getDueDate());
        r.setPaidDate(tx.getPaidDate());
        r.setStatus(tx.getStatus());
        r.setPaymentMethod(tx.getPaymentMethod());
        r.setPaymentRef(tx.getPaymentRef());
        r.setReminderSentAt(tx.getReminderSentAt());
        r.setNotes(tx.getNotes());
        r.setCreatedAt(tx.getCreatedAt());
        r.setUpdatedAt(tx.getUpdatedAt());
        return r;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // COACH TRAINEE ATTENDANCE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CoachAttendanceResponse> getAttendanceByDate(UUID orgUuid, LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<CoachTraineeAttendance> list = attendanceRepository
                .findByOrganizationUuidAndAttendanceDateOrderByCreatedAtAsc(orgUuid, targetDate);
        return list.stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoachAttendanceSummaryResponse getAttendanceSummary(UUID orgUuid, LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        long totalTrainees = traineeRepository.countByOrganizationUuidAndStatus(orgUuid, "ACTIVE");
        long present = attendanceRepository.countByOrganizationUuidAndAttendanceDateAndStatus(orgUuid, targetDate, "PRESENT");
        long absent = attendanceRepository.countByOrganizationUuidAndAttendanceDateAndStatus(orgUuid, targetDate, "ABSENT");
        long late = attendanceRepository.countByOrganizationUuidAndAttendanceDateAndStatus(orgUuid, targetDate, "LATE");
        long excused = attendanceRepository.countByOrganizationUuidAndAttendanceDateAndStatus(orgUuid, targetDate, "EXCUSED");

        double percentage = 0.0;
        long markedTotal = present + absent + late + excused;
        if (markedTotal > 0) {
            percentage = Math.round(((double) (present + late) / (double) markedTotal) * 1000.0) / 10.0;
        }

        CoachAttendanceSummaryResponse summary = new CoachAttendanceSummaryResponse();
        summary.setOrganizationUuid(orgUuid);
        summary.setDate(targetDate);
        summary.setTotalTrainees(totalTrainees);
        summary.setPresentCount(present);
        summary.setAbsentCount(absent);
        summary.setLateCount(late);
        summary.setExcusedCount(excused);
        summary.setAttendancePercentage(percentage);
        return summary;
    }

    @Transactional(readOnly = true)
    public List<CoachAttendanceResponse> getTraineeAttendanceHistory(UUID orgUuid, UUID traineeUuid, LocalDate from, LocalDate to) {
        List<CoachTraineeAttendance> list;
        if (from != null && to != null) {
            list = attendanceRepository.findByOrganizationUuidAndAttendanceDateBetweenOrderByAttendanceDateDesc(orgUuid, from, to)
                    .stream()
                    .filter(a -> traineeUuid.equals(a.getTraineeUuid()))
                    .collect(Collectors.toList());
        } else {
            list = attendanceRepository.findByOrganizationUuidAndTraineeUuidOrderByAttendanceDateDesc(orgUuid, traineeUuid);
        }
        return list.stream().map(this::mapToAttendanceResponse).collect(Collectors.toList());
    }

    @Transactional
    public CoachAttendanceResponse markAttendance(MarkCoachAttendanceRequest req) {
        LocalDate date = req.getAttendanceDate() != null ? req.getAttendanceDate() : LocalDate.now();
        CoachTraineeAttendance attendance = attendanceRepository
                .findByOrganizationUuidAndTraineeUuidAndAttendanceDate(req.getOrganizationUuid(), req.getTraineeUuid(), date)
                .orElseGet(() -> {
                    CoachTraineeAttendance a = new CoachTraineeAttendance();
                    a.setOrganizationUuid(req.getOrganizationUuid());
                    a.setTraineeUuid(req.getTraineeUuid());
                    a.setAttendanceDate(date);
                    return a;
                });

        attendance.setStatus(req.getStatus() != null ? req.getStatus().toUpperCase() : "PRESENT");
        if (req.getTraineeName() != null) attendance.setTraineeName(req.getTraineeName());
        if (req.getTraineeAvatar() != null) attendance.setTraineeAvatar(req.getTraineeAvatar());
        if (req.getPackageUuid() != null) attendance.setPackageUuid(req.getPackageUuid());
        if (req.getPackageName() != null) attendance.setPackageName(req.getPackageName());
        if (req.getCheckInTime() != null) attendance.setCheckInTime(req.getCheckInTime());
        if (req.getCheckOutTime() != null) attendance.setCheckOutTime(req.getCheckOutTime());
        if (req.getFocusDrills() != null) attendance.setFocusDrills(req.getFocusDrills());
        if (req.getPerformanceRating() != null) attendance.setPerformanceRating(req.getPerformanceRating());
        if (req.getCoachNotes() != null) attendance.setCoachNotes(req.getCoachNotes());

        organizationRepository.findByOrganizationUuid(req.getOrganizationUuid()).ifPresent(org -> {
            attendance.setOrganizationId(org.getOrganizationId());
        });

        traineeRepository.findByTraineeUuid(req.getTraineeUuid()).ifPresent(trainee -> {
            attendance.setTraineeId(trainee.getTraineeId());
            if (attendance.getTraineeName() == null) attendance.setTraineeName(trainee.getFullName());
            if (attendance.getTraineeAvatar() == null) attendance.setTraineeAvatar(trainee.getPhoto());
            if (attendance.getPackageUuid() == null) attendance.setPackageUuid(trainee.getPackageUuid());
            if (attendance.getPackageName() == null) attendance.setPackageName(trainee.getPackageName());
        });

        CoachTraineeAttendance saved = attendanceRepository.save(attendance);

        // Recalculate trainee overall attendance rate
        updateTraineeAttendanceRate(req.getOrganizationUuid(), req.getTraineeUuid());

        return mapToAttendanceResponse(saved);
    }

    @Transactional
    public List<CoachAttendanceResponse> bulkMarkAttendance(BulkCoachAttendanceRequest req) {
        List<CoachAttendanceResponse> responses = new ArrayList<>();
        if (req.getRecords() == null || req.getRecords().isEmpty()) {
            return responses;
        }

        for (MarkCoachAttendanceRequest singleReq : req.getRecords()) {
            if (singleReq.getOrganizationUuid() == null) {
                singleReq.setOrganizationUuid(req.getOrganizationUuid());
            }
            if (singleReq.getAttendanceDate() == null) {
                singleReq.setAttendanceDate(req.getAttendanceDate());
            }
            responses.add(markAttendance(singleReq));
        }

        return responses;
    }

    @Transactional
    public void deleteAttendance(UUID attendanceUuid) {
        attendanceRepository.findByAttendanceUuid(attendanceUuid).ifPresent(a -> {
            UUID orgUuid = a.getOrganizationUuid();
            UUID traineeUuid = a.getTraineeUuid();
            attendanceRepository.deleteByAttendanceUuid(attendanceUuid);
            updateTraineeAttendanceRate(orgUuid, traineeUuid);
        });
    }

    private void updateTraineeAttendanceRate(UUID orgUuid, UUID traineeUuid) {
        try {
            long total = attendanceRepository.countTotalByTraineeUuid(orgUuid, traineeUuid);
            if (total > 0) {
                long present = attendanceRepository.countPresentByTraineeUuid(orgUuid, traineeUuid);
                int rate = (int) Math.round(((double) present / (double) total) * 100.0);
                traineeRepository.findByTraineeUuid(traineeUuid).ifPresent(t -> {
                    t.setAttendanceRate(rate);
                    traineeRepository.save(t);
                });
            }
        } catch (Exception ignored) {
        }
    }

    private CoachAttendanceResponse mapToAttendanceResponse(CoachTraineeAttendance a) {
        CoachAttendanceResponse r = new CoachAttendanceResponse();
        r.setAttendanceId(a.getAttendanceId());
        r.setAttendanceUuid(a.getAttendanceUuid());
        r.setOrganizationId(a.getOrganizationId());
        r.setOrganizationUuid(a.getOrganizationUuid());
        r.setTraineeId(a.getTraineeId());
        r.setTraineeUuid(a.getTraineeUuid());
        r.setTraineeName(a.getTraineeName());
        r.setTraineeAvatar(a.getTraineeAvatar());
        r.setPackageUuid(a.getPackageUuid());
        r.setPackageName(a.getPackageName());
        r.setAttendanceDate(a.getAttendanceDate());
        r.setStatus(a.getStatus());
        r.setCheckInTime(a.getCheckInTime());
        r.setCheckOutTime(a.getCheckOutTime());
        r.setFocusDrills(a.getFocusDrills());
        r.setPerformanceRating(a.getPerformanceRating());
        r.setCoachNotes(a.getCoachNotes());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
