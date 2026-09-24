package com.athlon.identityservice.community.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCommentRequest {

    @NotBlank(message = "Comment text is required")
    private String commentText;

    public CreateCommentRequest() {
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }
}
