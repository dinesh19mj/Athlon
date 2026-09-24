package com.athlon.identityservice.community.dto;

import java.util.UUID;

import com.athlon.identityservice.community.enums.CommunityPostType;

import jakarta.validation.constraints.NotNull;

public class CreatePostRequest {

    private String title;
    private String content;

    @NotNull(message = "Post type is required")
    private CommunityPostType postType = CommunityPostType.TEXT;

    private String mediaUrls;
    private UUID referenceUuid;
    private Boolean isPinned = false;

    public CreatePostRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public CommunityPostType getPostType() {
        return postType;
    }

    public void setPostType(CommunityPostType postType) {
        this.postType = postType;
    }

    public String getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(String mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public UUID getReferenceUuid() {
        return referenceUuid;
    }

    public void setReferenceUuid(UUID referenceUuid) {
        this.referenceUuid = referenceUuid;
    }

    public Boolean getIsPinned() {
        return isPinned;
    }

    public void setIsPinned(Boolean isPinned) {
        this.isPinned = isPinned;
    }
}
