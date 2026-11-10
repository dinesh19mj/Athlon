package com.athlon.identityservice.seo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seo_global_settings")
public class SeoGlobalSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "site_name", nullable = false)
    private String siteName = "ATHLON";

    @Column(name = "site_url", nullable = false)
    private String siteUrl = "https://athlon.co.in";

    @Column(name = "canonical_base_url", nullable = false)
    private String canonicalBaseUrl = "https://athlon.co.in";

    @Column(name = "default_title", nullable = false)
    private String defaultTitle = "ATHLON | Sports Tournaments, Venues & Live Scores";

    @Column(name = "default_description", columnDefinition = "TEXT")
    private String defaultDescription = "Discover sports tournaments, book courts, manage academies, follow real-time live scores, and connect with the sports community on ATHLON.";

    @Column(name = "title_separator", length = 10)
    private String titleSeparator = "|";

    @Column(name = "default_og_title")
    private String defaultOgTitle = "ATHLON | The Tournament Experience, Elevated";

    @Column(name = "default_og_description", columnDefinition = "TEXT")
    private String defaultOgDescription = "Real-time scoring, tournament fixtures, court bookings, and sports community on ATHLON.";

    @Column(name = "default_og_image")
    private String defaultOgImage = "https://athlon.co.in/images/athlon-banner.jpg";

    @Column(name = "twitter_card_type", length = 50)
    private String twitterCardType = "summary_large_image";

    @Column(name = "organization_name")
    private String organizationName = "Athlon Sports Management Platform";

    @Column(name = "organization_logo")
    private String organizationLogo = "https://athlon.co.in/icons/app-logo.png";

    @Column(name = "default_locale", length = 20)
    private String defaultLocale = "en_IN";

    @Column(name = "default_robots", columnDefinition = "TEXT")
    private String defaultRobots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    @Column(name = "social_facebook")
    private String socialFacebook;

    @Column(name = "social_instagram")
    private String socialInstagram = "https://instagram.com/athlonsports";

    @Column(name = "social_twitter")
    private String socialTwitter = "https://x.com/athlonsports";

    @Column(name = "social_youtube")
    private String socialYoutube = "https://youtube.com/@athlonsports";

    @Column(name = "social_linkedin")
    private String socialLinkedin = "https://linkedin.com/company/athlon-sports";

    @Column(name = "google_verification_code")
    private String googleVerificationCode;

    @Column(name = "bing_verification_code")
    private String bingVerificationCode;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SeoGlobalSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getDefaultRobots() { return defaultRobots; }
    public void setDefaultRobots(String defaultRobots) { this.defaultRobots = defaultRobots; }

    public String getSocialFacebook() { return socialFacebook; }
    public void setSocialFacebook(String socialFacebook) { this.socialFacebook = socialFacebook; }

    public String getSocialInstagram() { return socialInstagram; }
    public void setSocialInstagram(String socialInstagram) { this.socialInstagram = socialInstagram; }

    public String getSocialTwitter() { return socialTwitter; }
    public void setSocialTwitter(String socialTwitter) { this.socialTwitter = socialTwitter; }

    public String getSocialYoutube() { return socialYoutube; }
    public void setSocialYoutube(String socialYoutube) { this.socialYoutube = socialYoutube; }

    public String getSocialLinkedin() { return socialLinkedin; }
    public void setSocialLinkedin(String socialLinkedin) { this.socialLinkedin = socialLinkedin; }

    public String getGoogleVerificationCode() { return googleVerificationCode; }
    public void setGoogleVerificationCode(String googleVerificationCode) { this.googleVerificationCode = googleVerificationCode; }

    public String getBingVerificationCode() { return bingVerificationCode; }
    public void setBingVerificationCode(String bingVerificationCode) { this.bingVerificationCode = bingVerificationCode; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
