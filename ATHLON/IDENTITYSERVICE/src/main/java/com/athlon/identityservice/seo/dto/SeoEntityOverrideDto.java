package com.athlon.identityservice.seo.dto;

public class SeoEntityOverrideDto {
    private String id;
    private String entityType;
    private String entityId;
    private String entityName;
    private String customTitle;
    private String customDescription;
    private String customCanonical;
    private String customOgImage;
    private String robotsDirective;
    private String publicationStatus;
    private String updatedAt;
    private String updatedBy;

    public SeoEntityOverrideDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getCustomTitle() { return customTitle; }
    public void setCustomTitle(String customTitle) { this.customTitle = customTitle; }

    public String getCustomDescription() { return customDescription; }
    public void setCustomDescription(String customDescription) { this.customDescription = customDescription; }

    public String getCustomCanonical() { return customCanonical; }
    public void setCustomCanonical(String customCanonical) { this.customCanonical = customCanonical; }

    public String getCustomOgImage() { return customOgImage; }
    public void setCustomOgImage(String customOgImage) { this.customOgImage = customOgImage; }

    public String getRobotsDirective() { return robotsDirective; }
    public void setRobotsDirective(String robotsDirective) { this.robotsDirective = robotsDirective; }

    public String getPublicationStatus() { return publicationStatus; }
    public void setPublicationStatus(String publicationStatus) { this.publicationStatus = publicationStatus; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
