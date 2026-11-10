package com.athlon.identityservice.seo.dto;

import java.util.List;
import java.util.Map;

public class SeoTemplateDto {
    private String id;
    private String entityType;
    private String name;
    private String titleTemplate;
    private String descriptionTemplate;
    private String canonicalTemplate;
    private String ogTitleTemplate;
    private String ogDescriptionTemplate;
    private String defaultOgImage;
    private String robotsDirective;
    private String schemaType;
    private boolean enabled;
    private String publicationStatus;
    private List<String> supportedPlaceholders;
    private Map<String, String> sampleData;
    private String lastUpdated;

    public SeoTemplateDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTitleTemplate() { return titleTemplate; }
    public void setTitleTemplate(String titleTemplate) { this.titleTemplate = titleTemplate; }

    public String getDescriptionTemplate() { return descriptionTemplate; }
    public void setDescriptionTemplate(String descriptionTemplate) { this.descriptionTemplate = descriptionTemplate; }

    public String getCanonicalTemplate() { return canonicalTemplate; }
    public void setCanonicalTemplate(String canonicalTemplate) { this.canonicalTemplate = canonicalTemplate; }

    public String getOgTitleTemplate() { return ogTitleTemplate; }
    public void setOgTitleTemplate(String ogTitleTemplate) { this.ogTitleTemplate = ogTitleTemplate; }

    public String getOgDescriptionTemplate() { return ogDescriptionTemplate; }
    public void setOgDescriptionTemplate(String ogDescriptionTemplate) { this.ogDescriptionTemplate = ogDescriptionTemplate; }

    public String getDefaultOgImage() { return defaultOgImage; }
    public void setDefaultOgImage(String defaultOgImage) { this.defaultOgImage = defaultOgImage; }

    public String getRobotsDirective() { return robotsDirective; }
    public void setRobotsDirective(String robotsDirective) { this.robotsDirective = robotsDirective; }

    public String getSchemaType() { return schemaType; }
    public void setSchemaType(String schemaType) { this.schemaType = schemaType; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getPublicationStatus() { return publicationStatus; }
    public void setPublicationStatus(String publicationStatus) { this.publicationStatus = publicationStatus; }

    public List<String> getSupportedPlaceholders() { return supportedPlaceholders; }
    public void setSupportedPlaceholders(List<String> supportedPlaceholders) { this.supportedPlaceholders = supportedPlaceholders; }

    public Map<String, String> getSampleData() { return sampleData; }
    public void setSampleData(Map<String, String> sampleData) { this.sampleData = sampleData; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}
