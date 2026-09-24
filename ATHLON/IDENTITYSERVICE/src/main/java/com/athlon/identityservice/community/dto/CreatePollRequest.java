package com.athlon.identityservice.community.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class CreatePollRequest {

    @NotBlank(message = "Question is required")
    private String question;

    @NotEmpty(message = "At least two options are required")
    private List<String> options;

    private Boolean allowMultipleChoices = false;
    private LocalDateTime expiresAt;

    public CreatePollRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Boolean getAllowMultipleChoices() {
        return allowMultipleChoices;
    }

    public void setAllowMultipleChoices(Boolean allowMultipleChoices) {
        this.allowMultipleChoices = allowMultipleChoices;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
