package com.athlon.identityservice.organization.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class BulkAttendanceRequest {

    private UUID organizationUuid;
    private LocalDate attendanceDate;
    private List<MemberAttendanceItem> records;

    public static class MemberAttendanceItem {
        private UUID organizationMemberUuid;
        private String status; // PRESENT, ABSENT, LEAVE
        private String notes;

        public MemberAttendanceItem() {
        }

        public UUID getOrganizationMemberUuid() {
            return organizationMemberUuid;
        }

        public void setOrganizationMemberUuid(UUID organizationMemberUuid) {
            this.organizationMemberUuid = organizationMemberUuid;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public BulkAttendanceRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<MemberAttendanceItem> getRecords() {
        return records;
    }

    public void setRecords(List<MemberAttendanceItem> records) {
        this.records = records;
    }
}
