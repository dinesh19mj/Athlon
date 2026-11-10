package com.athlon.identityservice.seo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seo_pages")
public class SeoPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "page_key", nullable = false, unique = true)
    private String pageKey;

    @Column(name = "page_name", nullable = false)
    private String pageName;

    @Column(name = "route_pattern", nullable = false)
    private String routePattern;

    @Column(name = "page_type", length = 50, nullable = false)
    private String pageType = "DISCOVERY";

    @Column(name = "title", nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "canonical_url")
    private String canonicalUrl;

    @Column(name = "robots_directive", length = 100)
    private String robotsDirective = "index, follow";

    @Column(name = "og_title", columnDefinition = "TEXT")
    private String ogTitle;

    @Column(name = "og_description", columnDefinition = "TEXT")
    private String ogDescription;

    @Column(name = "og_image_url")
    private String ogImageUrl;

    @Column(name = "publication_status", length = 50)
    private String publicationStatus = "PUBLISHED";

    @Column(name = "indexability", length = 50)
    private String indexability = "INDEXABLE";

    @Column(name = "structured_data_type")
    private String structuredDataType;

    @Column(name = "module", length = 100)
    private String module = "Core";

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    @Column(name = "updated_by")
    private String updatedBy = "Super Admin";

    public SeoPage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPageKey() { return pageKey; }
    public void setPageKey(String pageKey) { this.pageKey = pageKey; }

    public String getPageName() { return pageName; }
    public void setPageName(String pageName) { this.pageName = pageName; }

    public String getRoutePattern() { return routePattern; }
    public void setRoutePattern(String routePattern) { this.routePattern = routePattern; }

    public String getPageType() { return pageType; }
    public void setPageType(String pageType) { this.pageType = pageType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCanonicalUrl() { return canonicalUrl; }
    public void setCanonicalUrl(String canonicalUrl) { this.canonicalUrl = canonicalUrl; }

    public String getRobotsDirective() { return robotsDirective; }
    public void setRobotsDirective(String robotsDirective) { this.robotsDirective = robotsDirective; }

    public String getOgTitle() { return ogTitle; }
    public void setOgTitle(String ogTitle) { this.ogTitle = ogTitle; }

    public String getOgDescription() { return ogDescription; }
    public void setOgDescription(String ogDescription) { this.ogDescription = ogDescription; }

    public String getOgImageUrl() { return ogImageUrl; }
    public void setOgImageUrl(String ogImageUrl) { this.ogImageUrl = ogImageUrl; }

    public String getPublicationStatus() { return publicationStatus; }
    public void setPublicationStatus(String publicationStatus) { this.publicationStatus = publicationStatus; }

    public String getIndexability() { return indexability; }
    public void setIndexability(String indexability) { this.indexability = indexability; }

    public String getStructuredDataType() { return structuredDataType; }
    public void setStructuredDataType(String structuredDataType) { this.structuredDataType = structuredDataType; }

    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
