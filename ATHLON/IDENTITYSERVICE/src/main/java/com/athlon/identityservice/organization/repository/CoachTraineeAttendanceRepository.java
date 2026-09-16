package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.CoachTraineeAttendance;

@Repository
public interface CoachTraineeAttendanceRepository extends JpaRepository<CoachTraineeAttendance, Long> {

    Optional<CoachTraineeAttendance> findByAttendanceUuid(UUID attendanceUuid);

    List<CoachTraineeAttendance> findByOrganizationUuidAndAttendanceDateOrderByCreatedAtAsc(
            UUID organizationUuid, LocalDate attendanceDate);

    List<CoachTraineeAttendance> findByOrganizationUuidAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            UUID organizationUuid, LocalDate startDate, LocalDate endDate);

    List<CoachTraineeAttendance> findByOrganizationUuidAndTraineeUuidOrderByAttendanceDateDesc(
            UUID organizationUuid, UUID traineeUuid);

    Optional<CoachTraineeAttendance> findByOrganizationUuidAndTraineeUuidAndAttendanceDate(
            UUID organizationUuid, UUID traineeUuid, LocalDate attendanceDate);

    long countByOrganizationUuidAndAttendanceDate(UUID organizationUuid, LocalDate attendanceDate);

    long countByOrganizationUuidAndAttendanceDateAndStatus(
            UUID organizationUuid, LocalDate attendanceDate, String status);

    @Query("SELECT COUNT(a) FROM CoachTraineeAttendance a WHERE a.organizationUuid = :orgUuid AND a.traineeUuid = :traineeUuid AND a.status = 'PRESENT'")
    long countPresentByTraineeUuid(@Param("orgUuid") UUID orgUuid, @Param("traineeUuid") UUID traineeUuid);

    @Query("SELECT COUNT(a) FROM CoachTraineeAttendance a WHERE a.organizationUuid = :orgUuid AND a.traineeUuid = :traineeUuid")
    long countTotalByTraineeUuid(@Param("orgUuid") UUID orgUuid, @Param("traineeUuid") UUID traineeUuid);

    void deleteByAttendanceUuid(UUID attendanceUuid);
}
