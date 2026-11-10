package com.athlon.identityservice.seo.dto;

public class ResolvedMetadataResponse {
    private String title;
    private String description;
    private String canonicalUrl;
    private String robotsDirective;
    private String ogTitle;
    private String ogDescription;
    private String ogImageUrl;
    private String twitterCardType;
    private String schemaJsonLd;

    public ResolvedMetadataResponse() {}

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

    public String getTwitterCardType() { return twitterCardType; }
    public void setTwitterCardType(String twitterCardType) { this.twitterCardType = twitterCardType; }

    public String getSchemaJsonLd() { return schemaJsonLd; }
    public void setSchemaJsonLd(String schemaJsonLd) { this.schemaJsonLd = schemaJsonLd; }
}
