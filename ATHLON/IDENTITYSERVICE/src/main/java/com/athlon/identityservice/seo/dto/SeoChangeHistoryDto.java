package com.athlon.identityservice.seo.dto;

public class SeoChangeHistoryDto {
    private String id;
    private String entityType;
    private String entityId;
    private String entityName;
    private String action;
    private String summary;
    private String changedBy;
    private String changedAt;

    public SeoChangeHistoryDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public String getChangedAt() { return changedAt; }
    public void setChangedAt(String changedAt) { this.changedAt = changedAt; }
}
