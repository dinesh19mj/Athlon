package com.athlon.identityservice.seo.service;

import com.athlon.identityservice.seo.dto.*;
import com.athlon.identityservice.seo.entity.*;
import com.athlon.identityservice.seo.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SeoServiceImpl implements SeoService {

    private final SeoGlobalSettingsRepository globalSettingsRepository;
    private final SeoPageRepository pageRepository;
    private final SeoTemplateRepository templateRepository;
    private final SeoEntityOverrideRepository overrideRepository;
    private final SeoRedirectRepository redirectRepository;
    private final SeoAuditIssueRepository auditIssueRepository;
    private final SeoChangeHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public SeoServiceImpl(
            SeoGlobalSettingsRepository globalSettingsRepository,
            SeoPageRepository pageRepository,
            SeoTemplateRepository templateRepository,
            SeoEntityOverrideRepository overrideRepository,
            SeoRedirectRepository redirectRepository,
            SeoAuditIssueRepository auditIssueRepository,
            SeoChangeHistoryRepository historyRepository) {
        this.globalSettingsRepository = globalSettingsRepository;
        this.pageRepository = pageRepository;
        this.templateRepository = templateRepository;
        this.overrideRepository = overrideRepository;
        this.redirectRepository = redirectRepository;
        this.auditIssueRepository = auditIssueRepository;
        this.historyRepository = historyRepository;
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void seedInitialSeoDataIfEmpty() {
        if (globalSettingsRepository.count() == 0) {
            SeoGlobalSettings settings = new SeoGlobalSettings();
            globalSettingsRepository.save(settings);
        }

        if (pageRepository.count() == 0) {
            seedPages();
        }

        if (templateRepository.count() == 0) {
            seedTemplates();
        }

        if (redirectRepository.count() == 0) {
            seedRedirects();
        }

        if (auditIssueRepository.count() == 0) {
            seedAuditIssues();
        }
    }

    private void seedPages() {
        List<SeoPage> pages = new ArrayList<>();

        SeoPage home = new SeoPage();
        home.setPageKey("HOMEPAGE");
        home.setPageName("Home Landing Page");
        home.setRoutePattern("/");
        home.setPageType("HOME");
        home.setTitle("ATHLON | The tournament experience, elevated.");
        home.setDescription("ATHLON is a premier sports-tournament management platform with real-time scoring, live brackets, court bookings, and role-based experiences.");
        home.setCanonicalUrl("https://athlon.co.in/");
        home.setRobotsDirective("index, follow");
        home.setOgTitle("ATHLON | Live Sports Tournament Platform");
        home.setOgDescription("Manage sports tournaments with real-time scoring and live brackets.");
        home.setOgImageUrl("https://athlon.co.in/market-hero-bg.jpg");
        home.setPublicationStatus("PUBLISHED");
        home.setIndexability("INDEXABLE");
        home.setStructuredDataType("WebSite, Organization");
        home.setModule("Core");
        pages.add(home);

        SeoPage tournaments = new SeoPage();
        tournaments.setPageKey("TOURNAMENT_HUB");
        tournaments.setPageName("Tournaments Discovery Hub");
        tournaments.setRoutePattern("/tournaments");
        tournaments.setPageType("DISCOVERY");
        tournaments.setTitle("Explore Sports Tournaments | Badminton, Football & Cricket | ATHLON");
        tournaments.setDescription("Discover and register for state and national tournaments with verified organizers, instant bracket updates, and live court scheduling.");
        tournaments.setCanonicalUrl("https://athlon.co.in/tournaments");
        tournaments.setRobotsDirective("index, follow");
        tournaments.setOgTitle("Sports Tournaments Hub | ATHLON");
        tournaments.setOgDescription("Browse upcoming and live tournaments across India.");
        tournaments.setOgImageUrl("https://athlon.co.in/images/athlon-banner.jpg");
        tournaments.setPublicationStatus("PUBLISHED");
        tournaments.setIndexability("INDEXABLE");
        tournaments.setStructuredDataType("CollectionPage");
        tournaments.setModule("Tournaments");
        pages.add(tournaments);

        SeoPage venues = new SeoPage();
        venues.setPageKey("VENUE_HUB");
        venues.setPageName("Venues & Courts Directory");
        venues.setRoutePattern("/venues");
        venues.setPageType("DISCOVERY");
        venues.setTitle("Book Sports Venues & Courts Near You | ATHLON");
        venues.setDescription("Find verified badminton arenas, cricket nets, football turfs, and tennis courts with real-time slot availability and instant booking.");
        venues.setCanonicalUrl("https://athlon.co.in/venues");
        venues.setRobotsDirective("index, follow");
        venues.setOgTitle("Sports Venues & Court Bookings | ATHLON");
        venues.setOgDescription("Book premium sports arenas near you with instant confirmation.");
        venues.setOgImageUrl("https://athlon.co.in/images/venues-banner.jpg");
        venues.setPublicationStatus("PUBLISHED");
        venues.setIndexability("INDEXABLE");
        venues.setStructuredDataType("CollectionPage, Place");
        venues.setModule("Venues");
        pages.add(venues);

        SeoPage academies = new SeoPage();
        academies.setPageKey("ACADEMY_HUB");
        academies.setPageName("Sports Academies & Training");
        academies.setRoutePattern("/academies");
        academies.setPageType("DISCOVERY");
        academies.setTitle("Top Sports Academies & Certified Coaches | ATHLON");
        academies.setDescription("Connect with certified training centers, professional coaches, and youth development programs across all major sports disciplines.");
        academies.setCanonicalUrl("https://athlon.co.in/academies");
        academies.setRobotsDirective("index, follow");
        academies.setOgTitle("Sports Academies & Professional Coaching | ATHLON");
        academies.setOgDescription("Enroll in accredited sports training academies.");
        academies.setOgImageUrl("https://athlon.co.in/images/academies-banner.jpg");
        academies.setPublicationStatus("PUBLISHED");
        academies.setIndexability("INDEXABLE");
        academies.setStructuredDataType("CollectionPage");
        academies.setModule("Academies");
        pages.add(academies);

        SeoPage coaches = new SeoPage();
        coaches.setPageKey("COACH_HUB");
        coaches.setPageName("Verified Coaches Directory");
        coaches.setRoutePattern("/coaches");
        coaches.setPageType("DISCOVERY");
        coaches.setTitle("Hire Verified Sports Coaches & Personal Trainers | ATHLON");
        coaches.setDescription("Find accredited personal trainers, high-performance sports coaches, and specialized mentors in your city.");
        coaches.setCanonicalUrl("https://athlon.co.in/coaches");
        coaches.setRobotsDirective("index, follow");
        coaches.setOgTitle("Verified Sports Coaches Directory | ATHLON");
        coaches.setOgDescription("Hire accredited trainers and mentors for sports development.");
        coaches.setOgImageUrl("https://athlon.co.in/images/coaches-banner.jpg");
        coaches.setPublicationStatus("PUBLISHED");
        coaches.setIndexability("INDEXABLE");
        coaches.setStructuredDataType("CollectionPage");
        coaches.setModule("Coaches");
        pages.add(coaches);

        SeoPage communities = new SeoPage();
        communities.setPageKey("COMMUNITY_HUB");
        communities.setPageName("Sports Communities & Clubs");
        communities.setRoutePattern("/communities");
        communities.setPageType("DISCOVERY");
        communities.setTitle("Join Sports Communities & Matchmaking Groups | ATHLON");
        communities.setDescription("Join active amateur sports clubs, organize casual practice matches, and connect with players sharing your skill level.");
        communities.setCanonicalUrl("https://athlon.co.in/communities");
        communities.setRobotsDirective("index, follow");
        communities.setOgTitle("Sports Community & Matchmaking | ATHLON");
        communities.setOgDescription("Connect with local athletes and join clubs.");
        communities.setOgImageUrl("https://athlon.co.in/images/communities-banner.jpg");
        communities.setPublicationStatus("PUBLISHED");
        communities.setIndexability("INDEXABLE");
        communities.setStructuredDataType("CollectionPage");
        communities.setModule("Community");
        pages.add(communities);

        SeoPage market = new SeoPage();
        market.setPageKey("MARKETPLACE");
        market.setPageName("Sports Marketplace & Gear");
        market.setRoutePattern("/market");
        market.setPageType("DISCOVERY");
        market.setTitle("Sports Marketplace | Verified Gear & Equipment | ATHLON");
        market.setDescription("Buy certified sports equipment, tournament merchandise, and training gear directly from verified suppliers and partners.");
        market.setCanonicalUrl("https://athlon.co.in/market");
        market.setRobotsDirective("index, follow");
        market.setOgTitle("Athlon Sports Equipment Marketplace");
        market.setOgDescription("Exclusive sports equipment and tournament gear.");
        market.setOgImageUrl("https://athlon.co.in/images/market-banner.jpg");
        market.setPublicationStatus("PUBLISHED");
        market.setIndexability("INDEXABLE");
        market.setStructuredDataType("CollectionPage");
        market.setModule("Market");
        pages.add(market);

        SeoPage privacy = new SeoPage();
        privacy.setPageKey("PRIVACY_POLICY");
        privacy.setPageName("Privacy Policy");
        privacy.setRoutePattern("/privacy");
        privacy.setPageType("LEGAL");
        privacy.setTitle("Privacy Policy | Data Protection & Rights | ATHLON");
        privacy.setDescription("Read ATHLON privacy practices, account data security, compliance terms, and user control protocols.");
        privacy.setCanonicalUrl("https://athlon.co.in/privacy");
        privacy.setRobotsDirective("index, follow");
        privacy.setOgTitle("Privacy Policy | ATHLON");
        privacy.setOgDescription("Data protection standards and compliance at ATHLON.");
        privacy.setOgImageUrl("https://athlon.co.in/images/athlon-banner.jpg");
        privacy.setPublicationStatus("PUBLISHED");
        privacy.setIndexability("INDEXABLE");
        privacy.setStructuredDataType("WebPage");
        privacy.setModule("Legal");
        pages.add(privacy);

        SeoPage terms = new SeoPage();
        terms.setPageKey("TERMS_OF_SERVICE");
        terms.setPageName("Terms of Service");
        terms.setRoutePattern("/terms");
        terms.setPageType("LEGAL");
        terms.setTitle("Terms of Service & Platform Guidelines | ATHLON");
        terms.setDescription("Official user terms, tournament participation guidelines, organizer covenants, and platform rules on ATHLON.");
        terms.setCanonicalUrl("https://athlon.co.in/terms");
        terms.setRobotsDirective("index, follow");
        terms.setOgTitle("Terms of Service | ATHLON");
        terms.setOgDescription("User terms and tournament platform conditions.");
        terms.setOgImageUrl("https://athlon.co.in/images/athlon-banner.jpg");
        terms.setPublicationStatus("PUBLISHED");
        terms.setIndexability("INDEXABLE");
        terms.setStructuredDataType("WebPage");
        terms.setModule("Legal");
        pages.add(terms);

        pageRepository.saveAll(pages);
    }

    private void seedTemplates() {
        List<SeoTemplate> templates = new ArrayList<>();

        SeoTemplate tour = new SeoTemplate();
        tour.setEntityType("TOURNAMENT");
        tour.setName("Tournament Detail Page Template");
        tour.setTitleTemplate("{title} | {sport} Tournament in {city} | ATHLON");
        tour.setDescriptionTemplate("Register for {title} happening at {venue}, {city} on {dates}. Organized by {organizer}. Live fixtures, draws, and real-time scores.");
        tour.setCanonicalTemplate("https://athlon.co.in/tournaments/{id}");
        tour.setOgTitleTemplate("{title} | Live Scores & Draws");
        tour.setOgDescriptionTemplate("Join {title} in {city}. Organized by {organizer}. Follow live court scores and brackets.");
        tour.setDefaultOgImage("https://athlon.co.in/images/tournament-default-og.jpg");
        tour.setRobotsDirective("index, follow");
        tour.setSchemaType("SportsEvent");
        tour.setEnabled(true);
        tour.setSupportedPlaceholders("title,sport,city,venue,dates,organizer,id");
        tour.setSampleDataJson("{\"title\":\"State Badminton Championship 2026\",\"sport\":\"Badminton\",\"city\":\"Bangalore\",\"venue\":\"Kanteerava Indoor Stadium\",\"dates\":\"Nov 15-18, 2026\",\"organizer\":\"Karnataka Badminton Association\",\"id\":\"tour-101\"}");
        templates.add(tour);

        SeoTemplate venue = new SeoTemplate();
        venue.setEntityType("VENUE");
        venue.setName("Venue & Court Booking Template");
        venue.setTitleTemplate("Book {venueName} in {city} | Courts & Slots | ATHLON");
        venue.setDescriptionTemplate("Book courts at {venueName}, {city}. View real-time availability, slot prices, amenities, and player ratings.");
        venue.setCanonicalTemplate("https://athlon.co.in/venues/{id}");
        venue.setOgTitleTemplate("{venueName} | Sports Arena in {city}");
        venue.setOgDescriptionTemplate("Find and book court slots at {venueName}.");
        venue.setDefaultOgImage("https://athlon.co.in/images/venues-banner.jpg");
        venue.setRobotsDirective("index, follow");
        venue.setSchemaType("SportsActivityLocation");
        venue.setEnabled(true);
        venue.setSupportedPlaceholders("venueName,city,sports,address,id");
        venue.setSampleDataJson("{\"venueName\":\"Smash Arena Pro\",\"city\":\"Hyderabad\",\"sports\":\"Badminton, Tennis\",\"address\":\"Gachibowli Main Rd\",\"id\":\"v-202\"}");
        templates.add(venue);

        SeoTemplate academy = new SeoTemplate();
        academy.setEntityType("ACADEMY");
        academy.setName("Academy Profile Template");
        academy.setTitleTemplate("{academyName} | Professional Sports Training in {city} | ATHLON");
        academy.setDescriptionTemplate("Enroll at {academyName} in {city}. Certified coaches, world-class sports facilities, and professional training programs.");
        academy.setCanonicalTemplate("https://athlon.co.in/academies/{id}");
        academy.setOgTitleTemplate("{academyName} | Elite Coaching");
        academy.setOgDescriptionTemplate("Professional coaching programs at {academyName}.");
        academy.setDefaultOgImage("https://athlon.co.in/images/academies-banner.jpg");
        academy.setRobotsDirective("index, follow");
        academy.setSchemaType("SportsActivityLocation");
        academy.setEnabled(true);
        academy.setSupportedPlaceholders("academyName,city,sports,id");
        academy.setSampleDataJson("{\"academyName\":\"Apex Badminton Academy\",\"city\":\"Chennai\",\"sports\":\"Badminton\",\"id\":\"acad-303\"}");
        templates.add(academy);

        SeoTemplate coach = new SeoTemplate();
        coach.setEntityType("COACH");
        coach.setName("Coach Profile Template");
        coach.setTitleTemplate("Coach {coachName} | Certified {sport} Trainer in {city} | ATHLON");
        coach.setDescriptionTemplate("Book personalized coaching sessions with {coachName}, certified {sport} coach in {city}. Verified credentials and student reviews.");
        coach.setCanonicalTemplate("https://athlon.co.in/coaches/{id}");
        coach.setOgTitleTemplate("Coach {coachName} | {sport} Mentorship");
        coach.setOgDescriptionTemplate("Training with {coachName} in {city}.");
        coach.setDefaultOgImage("https://athlon.co.in/images/coaches-banner.jpg");
        coach.setRobotsDirective("index, follow");
        coach.setSchemaType("Person");
        coach.setEnabled(true);
        coach.setSupportedPlaceholders("coachName,sport,city,id");
        coach.setSampleDataJson("{\"coachName\":\"Arun Kumar\",\"sport\":\"Football\",\"city\":\"Mumbai\",\"id\":\"coach-404\"}");
        templates.add(coach);

        templateRepository.saveAll(templates);
    }

    private void seedRedirects() {
        List<SeoRedirect> redirects = new ArrayList<>();

        SeoRedirect r1 = new SeoRedirect();
        r1.setSourcePath("/events");
        r1.setDestinationUrl("/tournaments");
        r1.setRedirectType(301);
        r1.setEnabled(true);
        r1.setHitCount(1420L);
        r1.setNotes("Legacy URL migration");
        redirects.add(r1);

        SeoRedirect r2 = new SeoRedirect();
        r2.setSourcePath("/courts");
        r2.setDestinationUrl("/venues");
        r2.setRedirectType(301);
        r2.setEnabled(true);
        r2.setHitCount(850L);
        r2.setNotes("Keyword consolidation");
        redirects.add(r2);

        redirectRepository.saveAll(redirects);
    }

    private void seedAuditIssues() {
        List<SeoAuditIssue> issues = new ArrayList<>();

        SeoAuditIssue i1 = new SeoAuditIssue();
        i1.setPageRoute("/tournaments");
        i1.setPageName("Tournaments Discovery Hub");
        i1.setIssueType("Missing Sub-Topic Microdata");
        i1.setSeverity("INFO");
        i1.setExplanation("Add ItemList schema to tournaments discovery page to qualify for Google Carousel rich results.");
        i1.setRecommendedFix("Include ItemList JSON-LD with top upcoming tournament entities.");
        i1.setStatus("OPEN");
        issues.add(i1);

        SeoAuditIssue i2 = new SeoAuditIssue();
        i2.setPageRoute("/market");
        i2.setPageName("Marketplace");
        i2.setIssueType("Short Meta Description");
        i2.setSeverity("WARNING");
        i2.setExplanation("Meta description is 112 characters, which is below the optimal threshold of 130-165 characters.");
        i2.setRecommendedFix("Expand description to highlight certified equipment categories and fast shipping.");
        i2.setStatus("OPEN");
        issues.add(i2);

        auditIssueRepository.saveAll(issues);
    }

    // ──────────────── Dashboard Stats ────────────────
    @Override
    public SeoDashboardStatsDto getDashboardStats() {
        SeoDashboardStatsDto stats = new SeoDashboardStatsDto();
        stats.setTotalEligiblePublicPages((int) pageRepository.count());
        stats.setConfiguredMetadataCount((int) pageRepository.findByPublicationStatus("PUBLISHED").size());
        stats.setMissingMetadataCount((int) pageRepository.findByPublicationStatus("DRAFT").size());
        stats.setWarningCount((int) auditIssueRepository.findByStatus("OPEN").size());
        stats.setActiveTemplatesCount((int) templateRepository.findByEnabledTrue().size());
        stats.setRedirectRulesCount((int) redirectRepository.findByEnabledTrue().size());
        stats.setSitemapsCount(4);
        stats.setPublishedChangesCount((int) historyRepository.count());
        stats.setSearchConsoleStatus("CONNECTED");
        stats.setLastAuditRun(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return stats;
    }

    // ──────────────── Global Settings ────────────────
    @Override
    public SeoGlobalSettingsDto getGlobalSettings() {
        SeoGlobalSettings settings = globalSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> globalSettingsRepository.save(new SeoGlobalSettings()));
        return toDto(settings);
    }

    @Override
    public SeoGlobalSettingsDto saveGlobalSettings(SeoGlobalSettingsDto dto) {
        SeoGlobalSettings settings = globalSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(SeoGlobalSettings::new);

        if (dto.getSiteName() != null) settings.setSiteName(dto.getSiteName());
        if (dto.getSiteUrl() != null) settings.setSiteUrl(dto.getSiteUrl());
        if (dto.getCanonicalBaseUrl() != null) settings.setCanonicalBaseUrl(dto.getCanonicalBaseUrl());
        if (dto.getDefaultTitle() != null) settings.setDefaultTitle(dto.getDefaultTitle());
        if (dto.getDefaultDescription() != null) settings.setDefaultDescription(dto.getDefaultDescription());
        if (dto.getTitleSeparator() != null) settings.setTitleSeparator(dto.getTitleSeparator());
        if (dto.getDefaultOgTitle() != null) settings.setDefaultOgTitle(dto.getDefaultOgTitle());
        if (dto.getDefaultOgDescription() != null) settings.setDefaultOgDescription(dto.getDefaultOgDescription());
        if (dto.getDefaultOgImage() != null) settings.setDefaultOgImage(dto.getDefaultOgImage());
        if (dto.getTwitterCardType() != null) settings.setTwitterCardType(dto.getTwitterCardType());
        if (dto.getOrganizationName() != null) settings.setOrganizationName(dto.getOrganizationName());
        if (dto.getOrganizationLogo() != null) settings.setOrganizationLogo(dto.getOrganizationLogo());
        if (dto.getDefaultLocale() != null) settings.setDefaultLocale(dto.getDefaultLocale());
        if (dto.getDefaultRobots() != null) settings.setDefaultRobots(dto.getDefaultRobots());
        if (dto.getGoogleVerificationCode() != null) settings.setGoogleVerificationCode(dto.getGoogleVerificationCode());
        if (dto.getBingVerificationCode() != null) settings.setBingVerificationCode(dto.getBingVerificationCode());

        if (dto.getSocialProfiles() != null) {
            settings.setSocialFacebook(dto.getSocialProfiles().get("facebook"));
            settings.setSocialInstagram(dto.getSocialProfiles().get("instagram"));
            settings.setSocialTwitter(dto.getSocialProfiles().get("twitter"));
            settings.setSocialYoutube(dto.getSocialProfiles().get("youtube"));
            settings.setSocialLinkedin(dto.getSocialProfiles().get("linkedin"));
        }

        settings.setUpdatedAt(LocalDateTime.now());
        SeoGlobalSettings saved = globalSettingsRepository.save(settings);

        recordHistory("GLOBAL_SETTINGS", "global", "Site-wide SEO Config", "UPDATE", "Updated global SEO settings and social tags");
        return toDto(saved);
    }

    // ──────────────── Pages ────────────────
    @Override
    public List<SeoPageDto> getAllPages() {
        return pageRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SeoPageDto getPageById(String id) {
        Long pageId = parseLongSafe(id);
        if (pageId == null) return null;
        return pageRepository.findById(pageId).map(this::toDto).orElse(null);
    }

    @Override
    public SeoPageDto getPageByRoute(String routePattern) {
        return pageRepository.findByRoutePattern(routePattern).map(this::toDto).orElse(null);
    }

    @Override
    public SeoPageDto savePage(SeoPageDto dto) {
        Long pageId = parseLongSafe(dto.getId());
        SeoPage page = pageId != null ? pageRepository.findById(pageId).orElse(new SeoPage()) : new SeoPage();

        if (dto.getPageKey() != null) page.setPageKey(dto.getPageKey());
        if (dto.getPageName() != null) page.setPageName(dto.getPageName());
        if (dto.getRoutePattern() != null) page.setRoutePattern(dto.getRoutePattern());
        if (dto.getPageType() != null) page.setPageType(dto.getPageType());
        if (dto.getTitle() != null) page.setTitle(dto.getTitle());
        if (dto.getDescription() != null) page.setDescription(dto.getDescription());
        if (dto.getCanonicalUrl() != null) page.setCanonicalUrl(dto.getCanonicalUrl());
        if (dto.getRobotsDirective() != null) page.setRobotsDirective(dto.getRobotsDirective());
        if (dto.getOgTitle() != null) page.setOgTitle(dto.getOgTitle());
        if (dto.getOgDescription() != null) page.setOgDescription(dto.getOgDescription());
        if (dto.getOgImageUrl() != null) page.setOgImageUrl(dto.getOgImageUrl());
        if (dto.getPublicationStatus() != null) page.setPublicationStatus(dto.getPublicationStatus());
        if (dto.getIndexability() != null) page.setIndexability(dto.getIndexability());
        if (dto.getStructuredDataType() != null) page.setStructuredDataType(dto.getStructuredDataType());
        if (dto.getModule() != null) page.setModule(dto.getModule());
        page.setLastUpdated(LocalDateTime.now());
        if (dto.getUpdatedBy() != null) page.setUpdatedBy(dto.getUpdatedBy());

        SeoPage saved = pageRepository.save(page);
        recordHistory("STATIC_PAGE", String.valueOf(saved.getId()), saved.getPageName(), "UPDATE", "Saved metadata for page " + saved.getPageName());
        return toDto(saved);
    }

    // ──────────────── Dynamic Templates ────────────────
    @Override
    public List<SeoTemplateDto> getAllTemplates() {
        return templateRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SeoTemplateDto getTemplateByEntityType(String entityType) {
        return templateRepository.findByEntityType(entityType).map(this::toDto).orElse(null);
    }

    @Override
    public SeoTemplateDto saveTemplate(SeoTemplateDto dto) {
        Long templateId = parseLongSafe(dto.getId());
        SeoTemplate template = templateId != null ? templateRepository.findById(templateId).orElse(new SeoTemplate()) : new SeoTemplate();

        if (dto.getEntityType() != null) template.setEntityType(dto.getEntityType());
        if (dto.getName() != null) template.setName(dto.getName());
        if (dto.getTitleTemplate() != null) template.setTitleTemplate(dto.getTitleTemplate());
        if (dto.getDescriptionTemplate() != null) template.setDescriptionTemplate(dto.getDescriptionTemplate());
        if (dto.getCanonicalTemplate() != null) template.setCanonicalTemplate(dto.getCanonicalTemplate());
        if (dto.getOgTitleTemplate() != null) template.setOgTitleTemplate(dto.getOgTitleTemplate());
        if (dto.getOgDescriptionTemplate() != null) template.setOgDescriptionTemplate(dto.getOgDescriptionTemplate());
        if (dto.getDefaultOgImage() != null) template.setDefaultOgImage(dto.getDefaultOgImage());
        if (dto.getRobotsDirective() != null) template.setRobotsDirective(dto.getRobotsDirective());
        if (dto.getSchemaType() != null) template.setSchemaType(dto.getSchemaType());
        template.setEnabled(dto.isEnabled());
        if (dto.getPublicationStatus() != null) template.setPublicationStatus(dto.getPublicationStatus());
        if (dto.getSupportedPlaceholders() != null) {
            template.setSupportedPlaceholders(String.join(",", dto.getSupportedPlaceholders()));
        }
        if (dto.getSampleData() != null) {
            try {
                template.setSampleDataJson(objectMapper.writeValueAsString(dto.getSampleData()));
            } catch (Exception ignored) {}
        }
        template.setLastUpdated(LocalDateTime.now());

        SeoTemplate saved = templateRepository.save(template);
        recordHistory("DYNAMIC_TEMPLATE", String.valueOf(saved.getId()), saved.getName(), "UPDATE", "Saved dynamic metadata template for " + saved.getEntityType());
        return toDto(saved);
    }

    // ──────────────── Overrides ────────────────
    @Override
    public List<SeoEntityOverrideDto> getAllOverrides() {
        return overrideRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SeoEntityOverrideDto saveOverride(SeoEntityOverrideDto dto) {
        Long overrideId = parseLongSafe(dto.getId());
        SeoEntityOverride override = overrideId != null ? overrideRepository.findById(overrideId).orElse(new SeoEntityOverride()) : new SeoEntityOverride();

        if (dto.getEntityType() != null) override.setEntityType(dto.getEntityType());
        if (dto.getEntityId() != null) override.setEntityId(dto.getEntityId());
        if (dto.getEntityName() != null) override.setEntityName(dto.getEntityName());
        if (dto.getCustomTitle() != null) override.setCustomTitle(dto.getCustomTitle());
        if (dto.getCustomDescription() != null) override.setCustomDescription(dto.getCustomDescription());
        if (dto.getCustomCanonical() != null) override.setCustomCanonical(dto.getCustomCanonical());
        if (dto.getCustomOgImage() != null) override.setCustomOgImage(dto.getCustomOgImage());
        if (dto.getRobotsDirective() != null) override.setRobotsDirective(dto.getRobotsDirective());
        if (dto.getPublicationStatus() != null) override.setPublicationStatus(dto.getPublicationStatus());
        override.setUpdatedAt(LocalDateTime.now());
        if (dto.getUpdatedBy() != null) override.setUpdatedBy(dto.getUpdatedBy());

        SeoEntityOverride saved = overrideRepository.save(override);
        recordHistory("ENTITY_OVERRIDE", saved.getEntityId(), saved.getEntityName(), "UPDATE", "Saved custom override for " + saved.getEntityName());
        return toDto(saved);
    }

    @Override
    public void deleteOverride(String id) {
        Long overrideId = parseLongSafe(id);
        if (overrideId != null) {
            overrideRepository.deleteById(overrideId);
            recordHistory("ENTITY_OVERRIDE", id, "Override #" + id, "DELETE", "Deleted specific entity override");
        }
    }

    // ──────────────── Redirects ────────────────
    @Override
    public List<SeoRedirectDto> getAllRedirects() {
        return redirectRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<SeoRedirectDto> getActiveRedirects() {
        return redirectRepository.findByEnabledTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SeoRedirectDto saveRedirect(SeoRedirectDto dto) {
        Long redirectId = parseLongSafe(dto.getId());
        SeoRedirect redirect = redirectId != null ? redirectRepository.findById(redirectId).orElse(new SeoRedirect()) : new SeoRedirect();

        if (dto.getSourcePath() != null) redirect.setSourcePath(dto.getSourcePath().trim());
        if (dto.getDestinationUrl() != null) redirect.setDestinationUrl(dto.getDestinationUrl().trim());
        if (dto.getRedirectType() != null) redirect.setRedirectType(dto.getRedirectType());
        if (dto.getEnabled() != null) redirect.setEnabled(dto.getEnabled());
        if (dto.getHitCount() != null) redirect.setHitCount(dto.getHitCount());
        if (dto.getNotes() != null) redirect.setNotes(dto.getNotes());
        redirect.setUpdatedAt(LocalDateTime.now());

        SeoRedirect saved = redirectRepository.save(redirect);
        recordHistory("REDIRECT", String.valueOf(saved.getId()), saved.getSourcePath() + " -> " + saved.getDestinationUrl(), "UPDATE", "Configured redirect rule");
        return toDto(saved);
    }

    @Override
    public void deleteRedirect(String id) {
        Long redirectId = parseLongSafe(id);
        if (redirectId != null) {
            redirectRepository.deleteById(redirectId);
            recordHistory("REDIRECT", id, "Redirect #" + id, "DELETE", "Deleted redirect rule");
        }
    }

    @Override
    public void trackRedirectHit(String sourcePath) {
        redirectRepository.findBySourcePath(sourcePath).ifPresent(r -> {
            r.setHitCount(r.getHitCount() + 1);
            redirectRepository.save(r);
        });
    }

    // ──────────────── Sitemaps ────────────────
    @Override
    public List<SeoSitemapDto> getSitemaps() {
        String now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        return Arrays.asList(
                new SeoSitemapDto("Static Core Sitemap", "https://athlon.co.in/sitemap/static.xml", (int) pageRepository.count(), now, "HEALTHY", "Core public routes: home, hubs, policies."),
                new SeoSitemapDto("Tournaments Sitemap", "https://athlon.co.in/sitemap/tournaments.xml", 120, now, "HEALTHY", "Dynamic state, national, and open tournament fixtures."),
                new SeoSitemapDto("Venues & Academies", "https://athlon.co.in/sitemap/venues.xml", 85, now, "HEALTHY", "Bookable arenas, turf grounds, and sports academies."),
                new SeoSitemapDto("Legal & Policies", "https://athlon.co.in/sitemap/legal.xml", 2, now, "HEALTHY", "Privacy policy, platform terms, and refund guidelines.")
        );
    }

    // ──────────────── Audit Issues ────────────────
    @Override
    public List<SeoAuditIssueDto> getAuditIssues() {
        return auditIssueRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void updateAuditIssueStatus(String id, String status) {
        Long issueId = parseLongSafe(id);
        if (issueId != null) {
            auditIssueRepository.findById(issueId).ifPresent(issue -> {
                issue.setStatus(status);
                auditIssueRepository.save(issue);
            });
        }
    }

    // ──────────────── History & Rollback ────────────────
    @Override
    public List<SeoChangeHistoryDto> getHistory() {
        return historyRepository.findTop50ByOrderByChangedAtDesc().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public void recordHistory(String entityType, String entityId, String entityName, String action, String summary) {
        SeoChangeHistory entry = new SeoChangeHistory();
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setEntityName(entityName);
        entry.setAction(action);
        entry.setSummary(summary);
        entry.setChangedBy("Super Admin");
        entry.setChangedAt(LocalDateTime.now());
        historyRepository.save(entry);
    }

    // ──────────────── Dynamic Metadata Resolver ────────────────
    @Override
    public ResolvedMetadataResponse resolveEntityMetadata(String entityType, String entityId, Map<String, String> entityData) {
        ResolvedMetadataResponse resp = new ResolvedMetadataResponse();
        SeoGlobalSettingsDto global = getGlobalSettings();

        // 1. Check for specific override first
        Optional<SeoEntityOverride> overrideOpt = overrideRepository.findByEntityTypeAndEntityId(entityType, entityId);
        if (overrideOpt.isPresent()) {
            SeoEntityOverride ov = overrideOpt.get();
            resp.setTitle(ov.getCustomTitle());
            resp.setDescription(ov.getCustomDescription());
            resp.setCanonicalUrl(ov.getCustomCanonical());
            resp.setRobotsDirective(ov.getRobotsDirective());
            resp.setOgTitle(ov.getCustomTitle());
            resp.setOgDescription(ov.getCustomDescription());
            resp.setOgImageUrl(ov.getCustomOgImage() != null ? ov.getCustomOgImage() : global.getDefaultOgImage());
            resp.setTwitterCardType(global.getTwitterCardType());
            return resp;
        }

        // 2. Check for dynamic template
        Optional<SeoTemplate> tplOpt = templateRepository.findByEntityType(entityType);
        if (tplOpt.isPresent() && Boolean.TRUE.equals(tplOpt.get().getEnabled())) {
            SeoTemplate tpl = tplOpt.get();
            Map<String, String> data = entityData != null ? entityData : Collections.emptyMap();

            resp.setTitle(applyPlaceholders(tpl.getTitleTemplate(), data));
            resp.setDescription(applyPlaceholders(tpl.getDescriptionTemplate(), data));
            resp.setCanonicalUrl(applyPlaceholders(tpl.getCanonicalTemplate(), data));
            resp.setRobotsDirective(tpl.getRobotsDirective());
            resp.setOgTitle(tpl.getOgTitleTemplate() != null ? applyPlaceholders(tpl.getOgTitleTemplate(), data) : resp.getTitle());
            resp.setOgDescription(tpl.getOgDescriptionTemplate() != null ? applyPlaceholders(tpl.getOgDescriptionTemplate(), data) : resp.getDescription());
            resp.setOgImageUrl(tpl.getDefaultOgImage() != null ? tpl.getDefaultOgImage() : global.getDefaultOgImage());
            resp.setTwitterCardType(global.getTwitterCardType());
            return resp;
        }

        // 3. Fallback to global defaults
        resp.setTitle(global.getDefaultTitle());
        resp.setDescription(global.getDefaultDescription());
        resp.setCanonicalUrl(global.getCanonicalBaseUrl());
        resp.setRobotsDirective(global.getDefaultRobots());
        resp.setOgTitle(global.getDefaultOgTitle());
        resp.setOgDescription(global.getDefaultOgDescription());
        resp.setOgImageUrl(global.getDefaultOgImage());
        resp.setTwitterCardType(global.getTwitterCardType());
        return resp;
    }

    private String applyPlaceholders(String template, Map<String, String> data) {
        if (template == null) return "";
        String resolved = template;
        for (Map.Entry<String, String> entry : data.entrySet()) {
            resolved = resolved.replace("{" + entry.getKey() + "}", entry.getValue() != null ? entry.getValue() : "");
        }
        return resolved;
    }

    // ──────────────── DTO Mappers ────────────────
    private SeoGlobalSettingsDto toDto(SeoGlobalSettings e) {
        SeoGlobalSettingsDto dto = new SeoGlobalSettingsDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setSiteName(e.getSiteName());
        dto.setSiteUrl(e.getSiteUrl());
        dto.setCanonicalBaseUrl(e.getCanonicalBaseUrl());
        dto.setDefaultTitle(e.getDefaultTitle());
        dto.setDefaultDescription(e.getDefaultDescription());
        dto.setTitleSeparator(e.getTitleSeparator());
        dto.setDefaultOgTitle(e.getDefaultOgTitle());
        dto.setDefaultOgDescription(e.getDefaultOgDescription());
        dto.setDefaultOgImage(e.getDefaultOgImage());
        dto.setTwitterCardType(e.getTwitterCardType());
        dto.setOrganizationName(e.getOrganizationName());
        dto.setOrganizationLogo(e.getOrganizationLogo());
        dto.setDefaultLocale(e.getDefaultLocale());
        dto.setSupportedLocales(Arrays.asList("en_IN", "en_US"));
        dto.setDefaultRobots(e.getDefaultRobots());

        Map<String, String> social = new HashMap<>();
        social.put("facebook", e.getSocialFacebook());
        social.put("instagram", e.getSocialInstagram());
        social.put("twitter", e.getSocialTwitter());
        social.put("youtube", e.getSocialYoutube());
        social.put("linkedin", e.getSocialLinkedin());
        dto.setSocialProfiles(social);

        dto.setGoogleVerificationCode(e.getGoogleVerificationCode());
        dto.setBingVerificationCode(e.getBingVerificationCode());
        dto.setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        return dto;
    }

    private SeoPageDto toDto(SeoPage e) {
        SeoPageDto dto = new SeoPageDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setPageKey(e.getPageKey());
        dto.setPageName(e.getPageName());
        dto.setRoutePattern(e.getRoutePattern());
        dto.setPageType(e.getPageType());
        dto.setTitle(e.getTitle());
        dto.setDescription(e.getDescription());
        dto.setCanonicalUrl(e.getCanonicalUrl());
        dto.setRobotsDirective(e.getRobotsDirective());
        dto.setOgTitle(e.getOgTitle());
        dto.setOgDescription(e.getOgDescription());
        dto.setOgImageUrl(e.getOgImageUrl());
        dto.setPublicationStatus(e.getPublicationStatus());
        dto.setIndexability(e.getIndexability());
        dto.setStructuredDataType(e.getStructuredDataType());
        dto.setModule(e.getModule());
        dto.setLastUpdated(e.getLastUpdated() != null ? e.getLastUpdated().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        dto.setUpdatedBy(e.getUpdatedBy());
        return dto;
    }

    private SeoTemplateDto toDto(SeoTemplate e) {
        SeoTemplateDto dto = new SeoTemplateDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setEntityType(e.getEntityType());
        dto.setName(e.getName());
        dto.setTitleTemplate(e.getTitleTemplate());
        dto.setDescriptionTemplate(e.getDescriptionTemplate());
        dto.setCanonicalTemplate(e.getCanonicalTemplate());
        dto.setOgTitleTemplate(e.getOgTitleTemplate());
        dto.setOgDescriptionTemplate(e.getOgDescriptionTemplate());
        dto.setDefaultOgImage(e.getDefaultOgImage());
        dto.setRobotsDirective(e.getRobotsDirective());
        dto.setSchemaType(e.getSchemaType());
        dto.setEnabled(Boolean.TRUE.equals(e.getEnabled()));
        dto.setPublicationStatus(e.getPublicationStatus());

        if (e.getSupportedPlaceholders() != null) {
            dto.setSupportedPlaceholders(Arrays.asList(e.getSupportedPlaceholders().split(",")));
        } else {
            dto.setSupportedPlaceholders(Collections.emptyList());
        }

        if (e.getSampleDataJson() != null) {
            try {
                dto.setSampleData(objectMapper.readValue(e.getSampleDataJson(), new TypeReference<Map<String, String>>() {}));
            } catch (Exception ignored) {
                dto.setSampleData(Collections.emptyMap());
            }
        } else {
            dto.setSampleData(Collections.emptyMap());
        }

        dto.setLastUpdated(e.getLastUpdated() != null ? e.getLastUpdated().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        return dto;
    }

    private SeoEntityOverrideDto toDto(SeoEntityOverride e) {
        SeoEntityOverrideDto dto = new SeoEntityOverrideDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setEntityType(e.getEntityType());
        dto.setEntityId(e.getEntityId());
        dto.setEntityName(e.getEntityName());
        dto.setCustomTitle(e.getCustomTitle());
        dto.setCustomDescription(e.getCustomDescription());
        dto.setCustomCanonical(e.getCustomCanonical());
        dto.setCustomOgImage(e.getCustomOgImage());
        dto.setRobotsDirective(e.getRobotsDirective());
        dto.setPublicationStatus(e.getPublicationStatus());
        dto.setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        dto.setUpdatedBy(e.getUpdatedBy());
        return dto;
    }

    private SeoRedirectDto toDto(SeoRedirect e) {
        SeoRedirectDto dto = new SeoRedirectDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setSourcePath(e.getSourcePath());
        dto.setDestinationUrl(e.getDestinationUrl());
        dto.setRedirectType(e.getRedirectType());
        dto.setEnabled(e.getEnabled());
        dto.setHitCount(e.getHitCount());
        dto.setNotes(e.getNotes());
        dto.setCreatedAt(e.getCreatedAt() != null ? e.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        dto.setUpdatedAt(e.getUpdatedAt() != null ? e.getUpdatedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        return dto;
    }

    private SeoAuditIssueDto toDto(SeoAuditIssue e) {
        SeoAuditIssueDto dto = new SeoAuditIssueDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setPageRoute(e.getPageRoute());
        dto.setPageName(e.getPageName());
        dto.setIssueType(e.getIssueType());
        dto.setSeverity(e.getSeverity());
        dto.setExplanation(e.getExplanation());
        dto.setRecommendedFix(e.getRecommendedFix());
        dto.setStatus(e.getStatus());
        return dto;
    }

    private SeoChangeHistoryDto toDto(SeoChangeHistory e) {
        SeoChangeHistoryDto dto = new SeoChangeHistoryDto();
        dto.setId(String.valueOf(e.getId()));
        dto.setEntityType(e.getEntityType());
        dto.setEntityId(e.getEntityId());
        dto.setEntityName(e.getEntityName());
        dto.setAction(e.getAction());
        dto.setSummary(e.getSummary());
        dto.setChangedBy(e.getChangedBy());
        dto.setChangedAt(e.getChangedAt() != null ? e.getChangedAt().format(DateTimeFormatter.ISO_DATE_TIME) : null);
        return dto;
    }

    private Long parseLongSafe(String str) {
        if (str == null || str.trim().isEmpty()) return null;
        try {
            // Remove any prefix if needed (e.g. "page-")
            String clean = str.replaceAll("[^0-9]", "");
            return clean.isEmpty() ? null : Long.parseLong(clean);
        } catch (Exception e) {
            return null;
        }
    }
}
