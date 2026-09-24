package com.athlon.identityservice.community.dto;

import com.athlon.identityservice.community.enums.SessionRsvpStatus;

import jakarta.validation.constraints.NotNull;

public class SessionRsvpRequest {

    @NotNull(message = "RSVP status is required")
    private SessionRsvpStatus rsvpStatus = SessionRsvpStatus.GOING;

    private Integer guestCount = 0;
    private String notes;

    public SessionRsvpRequest() {
    }

    public SessionRsvpStatus getRsvpStatus() {
        return rsvpStatus;
    }

    public void setRsvpStatus(SessionRsvpStatus rsvpStatus) {
        this.rsvpStatus = rsvpStatus;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
