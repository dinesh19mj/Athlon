package com.athlon.paymentservice.dto;

import java.util.UUID;

import com.athlon.paymentservice.enums.OfflinePaymentStatus;

import jakarta.validation.constraints.NotNull;

public class OfflinePaymentVerifyRequest {

    @NotNull(message = "Offline record ID is required")
    private UUID recordId;

    @NotNull(message = "Target status is required")
    private OfflinePaymentStatus status; // VERIFIED, COLLECTED_AT_DESK, or REJECTED

    private UUID staffId;
    private String staffName;
    private String staffReceiptNumber;
    private String staffNotes;
    private String rejectionReason;

    public OfflinePaymentVerifyRequest() {
    }

    public UUID getRecordId() {
        return recordId;
    }

    public void setRecordId(UUID recordId) {
        this.recordId = recordId;
    }

    public OfflinePaymentStatus getStatus() {
        return status;
    }

    public void setStatus(OfflinePaymentStatus status) {
        this.status = status;
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStaffReceiptNumber() {
        return staffReceiptNumber;
    }

    public void setStaffReceiptNumber(String staffReceiptNumber) {
        this.staffReceiptNumber = staffReceiptNumber;
    }

    public String getStaffNotes() {
        return staffNotes;
    }

    public void setStaffNotes(String staffNotes) {
        this.staffNotes = staffNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
