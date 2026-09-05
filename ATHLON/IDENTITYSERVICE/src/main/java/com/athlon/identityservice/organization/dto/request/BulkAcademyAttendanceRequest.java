package com.athlon.identityservice.organization.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class BulkAcademyAttendanceRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotEmpty(message = "Records list cannot be empty")
    @Valid
    private List<MarkAcademyAttendanceRequest> records;

    public BulkAcademyAttendanceRequest() {
    }

    public BulkAcademyAttendanceRequest(UUID organizationUuid, List<MarkAcademyAttendanceRequest> records) {
        this.organizationUuid = organizationUuid;
        this.records = records;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public List<MarkAcademyAttendanceRequest> getRecords() {
        return records;
    }

    public void setRecords(List<MarkAcademyAttendanceRequest> records) {
        this.records = records;
    }
}
