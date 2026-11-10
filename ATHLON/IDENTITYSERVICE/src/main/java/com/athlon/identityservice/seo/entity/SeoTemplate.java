package com.athlon.identityservice.seo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seo_templates")
public class SeoTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, unique = true, length = 50)
    private String entityType;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "title_template", nullable = false, columnDefinition = "TEXT")
    private String titleTemplate;

    @Column(name = "description_template", nullable = false, columnDefinition = "TEXT")
    private String descriptionTemplate;

    @Column(name = "canonical_template", nullable = false, columnDefinition = "TEXT")
    private String canonicalTemplate;

    @Column(name = "og_title_template", columnDefinition = "TEXT")
    private String ogTitleTemplate;

    @Column(name = "og_description_template", columnDefinition = "TEXT")
    private String ogDescriptionTemplate;

    @Column(name = "default_og_image")
    private String defaultOgImage = "https://athlon.co.in/images/athlon-banner.jpg";

    @Column(name = "robots_directive", length = 100)
    private String robotsDirective = "index, follow";

    @Column(name = "schema_type", length = 100)
    private String schemaType = "SportsEvent";

    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @Column(name = "publication_status", length = 50)
    private String publicationStatus = "PUBLISHED";

    @Column(name = "supported_placeholders", columnDefinition = "TEXT")
    private String supportedPlaceholders;

    @Column(name = "sample_data_json", columnDefinition = "TEXT")
    private String sampleDataJson;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public SeoTemplate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public String getPublicationStatus() { return publicationStatus; }
    public void setPublicationStatus(String publicationStatus) { this.publicationStatus = publicationStatus; }

    public String getSupportedPlaceholders() { return supportedPlaceholders; }
    public void setSupportedPlaceholders(String supportedPlaceholders) { this.supportedPlaceholders = supportedPlaceholders; }

    public String getSampleDataJson() { return sampleDataJson; }
    public void setSampleDataJson(String sampleDataJson) { this.sampleDataJson = sampleDataJson; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
