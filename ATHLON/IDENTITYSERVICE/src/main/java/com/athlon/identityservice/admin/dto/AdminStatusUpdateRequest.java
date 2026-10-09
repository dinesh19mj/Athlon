package com.athlon.identityservice.admin.dto;

import jakarta.validation.constraints.NotBlank;

public class AdminStatusUpdateRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String reason;

    public AdminStatusUpdateRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
