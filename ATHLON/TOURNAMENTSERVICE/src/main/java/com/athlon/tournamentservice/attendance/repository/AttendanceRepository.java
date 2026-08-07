package com.athlon.tournamentservice.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournamentservice.attendance.entity.AttendanceRecord;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByOrgIdAndAttendanceDate(Long orgId, LocalDate attendanceDate);
    List<AttendanceRecord> findByOrgIdAndMemberId(Long orgId, Long memberId);
}

