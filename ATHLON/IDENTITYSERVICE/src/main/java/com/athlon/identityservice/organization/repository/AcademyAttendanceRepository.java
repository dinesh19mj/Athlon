package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.AcademyAttendance;

@Repository
public interface AcademyAttendanceRepository extends JpaRepository<AcademyAttendance, Long> {

    List<AcademyAttendance> findByOrganizationUuidAndAttendanceDate(UUID organizationUuid, LocalDate attendanceDate);

    List<AcademyAttendance> findByOrganizationUuidAndAttendeeTypeAndAttendanceDate(UUID organizationUuid, String attendeeType, LocalDate attendanceDate);

    List<AcademyAttendance> findByOrganizationUuidAndBatchUuidAndAttendanceDate(UUID organizationUuid, UUID batchUuid, LocalDate attendanceDate);

    Optional<AcademyAttendance> findByOrganizationUuidAndAttendeeUuidAndAttendanceDate(UUID organizationUuid, UUID attendeeUuid, LocalDate attendanceDate);

    Optional<AcademyAttendance> findByAttendanceUuid(UUID attendanceUuid);

    List<AcademyAttendance> findByOrganizationUuidAndAttendanceDateBetween(UUID organizationUuid, LocalDate startDate, LocalDate endDate);
}
