package com.athlon.identityservice.community.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public class VotePollRequest {

    @NotEmpty(message = "Option IDs are required")
    private List<Long> optionIds;

    public VotePollRequest() {
    }

    public List<Long> getOptionIds() {
        return optionIds;
    }

    public void setOptionIds(List<Long> optionIds) {
        this.optionIds = optionIds;
    }
}
