package com.athlon.identityservice.seo.dto;

import java.util.List;
import java.util.Map;

public class SeoGlobalSettingsDto {
    private String id;
    private String siteName;
    private String siteUrl;
    private String canonicalBaseUrl;
    private String defaultTitle;
    private String defaultDescription;
    private String titleSeparator;
    private String defaultOgTitle;
    private String defaultOgDescription;
    private String defaultOgImage;
    private String twitterCardType;
    private String organizationName;
    private String organizationLogo;
    private String defaultLocale;
    private List<String> supportedLocales;
    private String defaultRobots;
    private Map<String, String> socialProfiles;
    private String googleVerificationCode;
    private String bingVerificationCode;
    private String updatedAt;

    public SeoGlobalSettingsDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }

    public String getSiteUrl() { return siteUrl; }
    public void setSiteUrl(String siteUrl) { this.siteUrl = siteUrl; }

    public String getCanonicalBaseUrl() { return canonicalBaseUrl; }
    public void setCanonicalBaseUrl(String canonicalBaseUrl) { this.canonicalBaseUrl = canonicalBaseUrl; }

    public String getDefaultTitle() { return defaultTitle; }
    public void setDefaultTitle(String defaultTitle) { this.defaultTitle = defaultTitle; }

    public String getDefaultDescription() { return defaultDescription; }
    public void setDefaultDescription(String defaultDescription) { this.defaultDescription = defaultDescription; }

    public String getTitleSeparator() { return titleSeparator; }
    public void setTitleSeparator(String titleSeparator) { this.titleSeparator = titleSeparator; }

    public String getDefaultOgTitle() { return defaultOgTitle; }
    public void setDefaultOgTitle(String defaultOgTitle) { this.defaultOgTitle = defaultOgTitle; }

    public String getDefaultOgDescription() { return defaultOgDescription; }
    public void setDefaultOgDescription(String defaultOgDescription) { this.defaultOgDescription = defaultOgDescription; }

    public String getDefaultOgImage() { return defaultOgImage; }
    public void setDefaultOgImage(String defaultOgImage) { this.defaultOgImage = defaultOgImage; }

    public String getTwitterCardType() { return twitterCardType; }
    public void setTwitterCardType(String twitterCardType) { this.twitterCardType = twitterCardType; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getOrganizationLogo() { return organizationLogo; }
    public void setOrganizationLogo(String organizationLogo) { this.organizationLogo = organizationLogo; }

    public String getDefaultLocale() { return defaultLocale; }
    public void setDefaultLocale(String defaultLocale) { this.defaultLocale = defaultLocale; }

    public List<String> getSupportedLocales() { return supportedLocales; }
    public void setSupportedLocales(List<String> supportedLocales) { this.supportedLocales = supportedLocales; }

    public String getDefaultRobots() { return defaultRobots; }
    public void setDefaultRobots(String defaultRobots) { this.defaultRobots = defaultRobots; }

    public Map<String, String> getSocialProfiles() { return socialProfiles; }
    public void setSocialProfiles(Map<String, String> socialProfiles) { this.socialProfiles = socialProfiles; }

    public String getGoogleVerificationCode() { return googleVerificationCode; }
    public void setGoogleVerificationCode(String googleVerificationCode) { this.googleVerificationCode = googleVerificationCode; }

    public String getBingVerificationCode() { return bingVerificationCode; }
    public void setBingVerificationCode(String bingVerificationCode) { this.bingVerificationCode = bingVerificationCode; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
