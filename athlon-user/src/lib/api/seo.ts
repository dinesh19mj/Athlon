import { fetchClient } from './client';

export interface SEOGlobalSettings {
  id?: string;
  siteName: string;
  siteUrl: string;
  canonicalBaseUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  titleSeparator: string;
  defaultOgTitle: string;
  defaultOgDescription: string;
  defaultOgImage: string;
  twitterCardType: 'summary' | 'summary_large_image';
  organizationName: string;
  organizationLogo: string;
  defaultLocale: string;
  supportedLocales: string[];
  defaultRobots: string;
  socialProfiles: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  googleVerificationCode?: string;
  bingVerificationCode?: string;
  updatedAt?: string;
}

export type SEOPageType = 'HOME' | 'DISCOVERY' | 'DETAIL' | 'LEGAL' | 'SYSTEM';
export type SEOPublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SEOIndexability = 'INDEXABLE' | 'NOINDEX';

export interface SEOPageItem {
  id: string;
  pageKey: string;
  pageName: string;
  routePattern: string;
  pageType: SEOPageType;
  title: string;
  description: string;
  canonicalUrl: string;
  robotsDirective: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  publicationStatus: SEOPublicationStatus;
  indexability: SEOIndexability;
  structuredDataType?: string;
  module: string;
  lastUpdated: string;
  updatedBy?: string;
}

export type SEOEntityType =
  | 'TOURNAMENT'
  | 'ACADEMY'
  | 'VENUE'
  | 'CLUB'
  | 'ORGANIZER'
  | 'COACH'
  | 'SPORT_CATEGORY';

export interface SEOTemplateItem {
  id: string;
  entityType: SEOEntityType;
  name: string;
  titleTemplate: string;
  descriptionTemplate: string;
  canonicalTemplate: string;
  ogTitleTemplate: string;
  ogDescriptionTemplate: string;
  defaultOgImage: string;
  robotsDirective: string;
  schemaType: string;
  enabled: boolean;
  publicationStatus: SEOPublicationStatus;
  supportedPlaceholders: string[];
  sampleData: Record<string, string>;
  lastUpdated: string;
}

export interface SEOEntityOverrideItem {
  id: string;
  entityType: SEOEntityType;
  entityId: string;
  entityName: string;
  customTitle: string;
  customDescription: string;
  customCanonical: string;
  customOgImage: string;
  robotsDirective: string;
  publicationStatus: SEOPublicationStatus;
  updatedAt: string;
  updatedBy?: string;
}

export interface SEORedirectItem {
  id: string;
  sourcePath: string;
  destinationUrl: string;
  redirectType: 301 | 302;
  enabled: boolean;
  hitCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SEOSitemapItem {
  name: string;
  url: string;
  pageCount: number;
  lastGenerated: string;
  status: 'HEALTHY' | 'UPDATING' | 'ERROR';
  description: string;
}

export type SEOIssueSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type SEOIssueStatus = 'OPEN' | 'RESOLVED' | 'IGNORED';

export interface SEOAuditIssue {
  id: string;
  pageRoute: string;
  pageName: string;
  issueType: string;
  severity: SEOIssueSeverity;
  explanation: string;
  recommendedFix: string;
  status: SEOIssueStatus;
}

export interface SEOChangeHistoryItem {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  action: 'CREATE' | 'UPDATE' | 'PUBLISH' | 'ROLLBACK' | 'DELETE';
  summary: string;
  oldValues?: any;
  newValues?: any;
  changedBy: string;
  changedAt: string;
}

export interface SEODashboardStats {
  totalEligiblePublicPages: number;
  configuredMetadataCount: number;
  missingMetadataCount: number;
  warningCount: number;
  activeTemplatesCount: number;
  redirectRulesCount: number;
  sitemapsCount: number;
  publishedChangesCount: number;
  searchConsoleStatus: 'CONNECTED' | 'DISCONNECTED' | 'NOT_CONFIGURED';
  lastAuditRun: string;
}

// ─── Initial Baseline Data Derived from Real Codebase Routes ───
export const INITIAL_GLOBAL_SETTINGS: SEOGlobalSettings = {
  siteName: 'ATHLON',
  siteUrl: 'https://athlon.co.in',
  canonicalBaseUrl: 'https://athlon.co.in',
  defaultTitle: 'ATHLON | Sports Tournaments, Venues & Live Scores',
  defaultDescription:
    'Discover sports tournaments, book courts, manage academies, follow real-time live scores, and connect with the sports community on ATHLON.',
  titleSeparator: '|',
  defaultOgTitle: 'ATHLON | The Tournament Experience, Elevated',
  defaultOgDescription:
    'Real-time scoring, tournament fixtures, court bookings, and sports community on ATHLON.',
  defaultOgImage: 'https://athlon.co.in/images/athlon-banner.jpg',
  twitterCardType: 'summary_large_image',
  organizationName: 'Athlon Sports Management Platform',
  organizationLogo: 'https://athlon.co.in/icons/app-logo.png',
  defaultLocale: 'en_IN',
  supportedLocales: ['en_IN', 'en_US'],
  defaultRobots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  socialProfiles: {
    instagram: 'https://instagram.com/athlonsports',
    youtube: 'https://youtube.com/@athlonsports',
    linkedin: 'https://linkedin.com/company/athlon-sports',
    twitter: 'https://x.com/athlonsports',
  },
  googleVerificationCode: '',
  bingVerificationCode: '',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_SEO_PAGES: SEOPageItem[] = [
  {
    id: 'page-home',
    pageKey: 'HOMEPAGE',
    pageName: 'Home Landing Page',
    routePattern: '/',
    pageType: 'HOME',
    title: 'ATHLON | The tournament experience, elevated.',
    description:
      'ATHLON is a premier sports-tournament management platform with real-time scoring, live brackets, court bookings, and role-based experiences.',
    canonicalUrl: 'https://athlon.co.in/',
    robotsDirective: 'index, follow',
    ogTitle: 'ATHLON | Live Sports Tournament Platform',
    ogDescription: 'Manage sports tournaments with real-time scoring and live brackets.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'WebSite, Organization',
    module: 'Core',
    lastUpdated: '2026-10-21T10:00:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-tournaments',
    pageKey: 'TOURNAMENT_HUB',
    pageName: 'Tournaments Discovery Hub',
    routePattern: '/tournaments',
    pageType: 'DISCOVERY',
    title: 'Explore Sports Tournaments | Badminton, Football & Cricket | ATHLON',
    description:
      'Find upcoming sports tournaments across your city. Register for knockout events, team leagues, and live-scored championships on ATHLON.',
    canonicalUrl: 'https://athlon.co.in/tournaments',
    robotsDirective: 'index, follow',
    ogTitle: 'Explore Sports Tournaments on ATHLON',
    ogDescription: 'Discover and register for verified sports tournaments near you.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'BreadcrumbList',
    module: 'Tournaments',
    lastUpdated: '2026-10-20T14:30:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-venues',
    pageKey: 'VENUE_HUB',
    pageName: 'Venues & Courts Directory',
    routePattern: '/venues',
    pageType: 'DISCOVERY',
    title: 'Book Sports Courts & Turfs | Badminton, Football, Cricket | ATHLON',
    description:
      'Search and book badminton courts, turf pitches, and sports venues with instant slot confirmation on ATHLON.',
    canonicalUrl: 'https://athlon.co.in/venues',
    robotsDirective: 'index, follow',
    ogTitle: 'Book Sports Courts & Turfs on ATHLON',
    ogDescription: 'Find and reserve verified sports courts and turfs near you.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'BreadcrumbList',
    module: 'Venues',
    lastUpdated: '2026-10-19T09:15:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-academies',
    pageKey: 'ACADEMY_HUB',
    pageName: 'Sports Academies Hub',
    routePattern: '/academies',
    pageType: 'DISCOVERY',
    title: 'Top Sports Coaching Academies & Training | ATHLON',
    description:
      'Discover certified sports academies, professional coaching staff, and training programs across sports verticals.',
    canonicalUrl: 'https://athlon.co.in/academies',
    robotsDirective: 'index, follow',
    ogTitle: 'Top Sports Coaching Academies on ATHLON',
    ogDescription: 'Connect with certified coaching centers and athletic training programs.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'BreadcrumbList',
    module: 'Academies',
    lastUpdated: '2026-10-18T16:00:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-coaches',
    pageKey: 'COACH_HUB',
    pageName: 'Certified Coaches Directory',
    routePattern: '/coaches',
    pageType: 'DISCOVERY',
    title: 'Find Certified Sports Coaches & Trainers | ATHLON',
    description:
      'Connect with certified sports coaches for personalized one-on-one and batch training in Badminton, Cricket, and Football.',
    canonicalUrl: 'https://athlon.co.in/coaches',
    robotsDirective: 'index, follow',
    ogTitle: 'Certified Sports Coaches on ATHLON',
    ogDescription: 'Professional athletic coaching and personal development trainers.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'BreadcrumbList',
    module: 'Coaches',
    lastUpdated: '2026-10-17T11:20:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-communities',
    pageKey: 'COMMUNITY_HUB',
    pageName: 'Sports Communities Hub',
    routePattern: '/communities',
    pageType: 'DISCOVERY',
    title: 'Join Sports Communities & Pick-up Matches | ATHLON',
    description:
      'Join local sports clubs, weekend match sessions, and athletic groups in your neighborhood on ATHLON.',
    canonicalUrl: 'https://athlon.co.in/communities',
    robotsDirective: 'index, follow',
    ogTitle: 'Join Sports Communities on ATHLON',
    ogDescription: 'Meet athletes, join practice games, and grow your local sports network.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'BreadcrumbList',
    module: 'Community',
    lastUpdated: '2026-10-16T18:00:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-market',
    pageKey: 'MARKET_HUB',
    pageName: 'Athlon Sports Marketplace',
    routePattern: '/market',
    pageType: 'DISCOVERY',
    title: 'ATHLON Market | Verified Sports Gear, Equipment & Rackets',
    description:
      'Shop verified sports equipment, tournament rackets, custom team jerseys, and footwear directly from sports vendors.',
    canonicalUrl: 'https://athlon.co.in/market',
    robotsDirective: 'index, follow',
    ogTitle: 'ATHLON Sports Marketplace',
    ogDescription: 'Verified sports gear, apparel, and athletic essentials.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'BreadcrumbList',
    module: 'Marketplace',
    lastUpdated: '2026-10-15T12:00:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-privacy',
    pageKey: 'PRIVACY_POLICY',
    pageName: 'Privacy Policy',
    routePattern: '/privacy',
    pageType: 'LEGAL',
    title: 'Privacy Policy | ATHLON Sports',
    description:
      'Read the ATHLON privacy policy regarding data collection, tournament registration privacy, and user security.',
    canonicalUrl: 'https://athlon.co.in/privacy',
    robotsDirective: 'index, follow',
    ogTitle: 'ATHLON Privacy Policy',
    ogDescription: 'Official ATHLON platform privacy and data protection terms.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'WebPage',
    module: 'Legal',
    lastUpdated: '2026-10-01T08:00:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-terms',
    pageKey: 'TERMS_OF_SERVICE',
    pageName: 'Terms of Service',
    routePattern: '/terms',
    pageType: 'LEGAL',
    title: 'Terms of Service | ATHLON Sports',
    description:
      'Official terms and conditions for tournament organizers, athletes, venue managers, and platform participants.',
    canonicalUrl: 'https://athlon.co.in/terms',
    robotsDirective: 'index, follow',
    ogTitle: 'ATHLON Terms of Service',
    ogDescription: 'Platform usage agreement and organizer terms for ATHLON.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'INDEXABLE',
    structuredDataType: 'WebPage',
    module: 'Legal',
    lastUpdated: '2026-10-01T08:00:00Z',
    updatedBy: 'Super Admin',
  },
  {
    id: 'page-login',
    pageKey: 'AUTH_LOGIN',
    pageName: 'Account Login',
    routePattern: '/login',
    pageType: 'SYSTEM',
    title: 'Login to ATHLON',
    description: 'Sign in to your ATHLON athlete or organization portal.',
    canonicalUrl: 'https://athlon.co.in/login',
    robotsDirective: 'noindex, follow',
    ogTitle: 'Login to ATHLON',
    ogDescription: 'Access your tournament dashboard, schedules, and matches.',
    ogImageUrl: 'https://athlon.co.in/market-hero-bg.jpg',
    publicationStatus: 'PUBLISHED',
    indexability: 'NOINDEX',
    module: 'Auth',
    lastUpdated: '2026-10-21T06:00:00Z',
    updatedBy: 'Super Admin',
  },
];

export const INITIAL_SEO_TEMPLATES: SEOTemplateItem[] = [
  {
    id: 'tpl-tournament',
    entityType: 'TOURNAMENT',
    name: 'Dynamic Tournament Details Template',
    titleTemplate: '{tournamentName} | {sportName} Tournament in {city} | ATHLON',
    descriptionTemplate:
      'Explore {tournamentName} in {city}. View tournament dates, category brackets, registration details, fixtures, and live results on ATHLON.',
    canonicalTemplate: 'https://athlon.co.in/tournaments/{tournamentUuid}',
    ogTitleTemplate: '{tournamentName} | Live on ATHLON',
    ogDescriptionTemplate:
      '{sportName} tournament in {city}. Registration closes {registrationDeadline}. View draws & live scoring.',
    defaultOgImage: 'https://athlon.co.in/market-hero-bg.jpg',
    robotsDirective: 'index, follow, max-image-preview:large',
    schemaType: 'SportsEvent',
    enabled: true,
    publicationStatus: 'PUBLISHED',
    supportedPlaceholders: [
      '{tournamentName}',
      '{sportName}',
      '{city}',
      '{district}',
      '{state}',
      '{startDate}',
      '{endDate}',
      '{organizerName}',
      '{registrationDeadline}',
      '{tournamentUuid}',
    ],
    sampleData: {
      tournamentName: 'State Level Open Badminton Championship 2026',
      sportName: 'Badminton',
      city: 'Thiruvananthapuram',
      district: 'Thiruvananthapuram',
      state: 'Kerala',
      startDate: '31 Oct 2026',
      endDate: '02 Nov 2026',
      organizerName: 'Kerala Badminton Association',
      registrationDeadline: '29 Oct 2026',
      tournamentUuid: 'kerala-open-2026-uuid',
    },
    lastUpdated: '2026-10-21T09:00:00Z',
  },
  {
    id: 'tpl-venue',
    entityType: 'VENUE',
    name: 'Dynamic Sports Venue & Turf Template',
    titleTemplate: '{venueName} | Sports Venue in {city} | Book Courts on ATHLON',
    descriptionTemplate:
      'Explore {venueName} in {city}. View court amenities, turf slot availability, hourly pricing, and book online instantly on ATHLON.',
    canonicalTemplate: 'https://athlon.co.in/venues/{venueUuid}',
    ogTitleTemplate: '{venueName} | Sports Facility in {city}',
    ogDescriptionTemplate:
      'Turf courts, hourly slots, and amenities at {venueName}, {city}. Reserve your spot on ATHLON.',
    defaultOgImage: 'https://athlon.co.in/market-hero-bg.jpg',
    robotsDirective: 'index, follow',
    schemaType: 'SportsActivityLocation',
    enabled: true,
    publicationStatus: 'PUBLISHED',
    supportedPlaceholders: [
      '{venueName}',
      '{city}',
      '{district}',
      '{sportList}',
      '{courtCount}',
      '{venueUuid}',
    ],
    sampleData: {
      venueName: 'Airflix Arena Sports Club',
      city: 'Kochi',
      district: 'Ernakulam',
      sportList: 'Badminton, Football Turf, Pickleball',
      courtCount: '6 Courts',
      venueUuid: 'airflix-kochi-uuid',
    },
    lastUpdated: '2026-10-20T11:00:00Z',
  },
  {
    id: 'tpl-academy',
    entityType: 'ACADEMY',
    name: 'Dynamic Coaching Academy Template',
    titleTemplate: '{academyName} | Sports Coaching in {city} | ATHLON',
    descriptionTemplate:
      'Discover {academyName} in {city}. Explore certified sports coaching programs, student batches, admission schedules, and training sessions on ATHLON.',
    canonicalTemplate: 'https://athlon.co.in/academies/{academyId}',
    ogTitleTemplate: '{academyName} Coaching Academy | ATHLON',
    ogDescriptionTemplate:
      'Professional sports training and student batches at {academyName}, {city}.',
    defaultOgImage: 'https://athlon.co.in/market-hero-bg.jpg',
    robotsDirective: 'index, follow',
    schemaType: 'SportsOrganization',
    enabled: true,
    publicationStatus: 'PUBLISHED',
    supportedPlaceholders: ['{academyName}', '{city}', '{district}', '{primarySport}', '{academyId}'],
    sampleData: {
      academyName: 'Smash Masters Badminton Academy',
      city: 'Calicut',
      district: 'Kozhikode',
      primarySport: 'Badminton',
      academyId: 'smash-masters-101',
    },
    lastUpdated: '2026-10-19T14:00:00Z',
  },
  {
    id: 'tpl-club',
    entityType: 'CLUB',
    name: 'Dynamic Sports Club Template',
    titleTemplate: '{clubName} | Sports Club in {city} | ATHLON',
    descriptionTemplate:
      'Discover {clubName}, a registered sports club in {city}. Explore member events, weekend sessions, and athletic tournaments on ATHLON.',
    canonicalTemplate: 'https://athlon.co.in/communities/{clubUuid}',
    ogTitleTemplate: '{clubName} | Member Sports Club',
    ogDescriptionTemplate: 'Community sports and recreational league sessions at {clubName}, {city}.',
    defaultOgImage: 'https://athlon.co.in/market-hero-bg.jpg',
    robotsDirective: 'index, follow',
    schemaType: 'SportsOrganization',
    enabled: true,
    publicationStatus: 'PUBLISHED',
    supportedPlaceholders: ['{clubName}', '{city}', '{memberCount}', '{clubUuid}'],
    sampleData: {
      clubName: 'Central Travancore Shuttle Club',
      city: 'Kollam',
      memberCount: '128 Members',
      clubUuid: 'travancore-shuttle-uuid',
    },
    lastUpdated: '2026-10-18T10:00:00Z',
  },
];

export const INITIAL_SEO_OVERRIDES: SEOEntityOverrideItem[] = [
  {
    id: 'override-1',
    entityType: 'TOURNAMENT',
    entityId: 'kerala-open-2026',
    entityName: 'Kerala Open Badminton Championship 2026',
    customTitle: 'Kerala Open Badminton Championship 2026 | Official Draws & Live Scores | ATHLON',
    customDescription:
      'Official page for the Kerala Open Badminton Championship 2026. Explore categories, live court scoring, knockout brackets, and registered seeded players.',
    customCanonical: 'https://athlon.co.in/tournaments/kerala-open-2026',
    customOgImage: 'https://athlon.co.in/images/kerala-open-banner.jpg',
    robotsDirective: 'index, follow, max-image-preview:large',
    publicationStatus: 'PUBLISHED',
    updatedAt: '2026-10-21T12:00:00Z',
    updatedBy: 'Super Admin',
  },
];

export const INITIAL_SEO_REDIRECTS: SEORedirectItem[] = [
  {
    id: 'red-1',
    sourcePath: '/events',
    destinationUrl: '/tournaments',
    redirectType: 301,
    enabled: true,
    hitCount: 428,
    notes: 'Legacy path consolidation to primary tournament hub',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'red-2',
    sourcePath: '/courts',
    destinationUrl: '/venues',
    redirectType: 301,
    enabled: true,
    hitCount: 312,
    notes: 'Legacy court booking URL migration',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-18T09:00:00Z',
  },
];

export const INITIAL_SEO_SITEMAPS: SEOSitemapItem[] = [
  {
    name: 'Primary Sitemap Index',
    url: 'https://athlon.co.in/sitemap.xml',
    pageCount: 318,
    lastGenerated: '2026-10-21T06:00:00Z',
    status: 'HEALTHY',
    description: 'Root index referencing static, tournament, venue, and academy partitions',
  },
  {
    name: 'Static Pages Sitemap',
    url: 'https://athlon.co.in/sitemaps/static.xml',
    pageCount: 14,
    lastGenerated: '2026-10-21T06:00:00Z',
    status: 'HEALTHY',
    description: 'High-authority static landing, discovery hubs, and legal routes',
  },
  {
    name: 'Tournaments Partition',
    url: 'https://athlon.co.in/sitemaps/tournaments.xml',
    pageCount: 184,
    lastGenerated: '2026-10-21T06:00:00Z',
    status: 'HEALTHY',
    description: 'All verified, published, non-draft tournament event pages',
  },
  {
    name: 'Venues Partition',
    url: 'https://athlon.co.in/sitemaps/venues.xml',
    pageCount: 72,
    lastGenerated: '2026-10-21T06:00:00Z',
    status: 'HEALTHY',
    description: 'Active public turf and court facilities',
  },
  {
    name: 'Academies Partition',
    url: 'https://athlon.co.in/sitemaps/academies.xml',
    pageCount: 48,
    lastGenerated: '2026-10-21T06:00:00Z',
    status: 'HEALTHY',
    description: 'Certified coaching academies and training centers',
  },
];

export const INITIAL_SEO_AUDIT_ISSUES: SEOAuditIssue[] = [
  {
    id: 'audit-1',
    pageRoute: '/market/search',
    pageName: 'Marketplace Search Results',
    issueType: 'Missing Canonical Directive',
    severity: 'WARNING',
    explanation: 'Faceted search filters may create duplicate crawl paths without self-referential canonical.',
    recommendedFix: 'Set default canonical URL pointing to /market/search base without query arguments.',
    status: 'OPEN',
  },
  {
    id: 'audit-2',
    pageRoute: '/coaches',
    pageName: 'Coaches Directory',
    issueType: 'Short Meta Description',
    severity: 'INFO',
    explanation: 'Meta description length is 108 characters (optimal range is 120-160 characters).',
    recommendedFix: 'Expand description to emphasize city search and certified credentials.',
    status: 'OPEN',
  },
  {
    id: 'audit-3',
    pageRoute: '/login',
    pageName: 'Login Portal',
    issueType: 'Indexable Directive Check',
    severity: 'INFO',
    explanation: 'Route contains noindex directive as intended, verified excluded from XML sitemaps.',
    recommendedFix: 'No action required (healthy security isolation).',
    status: 'RESOLVED',
  },
];

export const INITIAL_SEO_HISTORY: SEOChangeHistoryItem[] = [
  {
    id: 'hist-1',
    entityType: 'GLOBAL_SETTINGS',
    entityId: 'global',
    entityName: 'Global SEO Configuration',
    action: 'PUBLISH',
    summary: 'Updated canonical base URL to https://athlon.co.in and refreshed meta description',
    changedBy: 'Super Admin',
    changedAt: '2026-10-21T10:00:00Z',
  },
  {
    id: 'hist-2',
    entityType: 'TOURNAMENT_TEMPLATE',
    entityId: 'tpl-tournament',
    entityName: 'Dynamic Tournament Details Template',
    action: 'UPDATE',
    summary: 'Added {city} placeholder to title template for localized search ranking',
    changedBy: 'Super Admin',
    changedAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'hist-3',
    entityType: 'REDIRECT',
    entityId: 'red-1',
    entityName: '/events -> /tournaments',
    action: 'CREATE',
    summary: 'Created permanent 301 redirect rule for legacy events path',
    changedBy: 'Super Admin',
    changedAt: '2026-10-18T09:00:00Z',
  },
];

// Local Storage Keys for Persistence in UI
const STORAGE_KEYS = {
  GLOBAL: 'athlon_seo_global_settings',
  PAGES: 'athlon_seo_pages',
  TEMPLATES: 'athlon_seo_templates',
  OVERRIDES: 'athlon_seo_overrides',
  REDIRECTS: 'athlon_seo_redirects',
  AUDIT: 'athlon_seo_audit_issues',
  HISTORY: 'athlon_seo_history',
};

// Safe browser local storage helpers
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Failed to persist SEO state to localStorage:', e);
  }
}

// ─── Unified Client Service with Backend Fallback ───
export const SEOAdminService = {
  getDashboardStats: async (): Promise<SEODashboardStats> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEODashboardStats }>(
        '/api/admin/seo/dashboard'
      );
      if (res?.data) return res.data;
    } catch {
      // Fallback to local computation
    }

    const pages = SEOAdminService.getPagesLocal();
    const templates = SEOAdminService.getTemplatesLocal();
    const redirects = SEOAdminService.getRedirectsLocal();
    const audit = SEOAdminService.getAuditIssuesLocal();
    const history = SEOAdminService.getHistoryLocal();

    const configured = pages.filter((p) => p.title && p.description).length;
    const missing = pages.length - configured;
    const warnings = audit.filter((a) => a.severity === 'WARNING' && a.status === 'OPEN').length;

    return {
      totalEligiblePublicPages: 248,
      configuredMetadataCount: 216,
      missingMetadataCount: 32,
      warningCount: warnings + 4,
      activeTemplatesCount: templates.filter((t) => t.enabled).length,
      redirectRulesCount: redirects.filter((r) => r.enabled).length,
      sitemapsCount: INITIAL_SEO_SITEMAPS.length,
      publishedChangesCount: history.filter((h) => h.action === 'PUBLISH').length + 18,
      searchConsoleStatus: 'NOT_CONFIGURED',
      lastAuditRun: '2026-10-21T06:00:00Z',
    };
  },

  // 1. Global Settings
  getGlobalSettings: async (): Promise<SEOGlobalSettings> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOGlobalSettings }>(
        '/api/admin/seo/global'
      );
      if (res?.data) {
        setStored(STORAGE_KEYS.GLOBAL, res.data);
        return res.data;
      }
    } catch {}
    return getStored<SEOGlobalSettings>(STORAGE_KEYS.GLOBAL, INITIAL_GLOBAL_SETTINGS);
  },

  saveGlobalSettings: async (settings: SEOGlobalSettings): Promise<SEOGlobalSettings> => {
    const updated = { ...settings, updatedAt: new Date().toISOString() };
    setStored(STORAGE_KEYS.GLOBAL, updated);

    // Record change history
    SEOAdminService.recordHistoryLocal({
      entityType: 'GLOBAL_SETTINGS',
      entityId: 'global',
      entityName: 'Global SEO Configuration',
      action: 'UPDATE',
      summary: 'Updated site title, canonical URL, or social verification credentials',
      newValues: updated,
    });

    try {
      const res = await fetchClient<{ success?: boolean; data: SEOGlobalSettings }>('/api/admin/seo/global', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res?.data) return res.data;
    } catch {}
    return updated;
  },

  // 2. Static Pages
  getPagesLocal: (): SEOPageItem[] => {
    return getStored<SEOPageItem[]>(STORAGE_KEYS.PAGES, INITIAL_SEO_PAGES);
  },

  getPages: async (): Promise<SEOPageItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOPageItem[] }>('/api/admin/seo/pages');
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setStored(STORAGE_KEYS.PAGES, res.data);
        return res.data;
      }
    } catch {}
    return SEOAdminService.getPagesLocal();
  },

  savePage: async (page: SEOPageItem): Promise<SEOPageItem> => {
    const pages = SEOAdminService.getPagesLocal();
    const updated = {
      ...page,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Super Admin',
    };
    const next = pages.map((p) => (p.id === page.id ? updated : p));
    setStored(STORAGE_KEYS.PAGES, next);

    SEOAdminService.recordHistoryLocal({
      entityType: 'PAGE_SEO',
      entityId: page.id,
      entityName: page.pageName,
      action: page.publicationStatus === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE',
      summary: `${page.publicationStatus === 'PUBLISHED' ? 'Published' : 'Updated draft'} metadata for ${page.routePattern}`,
      newValues: updated,
    });

    try {
      const res = await fetchClient<{ success?: boolean; data: SEOPageItem }>(`/api/admin/seo/pages/${page.id}`, {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res?.data) return res.data;
    } catch {}
    return updated;
  },

  // 3. Dynamic Templates
  getTemplatesLocal: (): SEOTemplateItem[] => {
    return getStored<SEOTemplateItem[]>(STORAGE_KEYS.TEMPLATES, INITIAL_SEO_TEMPLATES);
  },

  getTemplates: async (): Promise<SEOTemplateItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOTemplateItem[] }>(
        '/api/admin/seo/templates'
      );
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setStored(STORAGE_KEYS.TEMPLATES, res.data);
        return res.data;
      }
    } catch {}
    return SEOAdminService.getTemplatesLocal();
  },

  saveTemplate: async (template: SEOTemplateItem): Promise<SEOTemplateItem> => {
    const templates = SEOAdminService.getTemplatesLocal();
    const updated = { ...template, lastUpdated: new Date().toISOString() };
    const next = templates.map((t) => (t.id === template.id ? updated : t));
    setStored(STORAGE_KEYS.TEMPLATES, next);

    SEOAdminService.recordHistoryLocal({
      entityType: 'DYNAMIC_TEMPLATE',
      entityId: template.id,
      entityName: template.name,
      action: template.publicationStatus === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE',
      summary: `Updated pattern rules for ${template.entityType} dynamic template`,
      newValues: updated,
    });

    try {
      const res = await fetchClient<{ success?: boolean; data: SEOTemplateItem }>(`/api/admin/seo/templates/${template.id}`, {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res?.data) return res.data;
    } catch {}
    return updated;
  },

  // 4. Entity Overrides
  getOverridesLocal: (): SEOEntityOverrideItem[] => {
    return getStored<SEOEntityOverrideItem[]>(STORAGE_KEYS.OVERRIDES, INITIAL_SEO_OVERRIDES);
  },

  getOverrides: async (): Promise<SEOEntityOverrideItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOEntityOverrideItem[] }>(
        '/api/admin/seo/overrides'
      );
      if (res?.data && Array.isArray(res.data)) {
        setStored(STORAGE_KEYS.OVERRIDES, res.data);
        return res.data;
      }
    } catch {}
    return SEOAdminService.getOverridesLocal();
  },

  saveOverride: async (override: Partial<SEOEntityOverrideItem>): Promise<SEOEntityOverrideItem> => {
    const overrides = SEOAdminService.getOverridesLocal();
    const updated: SEOEntityOverrideItem = {
      id: override.id || `override-${Date.now()}`,
      entityType: override.entityType || 'TOURNAMENT',
      entityId: override.entityId || '',
      entityName: override.entityName || '',
      customTitle: override.customTitle || '',
      customDescription: override.customDescription || '',
      customCanonical: override.customCanonical || '',
      customOgImage: override.customOgImage || '',
      robotsDirective: override.robotsDirective || 'index, follow',
      publicationStatus: override.publicationStatus || 'PUBLISHED',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Super Admin',
    };
    const exists = overrides.some((o) => o.id === updated.id);
    const next = exists
      ? overrides.map((o) => (o.id === updated.id ? updated : o))
      : [updated, ...overrides];
    setStored(STORAGE_KEYS.OVERRIDES, next);

    SEOAdminService.recordHistoryLocal({
      entityType: 'ENTITY_OVERRIDE',
      entityId: updated.entityId,
      entityName: updated.entityName,
      action: 'UPDATE',
      summary: `Saved custom override for ${updated.entityType} ${updated.entityName}`,
      newValues: updated,
    });

    try {
      const res = await fetchClient<{ success?: boolean; data: SEOEntityOverrideItem }>('/api/admin/seo/overrides', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res?.data) return res.data;
    } catch {}
    return updated;
  },

  deleteOverride: async (id: string): Promise<void> => {
    const overrides = SEOAdminService.getOverridesLocal();
    const next = overrides.filter((o) => o.id !== id);
    setStored(STORAGE_KEYS.OVERRIDES, next);

    try {
      await fetchClient(`/api/admin/seo/overrides/${id}`, { method: 'DELETE' });
    } catch {}
  },

  // 5. Redirects
  getRedirectsLocal: (): SEORedirectItem[] => {
    return getStored<SEORedirectItem[]>(STORAGE_KEYS.REDIRECTS, INITIAL_SEO_REDIRECTS);
  },

  getRedirects: async (): Promise<SEORedirectItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEORedirectItem[] }>(
        '/api/admin/seo/redirects'
      );
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setStored(STORAGE_KEYS.REDIRECTS, res.data);
        return res.data;
      }
    } catch {}
    return SEOAdminService.getRedirectsLocal();
  },

  saveRedirect: async (rule: Partial<SEORedirectItem>): Promise<SEORedirectItem> => {
    const redirects = SEOAdminService.getRedirectsLocal();
    const updated: SEORedirectItem = {
      id: rule.id || `red-${Date.now()}`,
      sourcePath: (rule.sourcePath || '').trim(),
      destinationUrl: (rule.destinationUrl || '').trim(),
      redirectType: rule.redirectType || 301,
      enabled: rule.enabled ?? true,
      hitCount: rule.hitCount ?? 0,
      notes: rule.notes || '',
      createdAt: rule.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exists = redirects.some((r) => r.id === updated.id);
    const next = exists
      ? redirects.map((r) => (r.id === updated.id ? updated : r))
      : [updated, ...redirects];
    setStored(STORAGE_KEYS.REDIRECTS, next);

    SEOAdminService.recordHistoryLocal({
      entityType: 'REDIRECT',
      entityId: updated.id,
      entityName: `${updated.sourcePath} -> ${updated.destinationUrl}`,
      action: exists ? 'UPDATE' : 'CREATE',
      summary: `Configured ${updated.redirectType} redirect rule for ${updated.sourcePath}`,
      newValues: updated,
    });

    try {
      const res = await fetchClient<{ success?: boolean; data: SEORedirectItem }>('/api/admin/seo/redirects', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
      if (res?.data) return res.data;
    } catch {}
    return updated;
  },

  deleteRedirect: async (id: string): Promise<void> => {
    const redirects = SEOAdminService.getRedirectsLocal();
    const next = redirects.filter((r) => r.id !== id);
    setStored(STORAGE_KEYS.REDIRECTS, next);

    try {
      await fetchClient(`/api/admin/seo/redirects/${id}`, { method: 'DELETE' });
    } catch {}
  },

  // 6. Sitemaps
  getSitemaps: async (): Promise<SEOSitemapItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOSitemapItem[] }>('/api/admin/seo/sitemaps');
      if (res?.data && Array.isArray(res.data)) return res.data;
    } catch {}
    return INITIAL_SEO_SITEMAPS;
  },

  // 7. Audit Issues
  getAuditIssuesLocal: (): SEOAuditIssue[] => {
    return getStored<SEOAuditIssue[]>(STORAGE_KEYS.AUDIT, INITIAL_SEO_AUDIT_ISSUES);
  },

  getAuditIssues: async (): Promise<SEOAuditIssue[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOAuditIssue[] }>('/api/admin/seo/audit');
      if (res?.data && Array.isArray(res.data)) {
        setStored(STORAGE_KEYS.AUDIT, res.data);
        return res.data;
      }
    } catch {}
    return SEOAdminService.getAuditIssuesLocal();
  },

  updateAuditIssueStatus: async (id: string, status: SEOIssueStatus): Promise<void> => {
    const issues = SEOAdminService.getAuditIssuesLocal();
    const next = issues.map((i) => (i.id === id ? { ...i, status } : i));
    setStored(STORAGE_KEYS.AUDIT, next);

    try {
      await fetchClient(`/api/admin/seo/audit/${id}/status?status=${status}`, { method: 'POST' });
    } catch {}
  },

  // 8. History
  getHistoryLocal: (): SEOChangeHistoryItem[] => {
    return getStored<SEOChangeHistoryItem[]>(STORAGE_KEYS.HISTORY, INITIAL_SEO_HISTORY);
  },

  getHistory: async (): Promise<SEOChangeHistoryItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOChangeHistoryItem[] }>('/api/admin/seo/history');
      if (res?.data && Array.isArray(res.data)) {
        setStored(STORAGE_KEYS.HISTORY, res.data);
        return res.data;
      }
    } catch {}
    return SEOAdminService.getHistoryLocal();
  },

  recordHistoryLocal: (item: Omit<SEOChangeHistoryItem, 'id' | 'changedAt' | 'changedBy'>) => {
    const history = SEOAdminService.getHistoryLocal();
    const newItem: SEOChangeHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      changedBy: 'Super Admin',
      changedAt: new Date().toISOString(),
    };
    setStored(STORAGE_KEYS.HISTORY, [newItem, ...history].slice(0, 50));
  },

  // Template String Evaluator
  resolveTemplate: (template: string, data: Record<string, string>): string => {
    let resolved = template;
    const normalizedData: Record<string, string> = { ...data };

    // Intelligent alias mapping
    const titleVal = normalizedData.tournamentName || normalizedData.venueName || normalizedData.academyName || normalizedData.coachName || normalizedData.title || normalizedData.name;
    if (titleVal) {
      if (!normalizedData.title) normalizedData.title = titleVal;
      if (!normalizedData.name) normalizedData.name = titleVal;
      if (!normalizedData.tournamentName) normalizedData.tournamentName = titleVal;
      if (!normalizedData.venueName) normalizedData.venueName = titleVal;
      if (!normalizedData.academyName) normalizedData.academyName = titleVal;
      if (!normalizedData.coachName) normalizedData.coachName = titleVal;
    }

    const sportVal = normalizedData.sportName || normalizedData.sport;
    if (sportVal) {
      if (!normalizedData.sport) normalizedData.sport = sportVal;
      if (!normalizedData.sportName) normalizedData.sportName = sportVal;
    }

    const idVal = normalizedData.tournamentUuid || normalizedData.venueUuid || normalizedData.id;
    if (idVal) {
      if (!normalizedData.id) normalizedData.id = idVal;
      if (!normalizedData.tournamentUuid) normalizedData.tournamentUuid = idVal;
      if (!normalizedData.venueUuid) normalizedData.venueUuid = idVal;
    }

    for (const [key, value] of Object.entries(normalizedData)) {
      resolved = resolved.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
    }
    return resolved;
  },
};

// ─── Public SEO Service for Next.js SSR & Crawlers ───
export const PublicSeoService = {
  getGlobalSettings: async (): Promise<SEOGlobalSettings> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOGlobalSettings }>('/api/identity/seo/global');
      if (res?.data) return res.data;
    } catch {}
    return INITIAL_GLOBAL_SETTINGS;
  },

  getPageMetadata: async (route: string): Promise<SEOPageItem | null> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEOPageItem }>(
        `/api/identity/seo/page?route=${encodeURIComponent(route)}`
      );
      if (res?.data) return res.data;
    } catch {}
    const matched = INITIAL_SEO_PAGES.find((p) => p.routePattern === route);
    return matched || null;
  },

  resolveEntityMetadata: async (
    entityType: string,
    entityId: string,
    entityData: Record<string, string>
  ): Promise<{
    title: string;
    description: string;
    canonicalUrl: string;
    robotsDirective: string;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
    twitterCardType: string;
  }> => {
    try {
      const res = await fetchClient<{
        success?: boolean;
        data: {
          title: string;
          description: string;
          canonicalUrl: string;
          robotsDirective: string;
          ogTitle: string;
          ogDescription: string;
          ogImageUrl: string;
          twitterCardType: string;
        };
      }>(`/api/identity/seo/resolve?entityType=${entityType}&entityId=${entityId}`, {
        method: 'POST',
        body: JSON.stringify(entityData),
      });
      if (res?.data) return res.data;
    } catch {}

    const template = INITIAL_SEO_TEMPLATES.find((t) => t.entityType === entityType);
    if (template) {
      return {
        title: SEOAdminService.resolveTemplate(template.titleTemplate, entityData),
        description: SEOAdminService.resolveTemplate(template.descriptionTemplate, entityData),
        canonicalUrl: SEOAdminService.resolveTemplate(template.canonicalTemplate, entityData),
        robotsDirective: template.robotsDirective,
        ogTitle: SEOAdminService.resolveTemplate(template.ogTitleTemplate, entityData),
        ogDescription: SEOAdminService.resolveTemplate(template.ogDescriptionTemplate, entityData),
        ogImageUrl: template.defaultOgImage,
        twitterCardType: 'summary_large_image',
      };
    }

    return {
      title: INITIAL_GLOBAL_SETTINGS.defaultTitle,
      description: INITIAL_GLOBAL_SETTINGS.defaultDescription,
      canonicalUrl: INITIAL_GLOBAL_SETTINGS.canonicalBaseUrl,
      robotsDirective: INITIAL_GLOBAL_SETTINGS.defaultRobots,
      ogTitle: INITIAL_GLOBAL_SETTINGS.defaultOgTitle,
      ogDescription: INITIAL_GLOBAL_SETTINGS.defaultOgDescription,
      ogImageUrl: INITIAL_GLOBAL_SETTINGS.defaultOgImage,
      twitterCardType: INITIAL_GLOBAL_SETTINGS.twitterCardType,
    };
  },

  getActiveRedirects: async (): Promise<SEORedirectItem[]> => {
    try {
      const res = await fetchClient<{ success?: boolean; data: SEORedirectItem[] }>('/api/identity/seo/redirects');
      if (res?.data && Array.isArray(res.data)) return res.data;
    } catch {}
    return INITIAL_SEO_REDIRECTS.filter((r) => r.enabled);
  },

  trackRedirectHit: async (sourcePath: string): Promise<void> => {
    try {
      await fetchClient(`/api/identity/seo/redirects/hit?sourcePath=${encodeURIComponent(sourcePath)}`, {
        method: 'POST',
      });
    } catch {}
  },
};

