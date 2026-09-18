package com.athlon.identityservice.venue.dto;

public class BookingCancellationRequest {
    private String reason;

    public BookingCancellationRequest() {}

    public BookingCancellationRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
