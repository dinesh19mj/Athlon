package com.athlon.tournament.attendance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournament.attendance.entity.AttendanceRecord;
import com.athlon.tournament.attendance.repository.AttendanceRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public AttendanceRecord markAttendance(AttendanceRecord record) {
        record.setCreatedOn(LocalDateTime.now());
        if (record.getAttendanceDate() == null) {
            record.setAttendanceDate(LocalDate.now());
        }
        return attendanceRepository.save(record);
    }

    public List<AttendanceRecord> getAttendanceByOrgAndDate(Long orgId, LocalDate date) {
        return attendanceRepository.findByOrgIdAndAttendanceDate(orgId, date);
    }

    public List<AttendanceRecord> getAttendanceByMember(Long orgId, Long memberId) {
        return attendanceRepository.findByOrgIdAndMemberId(orgId, memberId);
    }
}
