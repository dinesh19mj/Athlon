package com.athlon.identityservice.organization.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.identityservice.organization.entity.ClubMemberAttendance;

@Repository
public interface ClubMemberAttendanceRepository extends JpaRepository<ClubMemberAttendance, Long> {

    List<ClubMemberAttendance> findByOrganizationUuidAndAttendanceDate(UUID organizationUuid, LocalDate attendanceDate);

    Optional<ClubMemberAttendance> findByOrganizationMemberUuidAndAttendanceDate(UUID organizationMemberUuid, LocalDate attendanceDate);

    List<ClubMemberAttendance> findByOrganizationUuidAndAttendanceDateBetween(UUID organizationUuid, LocalDate startDate, LocalDate endDate);

    List<ClubMemberAttendance> findByOrganizationMemberUuidOrderByAttendanceDateDesc(UUID organizationMemberUuid);

    void deleteByOrganizationMemberUuidAndAttendanceDate(UUID organizationMemberUuid, LocalDate attendanceDate);
}
