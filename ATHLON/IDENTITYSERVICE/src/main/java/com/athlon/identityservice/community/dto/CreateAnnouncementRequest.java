package com.athlon.identityservice.community.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateAnnouncementRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message content is required")
    private String message;

    private Boolean isPinned = false;

    public CreateAnnouncementRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }
}
