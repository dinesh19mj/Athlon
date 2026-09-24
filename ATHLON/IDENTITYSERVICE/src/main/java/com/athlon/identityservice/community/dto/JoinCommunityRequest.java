package com.athlon.identityservice.community.dto;

public class JoinCommunityRequest {
    private String requestMessage;

    public JoinCommunityRequest() {}

    public JoinCommunityRequest(String requestMessage) {
        this.requestMessage = requestMessage;
    }

    public String getRequestMessage() {
        return requestMessage;
    }

    public void setRequestMessage(String requestMessage) {
        this.requestMessage = requestMessage;
    }
}
