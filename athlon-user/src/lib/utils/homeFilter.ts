/**
 * Athlon Home Search & Filter Utilities
 * Provides comprehensive match algorithms for Sports, Place (City / Location / Venue), and general Keyword queries across Tournaments, Championships, Venues, Academies, Coaches, and Live Scores.
 */

export const POPULAR_SPORTS = [
  'All',
  'Badminton',
  'Cricket',
  'Football',
  'Tennis',
  'Pickleball',
  'Table Tennis',
  'Basketball',
  'Volleyball',
  'Squash',
  'Padel',
];

const SPORT_SYNONYMS: Record<string, string[]> = {
  badminton: ['badminton', 'shuttle', 'badminton court'],
  football: ['football', 'soccer', 'futsal', 'fifa', 'football turf'],
  cricket: ['cricket', 'box cricket', 'cricket net', 'cricket pitch'],
  tennis: ['tennis', 'lawn tennis', 'tennis court'],
  pickleball: ['pickleball', 'pickle ball', 'pickleball court'],
  'table tennis': ['table tennis', 'ping pong', 'tt'],
  basketball: ['basketball', 'hoop', 'basketball court'],
  volleyball: ['volleyball', 'volleyball court'],
  squash: ['squash', 'squash court'],
  padel: ['padel', 'paddle', 'padel court'],
};

/**
 * Universal sport matching helper
 */
export function matchSport(itemSport?: any, targetSport?: string): boolean {
  if (!targetSport || targetSport.toLowerCase() === 'all') return true;
  if (!itemSport) return false;

  const target = targetSport.toLowerCase().trim();
  const synonyms = SPORT_SYNONYMS[target] || [target];

  const checkMatch = (val: any): boolean => {
    if (!val) return false;
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      return synonyms.some((syn) => lower.includes(syn) || syn.includes(lower));
    }
    if (typeof val === 'object') {
      const name = String(
        val.sportName ||
          val.name ||
          val.sport ||
          val.sportType ||
          val.title ||
          val.value ||
          val.facilityType ||
          ''
      ).toLowerCase();
      return synonyms.some((syn) => name.includes(syn) || syn.includes(name));
    }
    return false;
  };

  if (Array.isArray(itemSport)) {
    return itemSport.some(checkMatch);
  }

  return checkMatch(itemSport);
}

/**
 * Universal place / location matching helper
 */
export function matchPlace(
  item: {
    location?: string;
    city?: string;
    state?: string;
    venue?: string;
    addressLine1?: string;
    address?: string;
    country?: string;
    profile?: {
      city?: string;
      state?: string;
      address?: string;
      country?: string;
    };
  },
  targetPlace?: string
): boolean {
  if (!targetPlace || targetPlace.toLowerCase() === 'all') return true;
  if (!item) return false;

  const target = targetPlace.toLowerCase().trim();
  const searchString = [
    item.location,
    item.city,
    item.state,
    item.venue,
    item.addressLine1,
    item.address,
    item.country,
    item.profile?.city,
    item.profile?.state,
    item.profile?.address,
    item.profile?.country,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchString.includes(target);
}

/**
 * Venue-specific sport matcher
 * Checks root sports, amenities, name, AND all nested facilities / courts
 */
export function matchVenueSport(venue: any, targetSport?: string): boolean {
  if (!targetSport || targetSport.toLowerCase() === 'all') return true;
  if (!venue) return false;

  const target = targetSport.toLowerCase().trim();
  const synonyms = SPORT_SYNONYMS[target] || [target];

  // 1. Check direct sportsOffered array / string
  if (matchSport(venue.sportsOffered, targetSport)) return true;

  // 2. Check root sports array or sport string
  if (matchSport(venue.sports, targetSport)) return true;
  if (matchSport(venue.sport, targetSport)) return true;
  if (matchSport(venue.sportType, targetSport)) return true;

  // 3. Deeply check nested facilities / courts
  const facilitiesList = Array.isArray(venue.facilities)
    ? venue.facilities
    : Array.isArray(venue.courts)
      ? venue.courts
      : [];

  if (facilitiesList.length > 0) {
    const matchedFac = facilitiesList.some((f: any) => {
      if (matchSport(f.sports, targetSport)) return true;
      if (matchSport(f.sportsOffered, targetSport)) return true;
      if (matchSport(f.sport, targetSport)) return true;
      if (matchSport(f.sportName, targetSport)) return true;
      if (matchSport(f.sportType, targetSport)) return true;
      if (matchSport(f.structureType, targetSport)) return true;
      if (matchSport(f.facilityType, targetSport)) return true;
      if (f.name && synonyms.some((syn) => f.name.toLowerCase().includes(syn))) return true;
      if (f.description && synonyms.some((syn) => f.description.toLowerCase().includes(syn))) return true;
      return false;
    });
    if (matchedFac) return true;
  }

  // 4. Check amenities (e.g. "Badminton Rackets", "Cricket Net")
  if (matchSport(venue.amenities, targetSport)) return true;

  // 5. Check venue name & description
  if (venue.name && synonyms.some((syn) => venue.name.toLowerCase().includes(syn))) return true;
  if (venue.description && synonyms.some((syn) => venue.description.toLowerCase().includes(syn))) return true;

  return false;
}

/**
 * Academy-specific sport matcher
 */
export function matchAcademySport(academy: any, targetSport?: string): boolean {
  if (!targetSport || targetSport.toLowerCase() === 'all') return true;
  if (!academy) return false;

  const target = targetSport.toLowerCase().trim();

  // Check profile.sportsOffered
  if (matchSport(academy.profile?.sportsOffered, targetSport)) return true;
  // Check root sportsOffered
  if (matchSport(academy.sportsOffered, targetSport)) return true;
  // Check sportType
  if (matchSport(academy.sportType, targetSport)) return true;
  // Check tags
  if (matchSport(academy.tags, targetSport)) return true;
  // Check sport / sports
  if (matchSport(academy.sport, targetSport)) return true;
  if (matchSport(academy.sports, targetSport)) return true;
  // Check name & description / bio
  if (academy.name && academy.name.toLowerCase().includes(target)) return true;
  if (academy.description && academy.description.toLowerCase().includes(target)) return true;
  if (academy.profile?.bio && academy.profile.bio.toLowerCase().includes(target)) return true;
  if (academy.profile?.description && academy.profile.description.toLowerCase().includes(target)) return true;

  // Check card displayed sports list
  const rawSports = academy.profile?.sportsOffered;
  const sportsList: string[] = rawSports
    ? rawSports.split(',').map((s: string) => s.trim()).filter(Boolean)
    : academy.tags && academy.tags.length > 0
      ? academy.tags.slice(0, 3)
      : [academy.sportType || 'Badminton'];

  if (matchSport(sportsList, targetSport)) return true;

  return false;
}

/**
 * Coach-specific sport matcher
 */
export function matchCoachSport(coach: any, targetSport?: string): boolean {
  if (!targetSport || targetSport.toLowerCase() === 'all') return true;
  if (!coach) return false;

  const target = targetSport.toLowerCase().trim();

  // Check profile.sportsOffered & specializations
  if (matchSport(coach.profile?.sportsOffered, targetSport)) return true;
  if (matchSport(coach.profile?.specializations, targetSport)) return true;
  if (matchSport(coach.specialization, targetSport)) return true;
  if (matchSport(coach.specializations, targetSport)) return true;
  // Check root sportsOffered
  if (matchSport(coach.sportsOffered, targetSport)) return true;
  // Check sportType
  if (matchSport(coach.sportType, targetSport)) return true;
  // Check tags
  if (matchSport(coach.tags, targetSport)) return true;
  // Check sport / sports
  if (matchSport(coach.sport, targetSport)) return true;
  if (matchSport(coach.sports, targetSport)) return true;
  // Check name & bio / description
  if (coach.name && coach.name.toLowerCase().includes(target)) return true;
  if (coach.description && coach.description.toLowerCase().includes(target)) return true;
  if (coach.profile?.bio && coach.profile.bio.toLowerCase().includes(target)) return true;
  if (coach.profile?.description && coach.profile.description.toLowerCase().includes(target)) return true;

  // Check card displayed sports list
  const rawSports = coach.profile?.sportsOffered;
  const sportsList: string[] = rawSports
    ? rawSports.split(',').map((s: string) => s.trim()).filter(Boolean)
    : coach.tags && coach.tags.length > 0
      ? coach.tags.slice(0, 3)
      : [coach.sportType || 'Badminton'];

  if (matchSport(sportsList, targetSport)) return true;

  return false;
}

/**
 * General keyword search matcher
 */
export function matchSearchQuery(searchPayload: string, query?: string): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();
  return searchPayload.toLowerCase().includes(q);
}

/**
 * Extracts a normalized list of distinct cities / locations from dataset items
 */
export function extractAvailablePlaces(
  tournaments: any[] = [],
  championships: any[] = [],
  venues: any[] = [],
  academies: any[] = [],
  coaches: any[] = []
): string[] {
  const places = new Set<string>();

  const sanitizePlace = (val?: string) => {
    if (!val || typeof val !== 'string') return;
    const cleaned = val.split(',')[0].trim();
    if (cleaned && cleaned.length > 1 && !cleaned.toLowerCase().includes('http') && !cleaned.toLowerCase().includes('undefined')) {
      places.add(cleaned);
    }
  };

  tournaments.forEach((t) => {
    sanitizePlace(t.location);
    sanitizePlace(t.city);
    sanitizePlace(t.state);
  });

  championships.forEach((c) => {
    sanitizePlace(c.location);
    sanitizePlace(c.city);
    sanitizePlace(c.venue);
    sanitizePlace(c.state);
  });

  venues.forEach((v) => {
    sanitizePlace(v.city);
    sanitizePlace(v.state);
    sanitizePlace(v.addressLine1);
    sanitizePlace(v.address);
    sanitizePlace(v.location);
  });

  academies.forEach((a) => {
    sanitizePlace(a.profile?.city);
    sanitizePlace(a.profile?.state);
    sanitizePlace(a.city);
    sanitizePlace(a.state);
    sanitizePlace(a.location);
    sanitizePlace(a.address);
  });

  coaches.forEach((c) => {
    sanitizePlace(c.profile?.city);
    sanitizePlace(c.profile?.state);
    sanitizePlace(c.city);
    sanitizePlace(c.state);
    sanitizePlace(c.location);
    sanitizePlace(c.address);
  });

  return Array.from(places).filter(Boolean).sort();
}
