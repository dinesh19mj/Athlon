package com.athlon.identityservice.seo.dto;

public class SeoPageDto {
    private String id;
    private String pageKey;
    private String pageName;
    private String routePattern;
    private String pageType;
    private String title;
    private String description;
    private String canonicalUrl;
    private String robotsDirective;
    private String ogTitle;
    private String ogDescription;
    private String ogImageUrl;
    private String publicationStatus;
    private String indexability;
    private String structuredDataType;
    private String module;
    private String lastUpdated;
    private String updatedBy;

    public SeoPageDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
