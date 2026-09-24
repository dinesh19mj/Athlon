'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  ArrowRight,
  Building2,
  Trophy,
  Building,
  CalendarDays,
  Calendar,
  MapPin,
  Tv,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Home,
  User,
  CheckCircle2,
  Shield,
  Search,
  Flame,
  Swords,
  Layers,
  ArrowUpRight,
  Gavel,
  Check,
  Zap,
  Radio,
  GraduationCap,
  UserCheck,
  Compass,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ScoreService, LiveScore, isTournamentScore } from '@/lib/api/scores';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';
import { VenueMarketplaceCard } from '@/components/marketplace/VenueMarketplaceCard';
import { AcademyMarketplaceCard } from '@/components/marketplace/AcademyMarketplaceCard';
import { CoachMarketplaceCard } from '@/components/marketplace/CoachMarketplaceCard';
import { CommunitySessionCard } from '@/components/community/CommunitySessionCard';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';
import { CommunityService, SessionResponse } from '@/lib/api/community';
import { venueApi, facilityApi } from '@/lib/api/venue';
import { OrganizationService } from '@/lib/api/organization';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import HomeSearchFilterBar from '@/components/home/HomeSearchFilterBar';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  matchSport,
  matchPlace,
  matchVenueSport,
  matchAcademySport,
  matchCoachSport,
  matchSearchQuery,
  extractAvailablePlaces,
} from '@/lib/utils/homeFilter';

export function MarketingPageClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { themeKey } = useAthlonTheme();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // For every non-logged-in user, auto-open the login modal when opening the application
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        setIsAuthModalOpen(true);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [finishedScores, setFinishedScores] = useState<LiveScore[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [championships, setChampionships] = useState<TeamChampionship[]>([]);
  const [publicVenues, setPublicVenues] = useState<any[]>([]);
  const [publicAcademies, setPublicAcademies] = useState<any[]>([]);
  const [publicCoaches, setPublicCoaches] = useState<any[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState('All');

  // Scroll Container Refs
  const mobileSessionsRef = useRef<HTMLDivElement>(null);
  const mobileVenuesRef = useRef<HTMLDivElement>(null);
  const mobileAcademiesRef = useRef<HTMLDivElement>(null);
  const mobileCoachesRef = useRef<HTMLDivElement>(null);
  const desktopSessionsRef = useRef<HTMLDivElement>(null);
  const desktopAuctionsRef = useRef<HTMLDivElement>(null);
  const desktopLiveScoresRef = useRef<HTMLDivElement>(null);
  const desktopVenuesRef = useRef<HTMLDivElement>(null);
  const desktopAcademiesRef = useRef<HTMLDivElement>(null);
  const desktopCoachesRef = useRef<HTMLDivElement>(null);
  const desktopChampionshipsRef = useRef<HTMLDivElement>(null);
  const desktopTournamentsRef = useRef<HTMLDivElement>(null);
  const desktopFinishedRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // 1. Fetch live + finished scores
    const fetchScores = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      ScoreService.getLive()
        .then((res: any) => {
          if (res && res.data) {
            const tournamentLive = res.data.filter(isTournamentScore);
            setLiveScores(tournamentLive);
          }
        })
        .catch(() => { });

      ScoreService.getAll()
        .then((res: any) => {
          if (res?.data) {
            const tournamentScores = res.data.filter(isTournamentScore);
            const finished = tournamentScores.filter((s: LiveScore) => {
              const m = s.scoreMeta || {};
              const games = m.games || [];
              const wonA = games.filter((g: any) => g.winner === 'A').length;
              const wonB = games.filter((g: any) => g.winner === 'B').length;
              return s.isFinal === true || m.isCompleted === true || wonA >= 2 || wonB >= 2 || (games.length > 0 && !s.isActive);
            });
            setFinishedScores(finished);
          }
        })
        .catch(() => { });
    };

    fetchScores();
    const interval = setInterval(fetchScores, 15000);

    // 2. Fetch public tournaments
    TournamentService.getAll()
      .then((res) => {
        const publicList = (res.data || []).filter((t: Tournament) => t.visibility === 'PUBLIC');
        setTournaments(publicList);
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    // 3. Fetch public team championships
    const loadPublicChampionships = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      TeamChampionshipService.getAllPublic()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          setChampionships(list);
        })
        .catch(() => { });
    };

    loadPublicChampionships();
    const champInterval = setInterval(loadPublicChampionships, 15000);

    // 4. Fetch public Academies, Coaches & Venues with full enrichment
    const loadMarketplaceData = async () => {
      try {
        const orgRes = await OrganizationService.getAll().catch(() => ({ data: [] }));
        const list = Array.isArray(orgRes) ? orgRes : orgRes?.data || [];
        const rawAcademies = list.filter((o: any) => o.type === 'ACADEMY');
        const rawCoaches = list.filter((o: any) => o.type === 'COACH');

        // Build sets of non-venue organization IDs, UUIDs, and names (coaches, academies, organizers, clubs)
        const nonVenueOrgUuids = new Set<string>();
        const nonVenueOrgIds = new Set<string>();
        const nonVenueOrgNames = new Set<string>();

        list.forEach((o: any) => {
          const type = (o.type || '').toUpperCase();
          if (type !== 'COURT' && type !== 'VENUE' && type !== 'VENUE_MANAGER') {
            if (o.uuid) nonVenueOrgUuids.add(String(o.uuid).toLowerCase());
            if (o.organizationUuid) nonVenueOrgUuids.add(String(o.organizationUuid).toLowerCase());
            if (o.id) nonVenueOrgIds.add(String(o.id).toLowerCase());
            if (o.orgId) nonVenueOrgIds.add(String(o.orgId).toLowerCase());
            if (o.organizationId) nonVenueOrgIds.add(String(o.organizationId).toLowerCase());
            if (o.name) nonVenueOrgNames.add(o.name.trim().toLowerCase());
          }
        });

        // Enrich Academies
        const enrichedAcademies = await Promise.all(
          rawAcademies.map(async (a: any) => {
            const orgUuid = a.uuid || a.organizationUuid || a.id;
            let profile = a.profile;
            if (!profile && orgUuid) {
              try {
                const pRes = await OrganizationService.getProfileByOrgUuid(orgUuid);
                profile = pRes?.data || pRes || null;
              } catch {
                profile = null;
              }
            }
            const sportsOffered = profile?.sportsOffered || a.sportsOffered || a.sportType || 'Badminton';
            return { ...a, profile, sportsOffered };
          })
        );
        setPublicAcademies(enrichedAcademies);

        // Enrich Coaches
        const enrichedCoaches = await Promise.all(
          rawCoaches.map(async (c: any) => {
            const orgUuid = c.uuid || c.organizationUuid || c.id;
            let profile = c.profile;
            if (!profile && orgUuid) {
              try {
                const pRes = await OrganizationService.getProfileByOrgUuid(orgUuid);
                profile = pRes?.data || pRes || null;
              } catch {
                profile = null;
              }
            }
            const sportsOffered = profile?.sportsOffered || c.sportsOffered || c.sportType || 'Badminton';
            return { ...c, profile, sportsOffered };
          })
        );
        setPublicCoaches(enrichedCoaches);

        // Fetch Venues strictly for slot booking
        const publicRes = await venueApi.getPublicVenues().catch(() => ({ data: [] }));
        const rawVenues: any[] = Array.isArray(publicRes?.data) ? publicRes.data : Array.isArray(publicRes) ? publicRes : [];

        // Deduplicate and strictly filter out non-venue workspaces (coaches/academies/organizers/associations)
        const venueMap = new Map<string, any>();
        rawVenues.forEach((v) => {
          if (v.bookingEnabled === false) return;
          const vType = (v.venueType || v.type || '').toUpperCase();
          if (vType === 'ACADEMY' || vType === 'COACH' || vType === 'CLUB' || vType === 'ORGANIZER' || vType === 'ASSOCIATION') return;

          const orgUuid = String(v.organizationUuid || v.uuid || '').toLowerCase();
          const orgId = String(v.organizationId || v.id || v.orgId || '').toLowerCase();
          if (orgUuid && nonVenueOrgUuids.has(orgUuid)) return;
          if (orgId && nonVenueOrgIds.has(orgId)) return;

          const vName = (v.name || '').toLowerCase().trim();
          if (vName && nonVenueOrgNames.has(vName)) return;

          const key = String(v.venueUuid || v.uuid || v.venueId || v.id || '');
          if (key) venueMap.set(key, v);
        });
        const uniqueVenues = Array.from(venueMap.values());

        if (uniqueVenues.length > 0) {
          const enriched = await Promise.all(
            uniqueVenues.map(async (v: any) => {
              const venueId = v.venueId || v.id;
              let facilities = Array.isArray(v.facilities) ? v.facilities : [];

              if (facilities.length === 0 && venueId) {
                try {
                  const facRes = await facilityApi.getFacilitiesByVenue(venueId);
                  facilities = Array.isArray(facRes?.data) ? facRes.data : Array.isArray(facRes) ? facRes : [];
                } catch {
                  facilities = [];
                }
              }

              const sportsSet = new Set<string>();
              facilities.forEach((f: any) => {
                if (Array.isArray(f.sports)) {
                  f.sports.forEach((s: any) => {
                    if (typeof s === 'string') sportsSet.add(s);
                    else if (s?.sportName) sportsSet.add(s.sportName);
                    else if (s?.name) sportsSet.add(s.name);
                    else if (s?.sport) sportsSet.add(s.sport);
                  });
                }
                if (f.sportName) sportsSet.add(f.sportName);
                if (f.sport) sportsSet.add(f.sport);
                if (f.sportType) sportsSet.add(f.sportType);
                if (f.name) sportsSet.add(f.name);
                if (f.facilityType) sportsSet.add(f.facilityType);
              });

              if (Array.isArray(v.sportsOffered)) {
                v.sportsOffered.forEach((s: string) => sportsSet.add(s));
              } else if (typeof v.sportsOffered === 'string') {
                v.sportsOffered.split(',').forEach((s: string) => sportsSet.add(s.trim()));
              }
              if (v.sport) sportsSet.add(v.sport);
              if (v.sportType) sportsSet.add(v.sportType);

              return {
                ...v,
                venueId: venueId || v.venueId,
                facilities: facilities.length > 0 ? facilities : (v.facilities || []),
                sportsOffered: Array.from(sportsSet).filter(Boolean),
              };
            })
          );

          // Only keep venues with actual facilities or valid venue structures
          const validVenues = enriched.filter((v) => {
            const vName = (v.name || '').toLowerCase().trim();
            if (nonVenueOrgNames.has(vName)) return false;
            return true;
          });

          setPublicVenues(validVenues);
        } else {
          setPublicVenues([]);
        }
      } catch {
        setPublicVenues([]);
      }
    };

        loadMarketplaceData();

    // 5. Fetch public community sessions
    const loadSessions = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      CommunityService.getAllSessions()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          setSessions(list);
        })
        .catch(() => {});
    };

    loadSessions();
    const sessionInterval = setInterval(loadSessions, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(champInterval);
      clearInterval(sessionInterval);
    };
  }, []);

  // Extract Places for Filter Bar
  const availablePlaces = useMemo(() => {
    return extractAvailablePlaces(tournaments, championships, publicVenues, publicAcademies, publicCoaches);
  }, [tournaments, championships, publicVenues, publicAcademies, publicCoaches]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSport('All');
    setSelectedPlace('All');
  };

  // Filtered Datasets
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesSport = matchSport(t.sport, selectedSport);
      const matchesPlace = matchPlace(t, selectedPlace);
      const matchesQuery = matchSearchQuery(`${t.name} ${t.sport} ${t.location || ''} ${t.description || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [tournaments, selectedSport, selectedPlace, searchQuery]);

  const filteredChampionships = useMemo(() => {
    return championships.filter((c) => {
      const matchesSport = matchSport(c.sport, selectedSport);
      const matchesPlace = matchPlace(c, selectedPlace);
      const matchesQuery = matchSearchQuery(`${c.name} ${c.sport} ${c.location || ''} ${c.venue || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [championships, selectedSport, selectedPlace, searchQuery]);

  const filteredVenues = useMemo(() => {
    return publicVenues.filter((v) => {
      const matchesSport = matchVenueSport(v, selectedSport);
      const matchesPlace = matchPlace(v, selectedPlace);
      const sportsText = Array.isArray(v.sportsOffered)
        ? v.sportsOffered.join(' ')
        : Array.isArray(v.sports)
          ? v.sports.map((s: any) => (typeof s === 'string' ? s : s.sportName || '')).join(' ')
          : String(v.sportsOffered || '');
      const amenitiesText = Array.isArray(v.amenities)
        ? v.amenities.map((a: any) => (typeof a === 'string' ? a : a.amenityName || '')).join(' ')
        : '';
      const searchPayload = `${v.name || ''} ${v.venueType || ''} ${v.city || ''} ${v.state || ''} ${v.addressLine1 || ''} ${v.address || ''} ${sportsText} ${amenitiesText}`;
      const matchesQuery = matchSearchQuery(searchPayload, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [publicVenues, selectedSport, selectedPlace, searchQuery]);

  const filteredAcademies = useMemo(() => {
    return publicAcademies.filter((a) => {
      const matchesSport = matchAcademySport(a, selectedSport);
      const matchesPlace = matchPlace(a, selectedPlace);
      const sportsText = `${a.profile?.sportsOffered || ''} ${a.sportsOffered || ''} ${a.sportType || ''} ${(a.tags || []).join(' ')}`;
      const searchPayload = `${a.name || ''} ${sportsText} ${a.city || ''} ${a.profile?.city || ''} ${a.location || ''} ${a.address || ''} ${a.profile?.bio || ''} ${a.description || ''}`;
      const matchesQuery = matchSearchQuery(searchPayload, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [publicAcademies, selectedSport, selectedPlace, searchQuery]);

  const filteredCoaches = useMemo(() => {
    return publicCoaches.filter((c) => {
      const matchesSport = matchCoachSport(c, selectedSport);
      const matchesPlace = matchPlace(c, selectedPlace);
      const searchPayload = `${c.name || ''} ${c.specialization || ''} ${c.city || ''} ${c.state || ''} ${c.sportsOffered || ''}`;
      const matchesQuery = matchSearchQuery(searchPayload, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [publicCoaches, selectedSport, selectedPlace, searchQuery]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSport = selectedSport === 'All' || !selectedSport || (s.sport || '').toLowerCase().includes(selectedSport.toLowerCase());
      const matchesPlace = selectedPlace === 'All' || !selectedPlace || `${s.venueName || ''} ${s.city || ''} ${s.state || ''}`.toLowerCase().includes(selectedPlace.toLowerCase());
      const matchesQuery = matchSearchQuery(`${s.title || ''} ${s.sport || ''} ${s.venueName || ''} ${s.city || ''} ${s.state || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [sessions, selectedSport, selectedPlace, searchQuery]);

  const filteredLiveScores = useMemo(() => {
    return liveScores.filter((s) => {
      const cfg = s.scoreMeta?.config || {};
      const matchesSport = matchSport(cfg.sport || cfg.category, selectedSport);
      const matchesPlace = matchPlace({ location: cfg.courtName, city: cfg.city }, selectedPlace);
      const matchesQuery = matchSearchQuery(`${cfg.tournamentName || ''} ${cfg.courtName || ''} ${cfg.teamAName || ''} ${cfg.teamBName || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [liveScores, selectedSport, selectedPlace, searchQuery]);

  const filteredFinishedScores = useMemo(() => {
    return finishedScores.filter((s) => {
      const cfg = s.scoreMeta?.config || {};
      const matchesSport = matchSport(cfg.sport || cfg.category, selectedSport);
      const matchesPlace = matchPlace({ location: cfg.courtName, city: cfg.city }, selectedPlace);
      const matchesQuery = matchSearchQuery(
        `${cfg.tournamentName || ''} ${cfg.courtName || ''} ${cfg.teamAName || ''} ${cfg.teamBName || ''} ${cfg.category || ''}`,
        searchQuery
      );
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [finishedScores, selectedSport, selectedPlace, searchQuery]);

  const liveAuctionChampionships = filteredChampionships.filter(
    (c) => c.stage === 'AUCTION_STAGE' || c.stage === 'AUCTION_PAUSED' || c.stage === 'AUCTION'
  );

  const totalResults =
    filteredTournaments.length +
    filteredChampionships.length +
    filteredVenues.length +
    filteredAcademies.length +
    filteredCoaches.length +
    filteredLiveScores.length +
    filteredFinishedScores.length;

  const isFiltering =
    searchQuery.trim() !== '' || selectedSport.toLowerCase() !== 'all' || selectedPlace.toLowerCase() !== 'all';

  const mobileCategories: Array<{ id: 'tournaments' | 'academies' | 'bookings' | 'live-score'; label: string }> = [
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'academies', label: 'Academies' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'live-score', label: 'Live Score' },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (hidden on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-28">
        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-5 pt-2">
          {/* ═══════════════════════════════════════════════════════════════════
              HYPER-STYLISH ATHLETIC ARENA HERO (Theme Adaptive)
             ═══════════════════════════════════════════════════════════════════ */}
          <section
            className="relative w-full rounded-[26px] overflow-hidden border p-5 shadow-xl transition-all"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              boxShadow: '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
            }}
          >
            {/* 1. Top Edge Neon Energy Rail */}
            <div
              className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none z-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
              }}
            />

            {/* 2. Stadium Floodlight Spotlight Beams & Multi-Layered Neon Halos */}
            <div
              className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-50 dark:opacity-70 animate-pulse duration-1000 z-0"
              style={{
                background: 'radial-gradient(circle, var(--athlon-primary) 0%, rgba(52, 211, 153, 0.4) 40%, transparent 75%)',
              }}
            />
            <div
              className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-25 dark:opacity-40 z-0"
              style={{
                background: 'radial-gradient(circle, var(--athlon-primary-light, #54AC68) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 80%)',
              }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-20 dark:opacity-30 z-0"
              style={{ backgroundColor: 'var(--athlon-primary)' }}
            />

            {/* 3. Tech Dot-Matrix Pattern with Precision Fade Mask */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.16] dark:opacity-[0.24] z-0"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--athlon-primary) 1.2px, transparent 1.2px)',
                backgroundSize: '16px 16px',
                maskImage: 'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
              }}
            />

            {/* 4. Diagonal Athletic Turf / Carbon Speed Texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06] z-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, var(--athlon-primary) 0, var(--athlon-primary) 1px, transparent 0, transparent 12px)',
              }}
            />

            {/* 5. Comprehensive Multi-Sport Arena, Stadium & Court Wireframe Skeleton */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
              viewBox="0 0 360 260"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="athlonHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--athlon-primary)" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="var(--athlon-primary)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="athlonBeamGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--athlon-primary)" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="var(--athlon-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Stadium Floodlight Cones */}
              <polygon points="340,-20 200,240 250,240 370,-20" fill="url(#athlonBeamGradient)" opacity="0.32" />

              {/* ─── STADIUM ARENA BOWL ARCHITECTURAL SKELETON ─── */}
              <g opacity="0.32" stroke="var(--athlon-primary)">
                {/* Outer Grandstand Rim & Tiers */}
                <ellipse cx="295" cy="55" rx="120" ry="72" fill="none" strokeWidth="1.2" strokeDasharray="3 3" />
                <ellipse cx="295" cy="55" rx="100" ry="60" fill="none" strokeWidth="0.8" opacity="0.6" />
                <ellipse cx="295" cy="55" rx="82" ry="48" fill="none" strokeWidth="1" />
                <ellipse cx="295" cy="55" rx="66" ry="38" fill="none" strokeWidth="0.75" strokeDasharray="2 2" />

                {/* Stadium Radial Structural Truss Ribs */}
                <line x1="295" y1="55" x2="175" y2="55" strokeWidth="0.75" opacity="0.4" />
                <line x1="295" y1="55" x2="200" y2="15" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="235" y2="-10" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="295" y2="-17" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="355" y2="-10" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="390" y2="15" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="415" y2="55" strokeWidth="0.75" opacity="0.4" />
                <line x1="295" y1="55" x2="390" y2="95" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="355" y2="120" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="295" y2="127" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="235" y2="120" strokeWidth="0.75" opacity="0.5" />
                <line x1="295" y1="55" x2="200" y2="95" strokeWidth="0.75" opacity="0.5" />

                {/* Arena Floodlight Mast Skeleton Tower */}
                <g transform="translate(332, 2)">
                  <polygon points="0,0 8,-12 16,0" fill="none" strokeWidth="1" />
                  <line x1="4" y1="-6" x2="12" y2="-6" strokeWidth="0.7" />
                  <circle cx="2" cy="-12" r="1.5" fill="var(--athlon-primary)" />
                  <circle cx="8" cy="-15" r="1.5" fill="var(--athlon-primary)" />
                  <circle cx="14" cy="-12" r="1.5" fill="var(--athlon-primary)" />
                </g>
              </g>

              {/* ─── ISOMETRIC COURT SKELETON (BADMINTON / TENNIS) ─── */}
              <g transform="translate(205, 52)" opacity="0.38" stroke="var(--athlon-primary)">
                {/* Court Outer Perimeter Wireframe */}
                <polygon points="15,40 85,0 150,35 80,75" fill="none" strokeWidth="1.2" />
                {/* Singles Sidelines */}
                <line x1="22" y1="36" x2="87" y2="-1" strokeWidth="0.7" strokeDasharray="3 2" />
                <line x1="73" y1="71" x2="138" y2="34" strokeWidth="0.7" strokeDasharray="3 2" />
                {/* Center Division / Net Wireframe & Posts */}
                <polygon points="50,20 115,55 115,44 50,9" fill="rgba(84, 172, 104, 0.08)" strokeWidth="1" />
                {/* Net Mesh Crosshatches */}
                <line x1="62" y1="17" x2="62" y2="28" strokeWidth="0.6" />
                <line x1="74" y1="23" x2="74" y2="34" strokeWidth="0.6" />
                <line x1="86" y1="30" x2="86" y2="41" strokeWidth="0.6" />
                <line x1="98" y1="37" x2="98" y2="48" strokeWidth="0.6" />
                <line x1="110" y1="44" x2="110" y2="55" strokeWidth="0.6" />
                {/* Net Posts */}
                <line x1="50" y1="20" x2="50" y2="6" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="115" y1="55" x2="115" y2="41" strokeWidth="1.8" strokeLinecap="round" />
                {/* Service Lines */}
                <line x1="32" y1="30" x2="67" y2="49" strokeWidth="0.7" />
                <line x1="97" y1="26" x2="132" y2="45" strokeWidth="0.7" />
                <line x1="50" y1="40" x2="115" y2="35" strokeWidth="0.7" />
              </g>

              {/* ─── FOOTBALL / TURF PITCH SKELETON ─── */}
              <g transform="translate(18, 148)" opacity="0.22" stroke="var(--athlon-primary)">
                {/* Touchlines & Halfway Line */}
                <rect x="0" y="0" width="130" height="75" rx="3" fill="none" strokeWidth="1" />
                <line x1="65" y1="0" x2="65" y2="75" strokeWidth="0.9" />
                {/* Center Circle & Spot */}
                <circle cx="65" cy="37.5" r="16" fill="none" strokeWidth="0.9" />
                <circle cx="65" cy="37.5" r="2" fill="var(--athlon-primary)" />
                {/* Left Penalty Box & Goal Area */}
                <rect x="0" y="16" width="24" height="43" fill="none" strokeWidth="0.8" />
                <rect x="0" y="26" width="9" height="23" fill="none" strokeWidth="0.7" />
                <path d="M 24 30 A 10 10 0 0 1 24 45" fill="none" strokeWidth="0.75" />
                {/* Right Penalty Box & Goal Area */}
                <rect x="106" y="16" width="24" height="43" fill="none" strokeWidth="0.8" />
                <rect x="121" y="26" width="9" height="23" fill="none" strokeWidth="0.7" />
                <path d="M 106 30 A 10 10 0 0 0 106 45" fill="none" strokeWidth="0.75" />
              </g>

              {/* ─── SPORTS EQUIPMENT SKELETONS (Racket, Shuttlecock, Ball Seams) ─── */}
              {/* 1. Badminton Racket Wireframe Skeleton (Positioned at the beginning of "COMPETE TODAY.") */}
              <g transform="translate(36, 62) rotate(-26)" opacity="0.38" stroke="var(--athlon-primary)">
                {/* Dual-Bevel Isometric Racket Head Rim */}
                <ellipse cx="0" cy="0" rx="17" ry="23" fill="rgba(84, 172, 104, 0.05)" strokeWidth="1.4" />
                <ellipse cx="0" cy="0" rx="15.5" ry="21.5" fill="none" strokeWidth="0.6" opacity="0.7" />
                {/* High-Tension Racket Strings Matrix */}
                <line x1="-11" y1="-14" x2="-11" y2="14" strokeWidth="0.5" />
                <line x1="-5.5" y1="-20" x2="-5.5" y2="20" strokeWidth="0.5" />
                <line x1="0" y1="-23" x2="0" y2="23" strokeWidth="0.6" />
                <line x1="5.5" y1="-20" x2="5.5" y2="20" strokeWidth="0.5" />
                <line x1="11" y1="-14" x2="11" y2="14" strokeWidth="0.5" />
                <line x1="-14" y1="-12" x2="14" y2="-12" strokeWidth="0.5" />
                <line x1="-16" y1="-6" x2="16" y2="-6" strokeWidth="0.5" />
                <line x1="-17" y1="0" x2="17" y2="0" strokeWidth="0.6" />
                <line x1="-16" y1="6" x2="16" y2="6" strokeWidth="0.5" />
                <line x1="-14" y1="12" x2="14" y2="12" strokeWidth="0.5" />
                {/* Built-in T-Joint & Shaft */}
                <polygon points="-4.5,22 4.5,22 1.5,30 -1.5,30" fill="rgba(84, 172, 104, 0.2)" strokeWidth="1" />
                <line x1="0" y1="30" x2="0" y2="60" strokeWidth="1.6" />
                {/* Ergonomic Contour Grip Handle */}
                <rect x="-3" y="60" width="6" height="26" rx="1.5" fill="rgba(84, 172, 104, 0.12)" strokeWidth="1.2" />
                <line x1="-3" y1="66" x2="3" y2="67" strokeWidth="0.6" />
                <line x1="-3" y1="72" x2="3" y2="73" strokeWidth="0.6" />
                <line x1="-3" y1="78" x2="3" y2="79" strokeWidth="0.6" />
                {/* Butt Cap */}
                <rect x="-4" y="85" width="8" height="2.5" rx="0.8" fill="var(--athlon-primary)" strokeWidth="0.8" />
              </g>

              {/* 2. Premium Aerodynamic Tournament Feather Shuttlecock */}
              <g transform="translate(170, 24) rotate(28) scale(0.7)" opacity="0.45" stroke="var(--athlon-primary)">
                {/* Flight Wind Trails */}
                <path d="M -16 6 Q -26 12 -34 14" fill="none" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.45" />
                <path d="M -14 0 Q -24 5 -32 6" fill="none" strokeWidth="0.65" strokeDasharray="2 3" opacity="0.35" />

                {/* Translucent Feather Cone Fill */}
                <path
                  d="M -5 7 C -7 -2 -11 -12 -16 -23 C -8 -26 8 -26 16 -23 C 11 -12 7 -2 5 7 Z"
                  fill="rgba(84, 172, 104, 0.08)"
                  stroke="none"
                />

                {/* Feather Outer Flared Contours */}
                <path d="M -5 7 C -7 -2 -11 -12 -16 -23" fill="none" strokeWidth="1.2" />
                <path d="M 5 7 C 7 -2 11 -12 16 -23" fill="none" strokeWidth="1.2" />

                {/* 16 Overlapping Feather Shafts (Rachis Spines) */}
                <line x1="0" y1="7" x2="0" y2="-24.5" strokeWidth="0.8" />
                <line x1="-1.8" y1="7" x2="-3.2" y2="-24.2" strokeWidth="0.65" />
                <line x1="1.8" y1="7" x2="3.2" y2="-24.2" strokeWidth="0.65" />
                <line x1="-3.5" y1="7" x2="-6.8" y2="-24" strokeWidth="0.65" />
                <line x1="3.5" y1="7" x2="6.8" y2="-24" strokeWidth="0.65" />
                <line x1="-4.6" y1="7" x2="-11" y2="-23.6" strokeWidth="0.65" />
                <line x1="4.6" y1="7" x2="11" y2="-23.6" strokeWidth="0.65" />

                {/* Scalloped Individual Feather Tips Crown */}
                <path
                  d="M -16 -23 C -15.5 -26.5 -12.5 -26.5 -11 -23.5 C -10 -27 -7 -27 -5.5 -24 C -4.5 -27.5 -1.5 -27.5 0 -24.5 C 1.5 -27.5 4.5 -27.5 5.5 -24 C 7 -27 10 -27 11 -23.5 C 12.5 -26.5 15.5 -26.5 16 -23"
                  fill="none"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
                <ellipse cx="0" cy="-23.5" rx="16" ry="3.2" fill="none" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.6" />

                {/* Dual Binding Thread Lines (The signature twin rings of tournament shuttles) */}
                <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" />
                <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" strokeDasharray="2 1.5" />
                <ellipse cx="0" cy="-14.5" rx="12.2" ry="2.6" fill="none" strokeWidth="0.9" strokeDasharray="2.5 1.5" />

                {/* Feather Vane Texture Shading */}
                <line x1="-12" y1="-14" x2="-14.5" y2="-19" strokeWidth="0.5" opacity="0.7" />
                <line x1="12" y1="-14" x2="14.5" y2="-19" strokeWidth="0.5" opacity="0.7" />
                <line x1="-8" y1="-6" x2="-10" y2="-10" strokeWidth="0.5" opacity="0.6" />
                <line x1="8" y1="-6" x2="10" y2="-10" strokeWidth="0.5" opacity="0.6" />

                {/* Cork Base Ribbon Collar (Signature colored tape band) */}
                <rect x="-5" y="7" width="10" height="3" rx="0.5" fill="rgba(84, 172, 104, 0.35)" strokeWidth="0.9" />

                {/* Natural Rounded Cork Dome Base */}
                <path
                  d="M -5 10 C -5 15.5 5 15.5 5 10 Z"
                  fill="rgba(84, 172, 104, 0.25)"
                  strokeWidth="1.1"
                />
              </g>

              {/* 3. Sports Ball Geodesic / Seam Skeleton (Basketball & Tennis curved arcs) */}
              <g transform="translate(230, 185)" opacity="0.25" stroke="var(--athlon-primary)">
                <circle cx="0" cy="0" r="16" fill="none" strokeWidth="1.2" />
                <path d="M -16 0 A 16 16 0 0 1 16 0" fill="none" strokeWidth="0.8" />
                <path d="M 0 -16 A 16 16 0 0 1 0 16" fill="none" strokeWidth="0.8" />
                <path d="M -11 -11 C -4 -4, -4 4, -11 11" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
                <path d="M 11 -11 C 4 -4, 4 4, 11 11" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
              </g>

              {/* 4. Running Track Curved Velocity Lanes */}
              <g opacity="0.28" stroke="var(--athlon-primary)">
                <ellipse cx="320" cy="40" rx="145" ry="110" fill="none" strokeWidth="0.8" strokeDasharray="4 4" />
                <ellipse cx="320" cy="40" rx="180" ry="135" fill="none" strokeWidth="1" />
                <ellipse cx="320" cy="40" rx="215" ry="160" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
              </g>

              {/* Velocity Chevrons in Top-Right */}
              <g transform="translate(295, 14)" stroke="var(--athlon-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
                <line x1="0" y1="0" x2="6" y2="10" />
                <line x1="6" y1="10" x2="0" y2="20" />
                <line x1="8" y1="0" x2="14" y2="10" />
                <line x1="14" y1="10" x2="8" y2="20" />
                <line x1="16" y1="0" x2="22" y2="10" />
                <line x1="22" y1="10" x2="16" y2="20" />
              </g>

              {/* Technical Reticles & Grid Coordinates */}
              <path d="M 335 150 L 345 150 M 340 145 L 340 155" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.3" />
              <path d="M 28 215 L 36 215 M 32 211 L 32 219" stroke="var(--athlon-primary)" strokeWidth="0.8" opacity="0.25" />
              <path d="M 16 12 L 22 12 M 16 12 L 16 18" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.35" />
              <path d="M 344 248 L 338 248 M 344 248 L 344 242" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.35" />
            </svg>

            {/* 7. Tiny Pulsing Starlight / Stadium Spark Particles */}
            <div className="absolute top-8 right-24 w-1.5 h-1.5 rounded-full bg-primary/70 blur-[0.5px] animate-ping duration-1000 pointer-events-none z-0" />
            <div className="absolute top-28 right-8 w-1.5 h-1.5 rounded-full bg-primary/50 blur-[0.5px] pointer-events-none z-0" />

            {/* 8. Top Specular Arc Light */}
            <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

            <div className="relative z-10 space-y-4">
              {/* 1. Live Platform Ticker Pill */}
              <div className="flex items-center justify-between gap-2">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Live Sports
                  </span>
                </div>
              </div>

              {/* 2. Bold Hero Typography */}
              <div className="space-y-1">
                <h1 className="text-[23px] font-black leading-[1.12] tracking-tight uppercase text-foreground">
                  <span>Compete Today.</span>
                  <br />
                  <span className="text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]">
                    Champion Tomorrow.
                  </span>
                </h1>
                <p className="text-[11.5px] text-text-secondary leading-relaxed font-medium pt-0.5">
                  Discover tournaments, reserve courts, and track live match scoring instantly.
                </p>
              </div>

              {/* 3. Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  href="/tournaments"
                  className="flex items-center justify-center gap-1.5 text-[11px] font-black px-4 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-md tracking-wider uppercase"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: 'var(--athlon-primary-foreground)',
                    boxShadow: '0 6px 20px var(--athlon-primary-glow)',
                  }}
                >
                  <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'var(--athlon-primary-foreground)' }} />
                  <span>Tournaments</span>
                </Link>
                <Link
                  href="/venues"
                  className="flex items-center justify-center gap-1.5 border text-[11px] font-black px-4 py-3 rounded-2xl active:scale-95 transition-all shadow-sm tracking-wider uppercase backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                >
                  <Building2 className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
                  <span>Book Venues</span>
                </Link>
              </div>

              {/* 4. Live Telemetry Strip */}
              <div
                className="grid grid-cols-3 divide-x rounded-2xl p-2.5 mt-1 border backdrop-blur-md"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex flex-col items-center justify-center text-center px-1" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-xs font-black text-foreground font-mono leading-none">500+</span>
                  <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                    Events
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-1" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-xs font-black text-primary font-mono leading-none">120+</span>
                  <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                    Venues
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-1" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">Live</span>
                  <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                    Scoring
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Primary Categories with 3D Icons */}
          <section className="flex items-center justify-between w-full pt-1 pb-1 px-1">
            {mobileCategories.map((cat) => {
              const isLiveScore = cat.id === 'live-score';
              const hasLive = isLiveScore && liveScores.length > 0;

              return (
                <Link
                  href={`/${cat.id}`}
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div
                    className="relative w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      boxShadow: '0 6px 20px -2px var(--athlon-primary-soft), 0 2px 6px var(--athlon-shadow)',
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-foreground/[0.04] to-transparent pointer-events-none" />

                    {hasLive && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}

                    <Athlon3DIcon
                      type={cat.id}
                      size={40}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold text-center tracking-tight transition-colors group-hover:text-primary"
                    style={{ color: 'var(--athlon-text-secondary)' }}
                  >
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </section>

          {/* Search & Filter Bar */}
          <section className="pt-1">
            <HomeSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              availablePlaces={availablePlaces}
              totalResults={totalResults}
              onResetFilters={handleResetFilters}
            />
          </section>

          {/* If filtering and no matches */}
          {isFiltering && totalResults === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-border bg-card space-y-3 my-2">
              <Compass className="w-10 h-10 text-primary/40 mx-auto" />
              <h3 className="text-base font-black text-foreground">No Matches Found</h3>
              <p className="text-xs text-foreground/50 max-w-xs mx-auto">
                No venues, academies, coaches, or tournaments match your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-black shadow-md hover:scale-105 transition-all"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                  color: 'var(--athlon-primary-foreground)',
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* ── MOBILE SECTION 1: LIVE PLAYER AUCTIONS ── */}
              {liveAuctionChampionships.length > 0 && (
                <section className="pt-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Live Player Auctions ({liveAuctionChampionships.length})
                      </h2>
                    </div>
                    <span className="text-[10px] font-black uppercase text-red-400">
                      🔴 Live Bids
                    </span>
                  </div>

                  <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
                    {liveAuctionChampionships.map((champ) => (
                      <div
                        key={champ.championshipUuid}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] max-w-[380px] rounded-2xl border p-5 shadow-lg space-y-3.5 overflow-hidden relative flex flex-col justify-between"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />

                        <div className="flex items-center justify-between pt-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            LIVE AUCTION
                          </span>
                          <span className="text-[10px] text-foreground/50 font-bold uppercase truncate max-w-[140px]">
                            {champ.sport || 'Badminton'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                            {champ.name}
                          </h3>
                          <p className="text-xs text-foreground/60 line-clamp-1">
                            {champ.location || champ.venue || 'Arena'} • Live Franchise Draft Floor
                          </p>
                        </div>

                        <div
                          className="p-3 rounded-xl border flex items-center justify-between text-xs"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                        >
                          <span className="text-foreground/60 font-semibold">Franchises:</span>
                          <span className="font-mono font-black text-primary">{champ.registeredTeamsCount || champ.maxTeams || 0} Teams</span>
                        </div>

                        <Link
                          href={`/home/team-championship/${champ.championshipUuid}/auction`}
                          className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Gavel className="w-4 h-4" />
                          <span>ENTER AUCTION ARENA</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── MOBILE SECTION 2: LIVE MATCH ARENA ── */}
              {filteredLiveScores.length > 0 && (
                <section className="pt-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Live Match Arena ({filteredLiveScores.length})
                      </h2>
                    </div>
                    <Link href="/live-score" className="text-xs font-bold text-red-400 hover:underline flex items-center gap-0.5">
                      Live Scores <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
                    {filteredLiveScores.map((score) => {
                      const mMeta = score.scoreMeta || {};
                      const cfg = mMeta.config || {};
                      const mTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                      const mTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                      const mGi = mMeta.currentGameIndex || 0;
                      const mGames = mMeta.games || [];
                      const mCur = mGames[mGi] || {};
                      const mScoreA = mCur.scoreA ?? (score.teamAScore || 0);
                      const mScoreB = mCur.scoreB ?? (score.teamBScore || 0);
                      const mTourn = cfg.tournamentName || 'Tournament Match';
                      const mCat = cfg.category || 'Match';

                      return (
                        <div
                          key={score.scoreId || score.matchUuid}
                          className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] max-w-[380px] rounded-2xl border p-5 shadow-lg space-y-3.5 overflow-hidden relative flex flex-col justify-between"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        >
                          <SportCardSkeletonBackground sport={cfg.sport || cfg.category || (score as any).sport || 'Badminton'} />
                          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse z-10" />

                          <div className="flex items-center justify-between pt-1 relative z-10">
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              Live Game {mGi + 1}
                            </span>
                            <span className="text-[10px] text-foreground/50 font-bold uppercase truncate max-w-[140px]">
                              {cfg.courtName || 'Court Arena'}
                            </span>
                          </div>

                          <div className="space-y-1 relative z-10">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-wider truncate">
                              {mTourn} • {mCat}
                            </h3>
                          </div>

                          <div
                            className="p-3.5 rounded-xl border space-y-2.5 relative z-10"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[11px] text-primary shrink-0">
                                  {mTeamAName.charAt(0)}
                                </div>
                                <span className="text-xs font-black text-foreground truncate">{mTeamAName}</span>
                              </div>
                              <span className="text-base font-black font-mono tabular-nums ml-2 text-primary">{mScoreA}</span>
                            </div>

                            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[11px] text-foreground/70 shrink-0">
                                  {mTeamBName.charAt(0)}
                                </div>
                                <span className="text-xs font-black text-foreground truncate">{mTeamBName}</span>
                              </div>
                              <span className="text-base font-black font-mono tabular-nums ml-2 text-foreground">{mScoreB}</span>
                            </div>
                          </div>

                          <Link
                            href={`/live-score/${score.matchUuid}`}
                            className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all relative z-10"
                          >
                            <Tv className="w-4 h-4" />
                            <span>WATCH LIVE SCORESHEET</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── MOBILE SECTION: WEEKLY COMMUNITY SESSIONS ── */}
              {filteredSessions.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <span>Community Sessions</span>
                        <span className="text-[10.5px] font-mono text-primary font-extrabold bg-primary/10 px-2 py-0.2 rounded-full">
                          ({filteredSessions.length})
                        </span>
                      </h2>
                    </div>
                    <Link href="/login?redirect=/home" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      Explore<ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div
                    ref={mobileSessionsRef}
                    className="flex items-stretch gap-4 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4"
                  >
                    {filteredSessions.map((session) => (
                      <div
                        key={session.sessionUuid}
                        className="snap-start shrink-0 w-[calc(100vw-3.2rem)] sm:w-[320px] max-w-[360px] flex"
                      >
                        <CommunitySessionCard
                          session={session}
                          isLoggedIn={false}
                          className="w-full h-full shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── MOBILE SECTION 3: FEATURED SPORTS VENUES & TURFS ── */}
              {filteredVenues.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <span>Book Courts &amp; Turfs</span>
                        <span className="text-[10.5px] font-mono text-primary font-extrabold bg-primary/10 px-2 py-0.2 rounded-full">
                          ({filteredVenues.length})
                        </span>
                      </h2>
                    </div>
                    <Link href="/venues" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      Explore<ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div
                    ref={mobileVenuesRef}
                    className="flex items-stretch gap-4 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4"
                  >
                    {filteredVenues.map((venue: any) => (
                      <div
                        key={venue.venueUuid || venue.venueId || venue.id}
                        className="snap-start shrink-0 w-[calc(100vw-3.2rem)] sm:w-[320px] max-w-[360px] flex"
                      >
                        <VenueMarketplaceCard venue={venue} className="h-full shadow-md" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── MOBILE SECTION 4: FEATURED SPORTS ACADEMIES & TRAINING CENTERS ── */}
              {filteredAcademies.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <span>Training Academies</span>
                        <span className="text-[10.5px] font-mono text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.2 rounded-full">
                          ({filteredAcademies.length})
                        </span>
                      </h2>
                    </div>
                    <Link href="/academies" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      Explore<ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div
                    ref={mobileAcademiesRef}
                    className="flex items-stretch gap-4 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4"
                  >
                    {filteredAcademies.map((academy: any) => (
                      <div
                        key={academy.uuid || academy.id}
                        className="snap-start shrink-0 w-[calc(100vw-3.2rem)] sm:w-[320px] max-w-[360px] flex"
                      >
                        <AcademyMarketplaceCard academy={academy} className="h-full shadow-md" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── MOBILE SECTION 5: PROFESSIONAL COACHES & MENTORS ── */}
              {filteredCoaches.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <span>Professional Coaches</span>
                        <span className="text-[10.5px] font-mono text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.2 rounded-full">
                          ({filteredCoaches.length})
                        </span>
                      </h2>
                    </div>
                    <Link href="/coaches" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      Explore<ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div
                    ref={mobileCoachesRef}
                    className="flex items-stretch gap-4 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4"
                  >
                    {filteredCoaches.map((coach: any) => (
                      <div
                        key={coach.uuid || coach.id}
                        className="snap-start shrink-0 w-[calc(100vw-3.2rem)] sm:w-[320px] max-w-[360px] flex"
                      >
                        <CoachMarketplaceCard coach={coach} className="h-full shadow-md" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Team Championships Carousel */}
              {filteredChampionships.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Team Championships ({filteredChampionships.length})
                      </h2>
                    </div>
                    <Link href="/tournaments" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-4 px-4">
                    {filteredChampionships.map((championship) => (
                      <div
                        key={championship.championshipId || championship.championshipUuid}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <PublicTeamChampionshipCard championship={championship} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tournaments Carousel */}
              {filteredTournaments.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Tournaments ({filteredTournaments.length})
                      </h2>
                    </div>
                    <Link href="/tournaments" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-4 px-4">
                    {filteredTournaments.map((tournament) => (
                      <div
                        key={tournament.tournamentId || tournament.tournamentUuid}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <PublicTournamentCard tournament={tournament} hrefPrefix="/tournaments" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── MOBILE SECTION: RECENT MATCH RESULTS ── */}
              {filteredFinishedScores.length > 0 && (
                <section className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <span>Recent Match Results</span>
                        <span className="text-[10.5px] font-mono text-primary font-extrabold bg-primary/10 border border-primary/20 px-2 py-0.2 rounded-full">
                          ({filteredFinishedScores.length})
                        </span>
                      </h2>
                    </div>
                    <Link href="/live-score" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                      View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
                    {filteredFinishedScores.map((score, idx) => {
                      const sMeta = score.scoreMeta || {};
                      const cfg = sMeta.config || {};
                      const sTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                      const sTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                      const sGames = sMeta.games || [];
                      const gamesWonA = sGames.filter((g: any) => g.winner === 'A').length;
                      const gamesWonB = sGames.filter((g: any) => g.winner === 'B').length;
                      const isWinnerA = gamesWonA > gamesWonB;
                      const isWinnerB = gamesWonB > gamesWonA;
                      const sCategory = cfg.category || '';
                      const sTournament = cfg.tournamentName || 'Tournament Match';
                      const sSport = cfg.sport || cfg.category || (score as any).sport || 'Badminton';

                      return (
                        <Link
                          key={score.scoreId || idx}
                          href={`/live-score/${score.matchUuid}`}
                          className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] max-w-[360px] rounded-2xl border p-4 shadow-md space-y-3 overflow-hidden relative flex flex-col justify-between transition-all hover:border-primary/50"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                        >
                          <SportCardSkeletonBackground sport={sSport} />
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_var(--athlon-primary)] z-10" />

                          <div className="flex items-center justify-between pt-1 relative z-10">
                            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> COMPLETED
                            </span>
                            <span className="text-[10px] text-foreground/50 font-medium truncate max-w-[150px]">
                              {sTournament} • {sCategory}
                            </span>
                          </div>

                          <div
                            className="p-3 rounded-xl border space-y-2 relative z-10"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[11px] text-primary shrink-0">
                                  {sTeamAName.charAt(0)}
                                </div>
                                <span className={`text-xs truncate ${isWinnerA ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                                  {sTeamAName}
                                </span>
                                {isWinnerA && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                              </div>
                              <span className={`text-sm font-black font-mono tabular-nums ml-2 ${isWinnerA ? 'text-primary' : 'text-foreground/60'}`}>
                                {gamesWonA}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border)' }}>
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[11px] text-foreground/70 shrink-0">
                                  {sTeamBName.charAt(0)}
                                </div>
                                <span className={`text-xs truncate ${isWinnerB ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                                  {sTeamBName}
                                </span>
                                {isWinnerB && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                              </div>
                              <span className={`text-sm font-black font-mono tabular-nums ml-2 ${isWinnerB ? 'text-primary' : 'text-foreground/60'}`}>
                                {gamesWonB}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px] text-foreground/60 font-semibold relative z-10">
                            <span>View Full Scorecard</span>
                            <ChevronRight className="w-3.5 h-3.5 text-primary" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <nav
          className="fixed bottom-0 inset-x-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto fixed-bottom-nav"
          style={{
            backgroundColor: 'var(--athlon-navigation)',
            borderColor: 'var(--athlon-border)',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group">
            <Athlon3DIcon type="home" size={32} active={true} />
            <span className="text-[9.5px] font-extrabold leading-tight text-primary">
              Home
            </span>
          </Link>

          <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="tournaments" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Events
            </span>
          </Link>

          {/* Center Floating Action Button (3D Umpire Action) */}
          <div className="relative -top-4 flex flex-col items-center">
            <Link
              href="/practice"
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl umpire-center-orb"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                borderColor: 'var(--athlon-navigation)',
                boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

              <img
                src="/umpire.png"
                alt="Umpire"
                className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
              />
            </Link>
          </div>

          <Link href="/venues" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="facilities" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Venues
            </span>
          </Link>

          {isAuthenticated ? (
            <Link href="/home" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
              <Athlon3DIcon type="profile" size={32} active={false} />
              <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
                Profile
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Athlon3DIcon type="profile" size={32} active={false} />
              <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
                Profile
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Top Navbar */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                  boxShadow: '0 0 20px var(--athlon-primary-soft)',
                }}
              >
                <Trophy className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">
                  ATHLON
                </span>
                <span
                  className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-primary)' }}
                >
                  Sports Platform
                </span>
              </div>
            </Link>

            {/* Center Navigation Links */}
            <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                  color: 'var(--athlon-primary-foreground)',
                }}
              >
                <Home className="w-4 h-4" style={{ color: 'var(--athlon-primary-foreground)' }} />
                <span>Home</span>
              </Link>

              <Link
                href="/venues"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-primary" />
                <span>Venues &amp; Turfs</span>
              </Link>

              <Link
                href="/academies"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Academies</span>
              </Link>

              <Link
                href="/tournaments"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Tournaments</span>
              </Link>

              <Link
                href="/live-score"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Tv className="w-4 h-4 text-blue-400" />
                <span>Live Arena</span>
                {liveScores.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </Link>
            </nav>

            {/* Right Action CTAs */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: 'var(--athlon-primary-foreground)',
                    boxShadow: '0 4px 20px var(--athlon-primary-glow)',
                  }}
                >
                  <span>Go to App</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-sm font-bold px-4 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all cursor-pointer"
                  >
                    Log In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                    style={{
                      backgroundColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary-foreground)',
                      boxShadow: '0 4px 20px var(--athlon-primary-glow)',
                    }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 1. Full-Width Hero Section ── */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-12 gap-10 items-center">
            <div className="col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Sports Marketplace &amp; Tournament Platform</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight uppercase text-foreground">
                Compete Today. <br />
                <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                  Champion Tomorrow.
                </span>
              </h1>

              <p className="text-base lg:text-lg text-foreground/75 leading-relaxed max-w-xl">
                Book hourly courts &amp; floodlit turfs, find certified sports academies &amp; coaches, and compete in tournaments with live digital scoresheets.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/venues"
                  className="flex items-center gap-2 text-sm font-black px-7 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: 'var(--athlon-primary-foreground)',
                    boxShadow: '0 8px 30px var(--athlon-primary-glow)',
                  }}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Book Court / Turf</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/tournaments"
                  className="flex items-center gap-2 border text-foreground text-sm font-bold px-6 py-4 rounded-2xl hover:bg-foreground/5 active:scale-95 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Browse Tournaments</span>
                </Link>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-foreground/10 max-w-lg">
                <div>
                  <div className="text-2xl font-black font-mono text-primary">INSTANT</div>
                  <div className="text-[11px] text-foreground/50 font-bold uppercase mt-0.5">Court Slot Booking</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-emerald-400">ACADEMIES</div>
                  <div className="text-[11px] text-foreground/50 font-bold uppercase mt-0.5">Verified Centers</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-amber-400">LIVE</div>
                  <div className="text-[11px] text-foreground/50 font-bold uppercase mt-0.5">Referees &amp; Draws</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns */}
            <div className="col-span-5 space-y-4">
              <div
                className="rounded-[32px] border p-8 shadow-2xl backdrop-blur-2xl space-y-5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Sports Marketplace Discovery</span>
                </div>
                <h3 className="text-2xl font-black text-foreground leading-snug">
                  Hourly Venues, Certified Academies &amp; Mentors
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Discover floodlit turf grounds, air-conditioned wooden badminton courts, student batch admissions, and certified master coaches across your city.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/venues"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                  >
                    <span>Explore Venues</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <span className="text-foreground/30">•</span>
                  <Link
                    href="/academies"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 hover:underline"
                  >
                    <span>Explore Academies</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Unified Search & Filter Console ── */}
        <div className="border-b bg-card/60 backdrop-blur-md sticky top-20 z-40" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <HomeSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              availablePlaces={availablePlaces}
              totalResults={totalResults}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>

        {/* Desktop Main Content Container */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-12">
          {/* If filtering and no matches */}
          {isFiltering && totalResults === 0 ? (
            <div className="p-16 text-center rounded-3xl border border-border bg-card space-y-4 shadow-sm my-6">
              <Compass className="w-12 h-12 text-primary/40 mx-auto" />
              <h3 className="text-lg font-black text-foreground">No Matches Found</h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto">
                We couldn&apos;t find any venues, academies, coaches, or tournaments matching your current sports or location filter.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-2xl bg-primary text-black text-xs font-black shadow-lg shadow-primary/25 hover:scale-105 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* ── DESKTOP SECTION 0: 🔴 LIVE PLAYER AUCTIONS (HORIZONTAL SCROLL) ── */}
              {liveAuctionChampionships.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <div>
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                          <span>Live Player Auction Arenas</span>
                          <span className="text-xs font-bold text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            ({liveAuctionChampionships.length})
                          </span>
                        </h2>
                        <p className="text-xs text-foreground/50 font-medium">
                          Real-time live franchise bidding floors and draft arenas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider mr-2">
                        🔴 Broadcasting Live
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => scrollContainer(desktopAuctionsRef, 'left')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollContainer(desktopAuctionsRef, 'right')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={desktopAuctionsRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar"
                  >
                    {liveAuctionChampionships.map((champ) => (
                      <div key={champ.championshipUuid} className="snap-start shrink-0 w-[380px]">
                        <div
                          className="h-full rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:shadow-xl group space-y-4 flex flex-col justify-between"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'rgba(239, 68, 68, 0.4)',
                          }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />

                          <div className="flex items-center justify-between text-xs pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              Live Floor
                            </span>
                            <span className="text-xs font-bold text-foreground/50 truncate max-w-[180px]">
                              {champ.sport || 'Championship'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                              {champ.name}
                            </h3>
                            <p className="text-xs text-foreground/60 line-clamp-1">
                              {champ.location || champ.venue || 'Arena'} • Live Franchise Bidding &amp; Player Draft
                            </p>
                          </div>

                          <div
                            className="p-3.5 rounded-xl border flex items-center justify-between text-xs"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                          >
                            <span className="text-foreground/60 font-semibold">Franchises Competing:</span>
                            <span className="font-mono font-black text-primary">{champ.registeredTeamsCount || champ.maxTeams || 0} Teams</span>
                          </div>

                          <Link
                            href={`/home/team-championship/${champ.championshipUuid}/auction`}
                            className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                          >
                            <Gavel className="w-4 h-4" />
                            <span>ENTER AUCTION ARENA</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── DESKTOP SECTION 1: 🔴 LIVE MATCH ARENA (HORIZONTAL SCROLL) ── */}
              {filteredLiveScores.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <div>
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                          <span>Live Match Arena</span>
                          <span className="text-xs font-bold text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            ({filteredLiveScores.length})
                          </span>
                        </h2>
                        <p className="text-xs text-foreground/50 font-medium">
                          Real-time court scoreboards and point-by-point live match sheets
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/live-score"
                        className="text-xs font-bold text-red-500 hover:underline uppercase tracking-wider flex items-center gap-1"
                      >
                        Live Arena Dashboard <ChevronRight className="w-4 h-4" />
                      </Link>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => scrollContainer(desktopLiveScoresRef, 'left')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollContainer(desktopLiveScoresRef, 'right')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={desktopLiveScoresRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar"
                  >
                    {filteredLiveScores.map((score) => {
                      const mMeta = score.scoreMeta || {};
                      const cfg = mMeta.config || {};
                      const mTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                      const mTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                      const mGi = mMeta.currentGameIndex || 0;
                      const mGames = mMeta.games || [];
                      const mCur = mGames[mGi] || {};
                      const mScoreA = mCur.scoreA ?? (score.teamAScore || 0);
                      const mScoreB = mCur.scoreB ?? (score.teamBScore || 0);
                      const mTourn = cfg.tournamentName || 'Tournament Match';
                      const mCat = cfg.category || 'Match';

                      return (
                        <div
                          key={score.scoreId || score.matchUuid}
                          className="snap-start shrink-0 w-[380px] rounded-2xl border p-5 shadow-lg space-y-4 overflow-hidden relative flex flex-col justify-between"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                        >
                          <SportCardSkeletonBackground sport={cfg.sport || cfg.category || (score as any).sport || 'Badminton'} />
                          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse z-10" />

                          <div className="flex items-center justify-between pt-1 relative z-10">
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              Live Game {mGi + 1}
                            </span>
                            <span className="text-xs text-foreground/50 font-medium truncate max-w-[180px]">
                              {cfg.courtName || 'Court Arena'}
                            </span>
                          </div>

                          <div className="space-y-1 relative z-10">
                            <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                              {mTourn}
                            </h3>
                            <p className="text-xs text-foreground/60 line-clamp-1">
                              {mCat} • Real-time umpire scoresheet
                            </p>
                          </div>

                          <div
                            className="p-3.5 rounded-xl border space-y-2.5 relative z-10"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                  {mTeamAName.charAt(0)}
                                </div>
                                <span className="text-xs font-black text-foreground truncate">{mTeamAName}</span>
                              </div>
                              <span className="text-lg font-black font-mono tabular-nums ml-2 text-primary">{mScoreA}</span>
                            </div>

                            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                                  {mTeamBName.charAt(0)}
                                </div>
                                <span className="text-xs font-black text-foreground truncate">{mTeamBName}</span>
                              </div>
                              <span className="text-lg font-black font-mono tabular-nums ml-2 text-foreground">{mScoreB}</span>
                            </div>
                          </div>

                          <Link
                            href={`/live-score/${score.matchUuid}`}
                            className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all relative z-10"
                          >
                            <Tv className="w-4 h-4" />
                            <span>WATCH LIVE SCORESHEET</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── DESKTOP SECTION: WEEKLY COMMUNITY SESSIONS ── */}
              {filteredSessions.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                          <span>Weekly &quot;Let&apos;s Play&quot; Community Sessions</span>
                          <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            ({filteredSessions.length})
                          </span>
                        </h2>
                        <p className="text-xs text-foreground/50 font-medium">
                          Casual games, open rosters, and weekly friendly matches hosted by local sports communities
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/login?redirect=/home"
                        className="text-xs font-extrabold text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                      >
                        <span>Join Communities</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => scrollContainer(desktopSessionsRef, 'left')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollContainer(desktopSessionsRef, 'right')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Rail */}
                  <div
                    ref={desktopSessionsRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar"
                  >
                    {filteredSessions.map((session) => (
                      <div
                        key={session.sessionUuid}
                        className="snap-start shrink-0 w-[340px] lg:w-[360px] flex"
                      >
                        <CommunitySessionCard
                          session={session}
                          isLoggedIn={false}
                          className="w-full h-full shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── DESKTOP SECTION 2: FEATURED SPORTS VENUES & TURFS ── */}
              {filteredVenues.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                          <span>Featured Sports Venues &amp; Turfs</span>
                          <span className="text-xs font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            ({filteredVenues.length})
                          </span>
                        </h2>
                        <p className="text-xs text-foreground/50 font-medium">
                          Instant hourly court bookings, floodlit turfs, and multi-sport arenas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/venues"
                        className="text-xs font-extrabold text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                      >
                        <span>Explore All Venues</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => scrollContainer(desktopVenuesRef, 'left')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollContainer(desktopVenuesRef, 'right')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Rail */}
                  <div
                    ref={desktopVenuesRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar"
                  >
                    {filteredVenues.map((venue: any) => (
                      <div
                        key={venue.venueUuid || venue.venueId || venue.id}
                        className="snap-start shrink-0 w-[340px] lg:w-[360px] flex"
                      >
                        <VenueMarketplaceCard venue={venue} className="h-full shadow-md" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── DESKTOP SECTION 3: FEATURED SPORTS ACADEMIES & TRAINING CENTERS ── */}
              {filteredAcademies.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                          <span>Featured Sports Academies &amp; Training Centers</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            ({filteredAcademies.length})
                          </span>
                        </h2>
                        <p className="text-xs text-foreground/50 font-medium">
                          Professional student batches, seasonal camps, and academy admissions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/academies"
                        className="text-xs font-extrabold text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                      >
                        <span>Explore All Academies</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => scrollContainer(desktopAcademiesRef, 'left')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollContainer(desktopAcademiesRef, 'right')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Rail */}
                  <div
                    ref={desktopAcademiesRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar"
                  >
                    {filteredAcademies.map((academy: any) => (
                      <div
                        key={academy.uuid || academy.id}
                        className="snap-start shrink-0 w-[340px] lg:w-[360px] flex"
                      >
                        <AcademyMarketplaceCard academy={academy} className="h-full shadow-md" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── DESKTOP SECTION 4: PROFESSIONAL COACHES & MENTORS ── */}
              {filteredCoaches.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                          <span>Professional Coaches &amp; Mentors</span>
                          <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            ({filteredCoaches.length})
                          </span>
                        </h2>
                        <p className="text-xs text-foreground/50 font-medium">
                          Personal 1-on-1 coaching, elite performance training &amp; skill assessments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/coaches"
                        className="text-xs font-extrabold text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                      >
                        <span>Explore All Coaches</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => scrollContainer(desktopCoachesRef, 'left')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => scrollContainer(desktopCoachesRef, 'right')}
                          className="w-8 h-8 rounded-full border border-border bg-card hover:bg-surface flex items-center justify-center text-foreground/70 hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Scroll Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Rail */}
                  <div
                    ref={desktopCoachesRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar"
                  >
                    {filteredCoaches.map((coach: any) => (
                      <div
                        key={coach.uuid || coach.id}
                        className="snap-start shrink-0 w-[340px] lg:w-[360px] flex"
                      >
                        <CoachMarketplaceCard coach={coach} className="h-full shadow-md" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 5: TEAM CHAMPIONSHIPS SHOWCASE ── */}
              {filteredChampionships.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-foreground">
                        Team Championships ({filteredChampionships.length})
                      </h2>
                    </div>
                    <Link
                      href="/tournaments"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                    {filteredChampionships.map((championship) => (
                      <div
                        key={championship.championshipId || championship.championshipUuid}
                        className="snap-start shrink-0 w-[360px] lg:w-[380px]"
                      >
                        <PublicTeamChampionshipCard championship={championship} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 6: PUBLIC TOURNAMENTS SHOWCASE ── */}
              {filteredTournaments.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-foreground">
                        Tournaments &amp; Individual Draws ({filteredTournaments.length})
                      </h2>
                    </div>
                    <Link
                      href="/tournaments"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                    {filteredTournaments.map((tournament) => (
                      <div
                        key={tournament.tournamentId || tournament.tournamentUuid}
                        className="snap-start shrink-0 w-[360px] lg:w-[380px]"
                      >
                        <PublicTournamentCard tournament={tournament} hrefPrefix="/tournaments" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── SECTION 7: RECENT COMPLETED MATCHES ── */}
              {filteredFinishedScores.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-foreground">Recent Match Results</h2>
                    </div>
                    <Link
                      href="/live-score"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View All Live Arena <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                    {filteredFinishedScores.map((score, idx) => {
                      const sMeta = score.scoreMeta || {};
                      const cfg = sMeta.config || {};
                      const sTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                      const sTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                      const sGames = sMeta.games || [];
                      const gamesWonA = sGames.filter((g: any) => g.winner === 'A').length;
                      const gamesWonB = sGames.filter((g: any) => g.winner === 'B').length;
                      const isWinnerA = gamesWonA > gamesWonB;
                      const isWinnerB = gamesWonB > gamesWonA;
                      const sCategory = cfg.category || '';
                      const sTournament = cfg.tournamentName || 'Tournament Match';
                      const sSport = cfg.sport || cfg.category || (score as any).sport || 'Badminton';

                      return (
                        <Link
                          key={score.scoreId || idx}
                          href={`/live-score/${score.matchUuid}`}
                          className="snap-start shrink-0 w-[380px] group rounded-2xl border p-5 shadow-md space-y-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 relative flex flex-col justify-between"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                        >
                          <SportCardSkeletonBackground sport={sSport} />
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_var(--athlon-primary)] z-10" />

                          <div className="flex items-center justify-between pt-1 relative z-10">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> COMPLETED
                            </span>
                            <span className="text-xs text-foreground/50 font-medium truncate max-w-[180px]">
                              {sTournament} • {sCategory}
                            </span>
                          </div>

                          <div
                            className="p-3.5 rounded-xl border space-y-2.5 relative z-10"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                  {sTeamAName.charAt(0)}
                                </div>
                                <span className={`text-xs truncate ${isWinnerA ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                                  {sTeamAName}
                                </span>
                                {isWinnerA && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                              </div>
                              <span className={`text-sm font-black font-mono tabular-nums ml-2 ${isWinnerA ? 'text-primary' : 'text-foreground/60'}`}>
                                {gamesWonA}
                              </span>
                            </div>

                            <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border)' }}>
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                                  {sTeamBName.charAt(0)}
                                </div>
                                <span className={`text-xs truncate ${isWinnerB ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                                  {sTeamBName}
                                </span>
                                {isWinnerB && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                              </div>
                              <span className={`text-sm font-black font-mono tabular-nums ml-2 ${isWinnerB ? 'text-primary' : 'text-foreground/60'}`}>
                                {gamesWonB}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t pt-2 text-xs text-foreground/60 relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                            <span>View Full Scorecard</span>
                            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Desktop Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON SPORTS</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/venues" className="hover:text-primary transition-colors">Venues &amp; Turfs</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/coaches" className="hover:text-primary transition-colors">Coaches</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/live-score" className="hover:text-primary transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>The tournament &amp; sports booking experience, elevated.</p>
            </div>
          </div>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />

      {/* ── High-Polish Auth Modal for Non-Logged-In Users & Quick Access ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}
