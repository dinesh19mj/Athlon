package com.athlon.identityservice.seo.dto;

public class SeoRedirectDto {
    private String id;
    private String sourcePath;
    private String destinationUrl;
    private Integer redirectType;
    private Boolean enabled;
    private Long hitCount;
    private String notes;
    private String createdAt;
    private String updatedAt;

    public SeoRedirectDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSourcePath() { return sourcePath; }
    public void setSourcePath(String sourcePath) { this.sourcePath = sourcePath; }

    public String getDestinationUrl() { return destinationUrl; }
    public void setDestinationUrl(String destinationUrl) { this.destinationUrl = destinationUrl; }

    public Integer getRedirectType() { return redirectType; }
    public void setRedirectType(Integer redirectType) { this.redirectType = redirectType; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Long getHitCount() { return hitCount; }
    public void setHitCount(Long hitCount) { this.hitCount = hitCount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
