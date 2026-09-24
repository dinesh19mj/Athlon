package com.athlon.identityservice.community.dto;

import java.util.List;
import java.util.UUID;

import com.athlon.identityservice.community.enums.SessionAttendanceStatus;

import jakarta.validation.constraints.NotEmpty;

public class MarkAttendanceRequest {

    public static class MemberAttendanceRecord {
        private UUID userUuid;
        private SessionAttendanceStatus status = SessionAttendanceStatus.PRESENT;
        private String notes;

        public MemberAttendanceRecord() {
        }

        public UUID getUserUuid() {
            return userUuid;
        }

        public void setUserUuid(UUID userUuid) {
            this.userUuid = userUuid;
        }

        public SessionAttendanceStatus getStatus() {
            return status;
        }

        public void setStatus(SessionAttendanceStatus status) {
            this.status = status;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    @NotEmpty(message = "Attendance records cannot be empty")
    private List<MemberAttendanceRecord> records;

    public MarkAttendanceRequest() {
    }

    public List<MemberAttendanceRecord> getRecords() {
        return records;
    }

    public void setRecords(List<MemberAttendanceRecord> records) {
        this.records = records;
    }
}
