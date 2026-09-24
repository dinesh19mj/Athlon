package com.athlon.identityservice.community.dto;

public class ReactPostRequest {
    private String reactionType;

    public ReactPostRequest() {}

    public ReactPostRequest(String reactionType) {
        this.reactionType = reactionType;
    }

    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }
}
