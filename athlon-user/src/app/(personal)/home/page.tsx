'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Activity,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Calendar,
  CalendarDays,
  TicketCheck,
  ShieldCheck,
  Building,
  Building2,
  Users,
  Plus,
  Flame,
  ClipboardList,
  Clock,
  Zap,
  User,
  Settings,
  BarChart3,
  Swords,
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Shield,
  AlertCircle,
  Radio,
  Play,
  Share2,
  Sparkles,
  Gavel,
  Award,
  UserCheck,
  Search,
  Filter,
  Vote,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore, Organization } from '@/lib/store/useWorkspaceStore';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';
import { AcademyMarketplaceCard } from '@/components/marketplace/AcademyMarketplaceCard';
import { CoachMarketplaceCard } from '@/components/marketplace/CoachMarketplaceCard';
import { VenueMarketplaceCard } from '@/components/marketplace/VenueMarketplaceCard';
import { CommunitySessionCard } from '@/components/community/CommunitySessionCard';
import { CommunityPollCard } from '@/components/community/CommunityPollCard';
import { SportCardSkeletonBackground } from '@/components/common/SportCardSkeletonBackground';
import { CommunityService, SessionResponse, CommunityPoll, CommunityResponse } from '@/lib/api/community';
import { venueApi, facilityApi, VenueDto } from '@/lib/api/venue';
import { ScoreService, LiveScore, isTournamentScore } from '@/lib/api/scores';
import { MatchService, Match } from '@/lib/api/matches';
import { OrganizationService } from '@/lib/api/organization';
import { AuthService } from '@/lib/api/auth';
import { UserService, SportsProfileResponse } from '@/lib/api/user';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';

import HomeRoleHeader from '@/components/home/HomeRoleHeader';
import { AppModeSwitcher } from '@/components/navigation/AppModeSwitcher';
import HomeSearchFilterBar from '@/components/home/HomeSearchFilterBar';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import {
  matchSport,
  matchPlace,
  matchVenueSport,
  matchAcademySport,
  matchCoachSport,
  matchSearchQuery,
  extractAvailablePlaces,
} from '@/lib/utils/homeFilter';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const quickActions: { id: string; label: string; icon: any; icon3d: 'tournaments' | 'academies' | 'rankings' | 'matches' | 'registered' | 'facilities' | 'bookings'; desc: string }[] = [
  { id: '/home/tournaments', label: 'Tournaments', icon: Trophy, icon3d: 'tournaments', desc: 'Events & Brackets' },
  { id: '/venues', label: 'Bookings', icon: TicketCheck, icon3d: 'bookings', desc: 'Venues, Turfs & Academies' },
  { id: '/home/matches', label: 'Matches', icon: Activity, icon3d: 'matches', desc: 'Schedule & Scores' },
  { id: '/home/registered', label: 'Registered', icon: ClipboardList, icon3d: 'registered', desc: 'My Entries' },
];

function orgIcon(type: string, cls = 'w-7 h-7') {
  if (type === 'ACADEMY') return <GraduationCap className={cls} strokeWidth={1.5} />;
  if (type === 'CLUB') return <Users className={cls} strokeWidth={1.5} />;
  if (type === 'COMMUNITY') return <Users className={cls} strokeWidth={1.5} />;
  if (type === 'ASSOCIATION') return <Trophy className={cls} strokeWidth={1.5} />;
  if (type === 'COACH') return <UserCheck className={cls} strokeWidth={1.5} />;
  if (type === 'COURT' || type === 'VENUE_MANAGER') return <MapPin className={cls} strokeWidth={1.5} />;
  return <ShieldCheck className={cls} strokeWidth={1.5} />;
}

/* ─── component ───────────────────────────────────────────────────────────── */

export default function PersonalHomePage() {
  const router = useRouter();
  const { userEmail, userId, userUuid, token, isAuthenticated } = useAuthStore();
  const { personalProfile, organizations, setActiveWorkspace, setOrganizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/');
    }
  }, [mounted, isAuthenticated, router]);

  const [activeRole, setActiveRole] = useState<'PLAYER' | string>('PLAYER');

  const [publicTournaments, setPublicTournaments] = useState<Tournament[]>([]);
  const [publicChampionships, setPublicChampionships] = useState<TeamChampionship[]>([]);
  const [publicAcademies, setPublicAcademies] = useState<any[]>([]);
  const [publicCoaches, setPublicCoaches] = useState<any[]>([]);
  const [publicVenues, setPublicVenues] = useState<any[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [myCommunities, setMyCommunities] = useState<CommunityResponse[]>([]);
  const [memberPolls, setMemberPolls] = useState<{ poll: CommunityPoll; communityName: string }[]>([]);
  const [loadingMemberPolls, setLoadingMemberPolls] = useState<boolean>(false);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [finishedScores, setFinishedScores] = useState<LiveScore[]>([]);
  const [userMatches, setUserMatches] = useState<any[]>([]);
  const [rawUserMatches, setRawUserMatches] = useState<Match[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<SportsProfileResponse | null>(null);

  // Refs for horizontal scroll controls
  const auctionsScrollRef = useRef<HTMLDivElement>(null);
  const liveScrollRef = useRef<HTMLDivElement>(null);
  const champsScrollRef = useRef<HTMLDivElement>(null);
  const tournsScrollRef = useRef<HTMLDivElement>(null);
  const sessionsScrollRef = useRef<HTMLDivElement>(null);
  const mobileSessionsScrollRef = useRef<HTMLDivElement>(null);
  const pollsScrollRef = useRef<HTMLDivElement>(null);
  const mobilePollsScrollRef = useRef<HTMLDivElement>(null);
  const venuesScrollRef = useRef<HTMLDivElement>(null);
  const academiesScrollRef = useRef<HTMLDivElement>(null);
  const coachesScrollRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const schedScrollRef = useRef<HTMLDivElement>(null);
  const lineupsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  /* ── data fetching ── */
  useEffect(() => {
    TournamentService.getAll()
      .then((res) => setPublicTournaments(res.data.filter((t: Tournament) => t.visibility === 'PUBLIC')))
      .catch(() => { });

    // Public Academies, Coaches & Venues with event-driven real-time sync
    const loadPublicTrainingOrgs = async () => {
      try {
        const orgRes = await OrganizationService.getAll().catch(() => ({ data: [] }));
        const list = Array.isArray(orgRes) ? orgRes : orgRes?.data || [];
        const rawAcademies = list.filter((o: any) => o.type === 'ACADEMY');
        const rawCoaches = list.filter((o: any) => o.type === 'COACH');

        // Build set of all non-venue organization IDs, UUIDs, and names (coaches & academies)
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

        // Enrich academies with profile
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
            return {
              ...a,
              profile,
              sportsOffered,
            };
          })
        );
        setPublicAcademies(enrichedAcademies);

        // Enrich coaches with profile
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
            return {
              ...c,
              profile,
              sportsOffered,
            };
          })
        );
        setPublicCoaches(enrichedCoaches);

        // Fetch Venues strictly for slot booking
        const publicRes = await venueApi.getPublicVenues().catch(() => ({ data: [] }));
        let rawVenues: any[] = Array.isArray(publicRes?.data) ? publicRes.data : Array.isArray(publicRes) ? publicRes : [];

        // Also fetch venues for user's active COURT or VENUE_MANAGER organizations
        const currentOrgs = useWorkspaceStore.getState().organizations || [];
        const venueOrgs = currentOrgs.filter((org) => org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER');
        if (venueOrgs.length > 0) {
          const orgVenuesArrays = await Promise.all(
            venueOrgs.map(async (org) => {
              try {
                const res = await venueApi.getVenuesByOrganization(org.id);
                return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
              } catch {
                return [];
              }
            })
          );
          orgVenuesArrays.forEach((ovList) => {
            rawVenues = [...rawVenues, ...ovList];
          });
        }

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
          // Enrich every venue with its facilities and sports
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
      } catch (e) {
        console.error('Failed to load training orgs or venues:', e);
        setPublicVenues([]);
      }
    };

    loadPublicTrainingOrgs();

    // Listen for publish events across tabs/windows
    const handleOrgSync = () => {
      loadPublicTrainingOrgs();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('athlon-org-updated', handleOrgSync);
      window.addEventListener('storage', (e) => {
        if (e.key === 'athlon_org_updated_time') loadPublicTrainingOrgs();
      });
    }

    // Public Championships with auto-polling
    const loadPublicChampionships = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      TeamChampionshipService.getAllPublic()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          setPublicChampionships(list);
        })
        .catch(() => { });
    };

    loadPublicChampionships();
    const champInterval = setInterval(loadPublicChampionships, 15000);

    // Public Community Sessions & Member Polls with auto-polling
    const loadCommunityData = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const [sessRes, myCommsRes] = await Promise.allSettled([
          CommunityService.getAllSessions(),
          userUuid ? CommunityService.getMyCommunities() : Promise.resolve({ data: [] }),
        ]);

        const globalSessions: SessionResponse[] =
          sessRes.status === 'fulfilled'
            ? Array.isArray(sessRes.value)
              ? sessRes.value
              : Array.isArray((sessRes.value as any)?.data)
              ? (sessRes.value as any).data
              : []
            : [];

        const myComms: CommunityResponse[] =
          myCommsRes.status === 'fulfilled'
            ? Array.isArray(myCommsRes.value)
              ? myCommsRes.value
              : Array.isArray((myCommsRes.value as any)?.data)
              ? (myCommsRes.value as any).data
              : []
            : [];

        setMyCommunities(myComms);

        // Build unique map of communities the user is associated with
        const myCommsMap = new Map<string, { communityUuid: string; name: string }>();
        myComms.forEach((c) => {
          if (c.communityUuid) {
            myCommsMap.set(c.communityUuid, { communityUuid: c.communityUuid, name: c.name });
          }
        });
        const currentOrgs = useWorkspaceStore.getState().organizations || [];
        currentOrgs.forEach((o) => {
          if (o.type === 'COMMUNITY' && o.id) {
            myCommsMap.set(o.id, { communityUuid: o.id, name: o.name });
          }
        });

        // Merge sessions from global feed and user's community workspaces
        const sessionMap = new Map<string, SessionResponse>();
        globalSessions.forEach((s) => {
          if (s.sessionUuid) sessionMap.set(s.sessionUuid, s);
        });

        const activeComms = Array.from(myCommsMap.values());
        if (activeComms.length > 0) {
          setLoadingMemberPolls(true);
          const pollsAccumulator: { poll: CommunityPoll; communityName: string }[] = [];
          await Promise.allSettled(
            activeComms.map(async (comm) => {
              try {
                const [cSessRes, pollRes] = await Promise.allSettled([
                  CommunityService.getSessions(comm.communityUuid),
                  CommunityService.getPolls(comm.communityUuid),
                ]);
                if (cSessRes.status === 'fulfilled') {
                  const cList: SessionResponse[] = Array.isArray(cSessRes.value)
                    ? cSessRes.value
                    : Array.isArray((cSessRes.value as any)?.data)
                    ? (cSessRes.value as any).data
                    : [];
                  cList.forEach((s) => {
                    if (s.sessionUuid) {
                      if (!s.communityName) s.communityName = comm.name;
                      sessionMap.set(s.sessionUuid, s);
                    }
                  });
                }
                if (pollRes.status === 'fulfilled') {
                  const pList: CommunityPoll[] = Array.isArray(pollRes.value)
                    ? pollRes.value
                    : Array.isArray((pollRes.value as any)?.data)
                    ? (pollRes.value as any).data
                    : [];
                  pList.forEach((poll) => {
                    if (poll.pollId) {
                      pollsAccumulator.push({ poll, communityName: comm.name });
                    }
                  });
                }
              } catch (e) {
                // ignore
              }
            })
          );

          pollsAccumulator.sort((a, b) => {
            if (a.poll.isClosed !== b.poll.isClosed) return a.poll.isClosed ? 1 : -1;
            return new Date(b.poll.createdAt || 0).getTime() - new Date(a.poll.createdAt || 0).getTime();
          });
          setMemberPolls(pollsAccumulator);
          setLoadingMemberPolls(false);
        } else {
          setMemberPolls([]);
        }

        setSessions(Array.from(sessionMap.values()));
      } catch (err) {
        console.error('Failed to load community data for user:', err);
      }
    };

    loadCommunityData();
    const sessionInterval = setInterval(loadCommunityData, 20000);

    // Fetch real organizations from API and sync to store
    if (userUuid) {
      OrganizationService.getByUserUuid(userUuid)
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            const apiOrgs: Organization[] = res.data.map((o: any) => ({
              id: o.uuid || o.organizationUuid,
              name: o.name,
              type: o.type,
              logo: o.logo,
              role: o.role || 'MEMBER',
            }));
            const currentOrgs = useWorkspaceStore.getState().organizations || [];
            const mergedMap = new Map<string, Organization>();
            currentOrgs.forEach((org) => mergedMap.set(org.id, org));
            apiOrgs.forEach((org) => mergedMap.set(org.id, org));
            setOrganizations(Array.from(mergedMap.values()));
          }
        })
        .catch(() => { });
    }

    return () => {
      clearInterval(champInterval);
      clearInterval(sessionInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('athlon-org-updated', handleOrgSync);
      }
    };
  }, [userUuid]);

  useEffect(() => {
    if (userId) {
      MatchService.getByUser(Number(userId))
        .then((res) => {
          if (res?.data?.length) {
            const sorted = [...res.data].sort((a: Match, b: Match) => {
              const isACompleted = a.status === 'COMPLETED';
              const isBCompleted = b.status === 'COMPLETED';
              if (!isACompleted && isBCompleted) return -1;
              if (isACompleted && !isBCompleted) return 1;
              const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
              const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
              if (isALive && !isBLive) return -1;
              if (!isALive && isBLive) return 1;
              const timeA = a.scheduledTime
                ? new Date(a.scheduledTime).getTime()
                : a.matchDate
                  ? new Date(a.matchDate).getTime()
                  : Infinity;
              const timeB = b.scheduledTime
                ? new Date(b.scheduledTime).getTime()
                : b.matchDate
                  ? new Date(b.matchDate).getTime()
                  : Infinity;
              if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
              return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
            });

            setRawUserMatches(sorted);
            setUserMatches(
              sorted.map((m: Match) => ({
                id: m.uuid || `match-${m.id}`,
                matchUuid: m.uuid,
                tournament: m.tournamentName || 'Tournament Match',
                date: m.scheduledTime
                  ? new Date(m.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                  : m.matchDate || 'Scheduled',
                teamAName: m.teamAName || 'Team A',
                teamBName: m.teamBName || 'Team B',
                court: m.courtName || (m.courtId ? `Court ${m.courtId}` : 'Court TBD'),
                status: m.status || 'Scheduled',
              }))
            );
          }
        })
        .catch(() => { });
    }

    // Fetch Umpiring Assignments
    if (userUuid && token) {
      AuthService.getUserProfile(userUuid, token)
        .then((profileRes) => {
          if (profileRes?.data?.phone) {
            return MatchService.getByUmpirePhone(profileRes.data.phone).catch(() => ({ data: [] }));
          }
          return { data: [] };
        })
        .then((response: any) => {
          if (response?.data && Array.isArray(response.data)) {
            const sortedUmpireMatches = [...response.data].sort((a: Match, b: Match) => {
              const isACompleted = a.status === 'COMPLETED';
              const isBCompleted = b.status === 'COMPLETED';
              if (!isACompleted && isBCompleted) return -1;
              if (isACompleted && !isBCompleted) return 1;
              const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
              const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
              if (isALive && !isBLive) return -1;
              if (!isALive && isBLive) return 1;
              const timeA = a.scheduledTime
                ? new Date(a.scheduledTime).getTime()
                : a.matchDate
                  ? new Date(a.matchDate).getTime()
                  : Infinity;
              const timeB = b.scheduledTime
                ? new Date(b.scheduledTime).getTime()
                : b.matchDate
                  ? new Date(b.matchDate).getTime()
                  : Infinity;
              if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
              return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
            });
            setUmpireMatches(sortedUmpireMatches);
          } else {
            setUmpireMatches([]);
          }
        })
        .catch(() => {
          setUmpireMatches([]);
        });
    }

    // Fetch Player Telemetry Stats
    if (userUuid) {
      UserService.getUserStats(userUuid)
        .then((res) => {
          if (res?.success && res.data) {
            setPlayerStats(res.data);
          }
        })
        .catch(() => { });
    }

    const fetchScores = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      ScoreService.getLive()
        .then((res: any) => {
          if (res?.data) {
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
              const meta = s.scoreMeta || {};
              const games = meta.games || [];
              const wonA = games.filter((g: any) => g.winner === 'A').length;
              const wonB = games.filter((g: any) => g.winner === 'B').length;
              return (
                s.isFinal === true ||
                meta.isCompleted === true ||
                wonA >= 2 ||
                wonB >= 2 ||
                (games.length > 0 && !s.isActive)
              );
            });
            setFinishedScores(finished);
          }
        })
        .catch(() => { });
    };

    fetchScores();
    const iv = setInterval(fetchScores, 12000);
    return () => clearInterval(iv);
  }, [userId, userUuid, token]);

  const displayName = personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete');
  const athlonId = personalProfile?.athlonId || 'ATH-0000000';

  /* ── handlers ── */
  function selectRole(role: string) {
    if (role === 'PLAYER') {
      setActiveWorkspace('PERSONAL');
      setActiveRole('PLAYER');
      router.push('/home');
    } else {
      setActiveWorkspace(role);
      router.push(`/org/${role}/dashboard`);
    }
  }

  const pendingLineups = rawUserMatches.filter((m) => m.status === 'WAITING_FOR_LINEUPS');
  const liveAuctionChampionships = publicChampionships.filter(
    (c) => c.stage === 'AUCTION_STAGE' || c.stage === 'AUCTION_PAUSED' || c.stage === 'AUCTION'
  );

  /* ── search & filter state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState('All');

  const availablePlaces = useMemo(() => {
    return extractAvailablePlaces(
      publicTournaments,
      publicChampionships,
      publicVenues,
      publicAcademies,
      publicCoaches
    );
  }, [publicTournaments, publicChampionships, publicVenues, publicAcademies, publicCoaches]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSport('All');
    setSelectedPlace('All');
  };

  const filteredTournaments = useMemo(() => {
    return publicTournaments.filter((t) => {
      const matchesSport = matchSport(t.sport, selectedSport);
      const matchesPlace = matchPlace(t, selectedPlace);
      const matchesQuery = matchSearchQuery(`${t.name} ${t.sport} ${t.location || ''} ${t.description || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [publicTournaments, selectedSport, selectedPlace, searchQuery]);

  const filteredChampionships = useMemo(() => {
    return publicChampionships.filter((c) => {
      const matchesSport = matchSport(c.sport, selectedSport);
      const matchesPlace = matchPlace(c, selectedPlace);
      const matchesQuery = matchSearchQuery(`${c.name} ${c.sport} ${c.location || ''} ${c.venue || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [publicChampionships, selectedSport, selectedPlace, searchQuery]);

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
      const specsText = Array.isArray(c.profile?.specializations) ? c.profile.specializations.join(' ') : '';
      const sportsText = `${c.profile?.sportsOffered || ''} ${c.sportsOffered || ''} ${c.sportType || ''} ${(c.tags || []).join(' ')} ${specsText} ${c.specialization || ''}`;
      const searchPayload = `${c.name || ''} ${sportsText} ${c.city || ''} ${c.profile?.city || ''} ${c.location || ''} ${c.address || ''} ${c.profile?.bio || ''} ${c.description || ''}`;
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

  const handleSessionRsvp = async (sessionUuid: string, status: 'GOING' | 'NOT_GOING') => {
    try {
      await CommunityService.rsvpSession(sessionUuid, { status });
      const res: any = await CommunityService.getAllSessions();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setSessions((prev) => {
        const map = new Map<string, SessionResponse>();
        prev.forEach((s: SessionResponse) => map.set(s.sessionUuid, s));
        list.forEach((s: SessionResponse) => map.set(s.sessionUuid, s));
        return Array.from(map.values());
      });
    } catch (err) {
      console.error('Failed to RSVP session:', err);
    }
  };

  const handleMemberPollVote = async (pollId: number, optionId: number) => {
    try {
      await CommunityService.votePoll(pollId, [optionId]);
      // Immediately refresh member polls
      const myCommsMap = new Map<string, { communityUuid: string; name: string }>();
      myCommunities.forEach((c) => {
        if (c.communityUuid) myCommsMap.set(c.communityUuid, { communityUuid: c.communityUuid, name: c.name });
      });
      const currentOrgs = useWorkspaceStore.getState().organizations || [];
      currentOrgs.forEach((o) => {
        if (o.type === 'COMMUNITY' && o.id) myCommsMap.set(o.id, { communityUuid: o.id, name: o.name });
      });
      const activeComms = Array.from(myCommsMap.values());
      const pollsAccumulator: { poll: CommunityPoll; communityName: string }[] = [];
      await Promise.allSettled(
        activeComms.map(async (comm) => {
          try {
            const pollRes: any = await CommunityService.getPolls(comm.communityUuid);
            const pList: CommunityPoll[] = Array.isArray(pollRes)
              ? pollRes
              : Array.isArray(pollRes?.data)
              ? pollRes.data
              : [];
            pList.forEach((poll) => {
              if (poll.pollId) pollsAccumulator.push({ poll, communityName: comm.name });
            });
          } catch {}
        })
      );
      pollsAccumulator.sort((a, b) => {
        if (a.poll.isClosed !== b.poll.isClosed) return a.poll.isClosed ? 1 : -1;
        return new Date(b.poll.createdAt || 0).getTime() - new Date(a.poll.createdAt || 0).getTime();
      });
      setMemberPolls(pollsAccumulator);
    } catch (err) {
      console.error('Failed to vote in community poll:', err);
    }
  };

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
      const matchesQuery = matchSearchQuery(`${cfg.tournamentName || ''} ${cfg.courtName || ''} ${cfg.teamAName || ''} ${cfg.teamBName || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [finishedScores, selectedSport, selectedPlace, searchQuery]);

  const filteredLiveAuctionChampionships = useMemo(() => {
    return liveAuctionChampionships.filter((c) => {
      const matchesSport = matchSport(c.sport, selectedSport);
      const matchesPlace = matchPlace(c, selectedPlace);
      const matchesQuery = matchSearchQuery(`${c.name} ${c.sport} ${c.location || ''} ${c.venue || ''}`, searchQuery);
      return matchesSport && matchesPlace && matchesQuery;
    });
  }, [liveAuctionChampionships, selectedSport, selectedPlace, searchQuery]);

  const totalFilteredMatches =
    filteredTournaments.length +
    filteredChampionships.length +
    filteredVenues.length +
    filteredAcademies.length +
    filteredCoaches.length +
    filteredLiveScores.length;

  const isFilteringActive =
    searchQuery.trim() !== '' ||
    selectedSport.toLowerCase() !== 'all' ||
    selectedPlace.toLowerCase() !== 'all';

  return (
    <div className="bg-background text-foreground flex flex-col relative selection:bg-primary selection:text-primary-foreground min-h-screen w-full max-w-full overflow-x-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden h-[calc(100vh-64px)] overflow-y-auto hide-scrollbar overscroll-contain max-w-full pb-8">
        {/* ─── 0. TOP NOTCH APP MODE SWITCHER (ATHLON ↔ MARKET) ─── */}
        <div className="px-4 pt-0 pb-0 flex justify-center">
          <AppModeSwitcher />
        </div>

        {/* HERO VIDEO CARD */}
        <div className="px-4 relative z-10 mt-1.5 mb-3">
          <div
            className="relative w-full h-[175px] sm:h-[200px] rounded-[20px] overflow-hidden border shadow-md flex items-center justify-center"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <video
              key={backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-[20px]"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
          </div>
        </div>

        {/* ROLE SWITCHER HEADER ─────────────────────── */}
        <div className="px-4 mb-3">
          <HomeRoleHeader
            activeRole={activeRole}
            onSelectRole={selectRole}
            organizations={organizations}
            showSearch={false}
            onAddClick={() => {
              window.location.href = '/subscription';
            }}
          />
        </div>

        {/* ── PLAYER CONTENT ────────────────────────────────────────────── */}
        {activeRole === 'PLAYER' && (
          <>
            {/* Profile Stats Card */}
            {/* 👤 ATHLON PROFILE HERO CARD */}
            <div className="px-4 mb-3">
              <div
                className="rounded-[16px] shadow-sm overflow-hidden border relative transition-colors"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                {/* Top Subtle Ambient Glow */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20"
                  style={{ backgroundColor: 'var(--athlon-primary)' }}
                />

                {/* Profile Info Header */}
                <div className="flex items-center justify-between p-3 border-b relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-inner flex items-center justify-center border"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <img
                          src={personalProfile?.avatar || '/placeholder.png'}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2"
                        style={{ borderColor: 'var(--athlon-card)' }}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-foreground font-black text-xs sm:text-sm tracking-wide uppercase truncate">
                        {displayName}
                      </span>
                    </div>
                  </div>

                  {/* Win Rate Capsule */}
                  <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/25 rounded-lg px-2 py-1 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] font-extrabold tracking-widest uppercase text-primary/80 leading-none mb-0.5">
                        WIN RATE
                      </span>
                      <span className="text-primary font-black text-xs sm:text-sm leading-none font-mono">
                        {playerStats?.winRate ? `${Math.round(playerStats.winRate)}%` : '0%'}
                      </span>
                    </div>
                    <TrendingUp className="w-3 h-3 text-primary shrink-0 opacity-90" />
                  </div>
                </div>

                {/* 3 Stats Grid (Compact) */}
                <div
                  className="grid grid-cols-3 divide-x relative z-10"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {[
                    { label: 'MATCHES', icon: Activity, value: String(playerStats?.totalMatches ?? 0) },
                    { label: 'WINS', icon: Trophy, value: String(playerStats?.matchesWon ?? 0) },
                    { label: 'WIN RATE', icon: TrendingUp, value: `${playerStats?.winRate ? Math.round(playerStats.winRate) : 0}%` },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col items-center justify-center py-2 px-1.5 gap-0.5"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center gap-1 text-[7.5px] font-extrabold tracking-wider uppercase" style={{ color: 'var(--athlon-icon-muted)' }}>
                        <s.icon className="w-2.5 h-2.5" style={{ color: 'var(--athlon-icon-muted)' }} />
                        <span>{s.label}</span>
                      </div>
                      <div className="text-foreground font-black text-xs sm:text-sm leading-tight font-mono">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 pt-1 pb-3 mb-1.5 overflow-hidden">
              <section className="flex items-center justify-between">
                {quickActions.map((action) => (
                  <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
                    <div
                      className="w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] rounded-[18px] flex flex-col items-center justify-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 border"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Athlon3DIcon type={action.icon3d} size={36} active={true} />
                    </div>
                    <span className="text-[11px] font-bold transition-colors group-hover:text-primary" style={{ color: 'var(--athlon-text-secondary)' }}>
                      {action.label}
                    </span>
                  </Link>
                ))}
              </section>
            </div>

            {/* My Clubs & Workspaces (Role-Aware) */}
            {organizations && organizations.length > 0 && (
              <div className="px-4 pb-3.5 pt-0.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Membership
                    </h2>
                  </div>
                  <span className="text-[9.5px] font-bold text-foreground/45 uppercase tracking-wider">
                    {organizations.length} {organizations.length === 1 ? 'Org' : 'Orgs'}
                  </span>
                </div>

                <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {organizations.map((orgItem) => {
                    const roleUpper = (orgItem.role || 'MEMBER').toUpperCase();
                    const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'OWNER' || roleUpper === 'MANAGER';
                    const isCoach = roleUpper === 'COACH';
                    const isStudent = roleUpper === 'STUDENT';

                    return (
                      <div
                        key={orgItem.id}
                        className="snap-start shrink-0 w-[200px] sm:w-[220px]"
                      >
                        <button
                          onClick={() => {
                            setActiveWorkspace(orgItem.id);
                            router.push(`/org/${orgItem.id}/dashboard`);
                          }}
                          className="w-full text-left p-3 rounded-[16px] border bg-gradient-to-br from-surface via-surface to-background/60 hover:border-primary/50 transition-all group shadow-sm flex flex-col justify-between h-full space-y-2"
                          style={{
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 overflow-hidden flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform text-primary">
                              {orgItem.logo ? (
                                <img src={orgItem.logo} alt={orgItem.name} className="w-full h-full object-cover" />
                              ) : (
                                <Athlon3DIcon
                                  type={
                                    orgItem.type === 'CLUB'
                                      ? 'members'
                                      : orgItem.type === 'ACADEMY'
                                        ? 'students'
                                        : orgItem.type === 'COACH'
                                          ? 'coaches'
                                          : orgItem.type === 'COURT' || (orgItem.type as string) === 'VENUE_MANAGER'
                                            ? 'facilities'
                                            : 'tournaments'
                                  }
                                  size={20}
                                  active={true}
                                />
                              )}
                            </div>

                            {/* Role Badge */}
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${isAdmin
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
                                : isCoach
                                  ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
                                  : isStudent
                                    ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                }`}
                            >
                              {isAdmin ? '👑 Admin' : isCoach ? '🧢 Coach' : isStudent ? '🎓 Student' : '👤 Member'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                              {orgItem.name}
                            </h4>
                            <span className="text-[9px] font-bold text-foreground/70 dark:text-foreground/40 uppercase tracking-wider block mt-0.5">
                              {orgItem.type === 'COURT' || (orgItem.type as string) === 'VENUE_MANAGER' ? 'Venue Manager' : orgItem.type === 'COACH' ? 'Freelance Coach' : orgItem.type}
                            </span>
                          </div>

                          <div className="pt-1.5 border-t border-foreground/5 flex items-center justify-between text-[9.5px] font-extrabold text-primary">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 🔍 DISCOVERY SEARCH & FILTRATION (SPORTS & LOCATION) ────────────── */}
            <div className="px-4 pb-1.5 pt-0.5">
              <HomeSearchFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSport={selectedSport}
                onSelectSport={setSelectedSport}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                availablePlaces={availablePlaces}
                totalResults={totalFilteredMatches}
                onResetFilters={handleResetFilters}
              />
            </div>

            {/* Empty State when Search/Filter returns 0 results */}
            {isFilteringActive && totalFilteredMatches === 0 && (
              <div
                className="mx-4 my-3 p-6 rounded-[20px] border border-dashed text-center space-y-2.5 shadow-sm backdrop-blur-md"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Search className="w-7 h-7 text-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-foreground">No matches found</h3>
                  <p className="text-[11px] text-foreground/50 max-w-xs mx-auto">
                    No tournaments, turfs, academies, or live matches found for{' '}
                    {selectedSport !== 'All' && <span className="text-primary font-bold">{selectedSport} </span>}
                    {selectedPlace !== 'All' && <span className="text-emerald-400 font-bold">in {selectedPlace} </span>}
                    {searchQuery && <span>matching "{searchQuery}"</span>}.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-primary text-black hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* ── SECTION 0: LIVE PLAYER AUCTIONS (MOBILE) ── */}
            {filteredLiveAuctionChampionships.length > 0 && (
              <div className="px-4 pb-3.5 pt-0.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <h2 className="text-[10.5px] font-black text-red-500 uppercase tracking-wider">
                      Live Player Auctions ({filteredLiveAuctionChampionships.length})
                    </h2>
                  </div>
                  <span className="text-[8.5px] font-black text-red-400 uppercase tracking-wider">
                    🔴 Broadcasting
                  </span>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredLiveAuctionChampionships.map((champ) => (
                    <div
                      key={champ.championshipUuid}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                    >
                      <Link
                        href={`/home/team-championship/${champ.championshipUuid}/auction`}
                        className="block h-full rounded-[18px] overflow-hidden shadow-lg border relative transition-all hover:border-red-500/50 group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />
                        <div className="p-3.5 space-y-2.5 flex flex-col justify-between h-full">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Live Auction
                            </span>
                            <span className="text-[8.5px] font-bold text-foreground/45 uppercase tracking-wider truncate max-w-[140px]">
                              {champ.sport || 'Badminton'}
                            </span>
                          </div>

                          <div className="space-y-0.5">
                            <h3 className="text-xs sm:text-[13px] font-black text-foreground tracking-tight line-clamp-1">
                              {champ.name}
                            </h3>
                            <p className="text-[10.5px] text-foreground/60 line-clamp-1">
                              {champ.location || champ.venue || 'Arena'} • Live Draft Floor
                            </p>
                          </div>

                          <div
                            className="rounded-lg p-2 border flex items-center justify-between text-xs"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <span className="text-foreground/60 font-semibold text-[10.5px]">Franchises:</span>
                            <span className="font-mono font-black text-primary text-xs">
                              {champ.registeredTeamsCount || champ.maxTeams || 0} Teams
                            </span>
                          </div>

                          <div className="w-full py-2 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/25">
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Enter Live Arena</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 1: LIVE SCORES (MOBILE) ── */}
            {filteredLiveScores.length > 0 && (
              <div className="px-4 pb-3.5 pt-0.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">Live Now</h2>
                  </div>
                  <Link href="/live-score" className="text-[9.5px] font-bold text-red-500 hover:underline uppercase tracking-wider">
                    See All ({filteredLiveScores.length})
                  </Link>
                </div>
                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredLiveScores.map((score) => {
                    const meta = score.scoreMeta || {};
                    const config = meta.config || {};
                    const teamAPlayers = config.teamA || [];
                    const teamBPlayers = config.teamB || [];
                    const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                    const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                    const gi = meta.currentGameIndex || 0;
                    const games = meta.games || [];
                    const cur = games[gi] || {};
                    const scoreA = cur.scoreA ?? (score.teamAScore || 0);
                    const scoreB = cur.scoreB ?? (score.teamBScore || 0);
                    const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                    const setsWonB = games.filter((g: any) => g.winner === 'B').length;
                    const isServing = cur.currentServer;
                    return (
                      <div key={score.scoreId} className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[320px] md:w-[340px] max-w-[360px]">
                        <Link
                          href={`/live-score/${score.matchUuid}`}
                          className="block h-full rounded-[18px] overflow-hidden shadow-sm group relative transition-all hover:scale-[1.01] border"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="relative rounded-[18px] overflow-hidden h-full flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                                <span className="inline-flex items-center gap-1.5 px-2 py-[2px] rounded-full text-[8.5px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/25">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                                </span>
                                <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-foreground/75 dark:text-foreground/50 uppercase tracking-wider">
                                  <span>{config.courtName || 'Court'}</span>
                                  <span className="text-foreground/30">•</span>
                                  <span>Game {gi + 1}</span>
                                </div>
                              </div>

                              <div className="px-3.5 py-2.5">
                                <div className="flex items-stretch gap-2.5">
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <div
                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${isServing === 'A'
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 border'
                                          : 'bg-surface text-foreground/70 border border-border'
                                          }`}
                                      >
                                        {isServing === 'A' ? <Zap className="w-3 h-3" /> : 'A'}
                                      </div>
                                      <span
                                        className={`text-xl font-black tabular-nums font-mono ${Number(scoreA) > Number(scoreB) ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                                          }`}
                                      >
                                        {scoreA}
                                      </span>
                                    </div>
                                    {teamAPlayers.length > 0 ? (
                                      teamAPlayers.map((p: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-[7.5px] font-black text-emerald-800 dark:text-emerald-400">{p.charAt(0)}</span>
                                          </div>
                                          <span className="text-[10.5px] font-bold text-foreground/90 truncate">{p}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-[10.5px] font-bold text-foreground/90 truncate block">{teamAName}</span>
                                    )}
                                  </div>

                                  <div className="flex flex-col items-center justify-center gap-1.5 px-1">
                                    <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center">
                                      <span className="text-[8.5px] font-black text-foreground/60 dark:text-foreground/40 uppercase">vs</span>
                                    </div>
                                    {games.length > 1 && (
                                      <div className="flex flex-col items-center gap-[2px]">
                                        {games.map((_: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full ${idx === gi
                                              ? 'bg-red-500'
                                              : games[idx]?.winner === 'A'
                                                ? 'bg-emerald-600'
                                                : games[idx]?.winner === 'B'
                                                  ? 'bg-amber-600'
                                                  : 'bg-foreground/30'
                                              }`}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0 space-y-1 text-right">
                                    <div className="flex items-center justify-end gap-1.5 mb-1.5">
                                      <span
                                        className={`text-xl font-black tabular-nums font-mono ${Number(scoreB) > Number(scoreA) ? 'text-amber-800 dark:text-amber-400' : 'text-foreground'
                                          }`}
                                      >
                                        {scoreB}
                                      </span>
                                      <div
                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${isServing === 'B'
                                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40 border'
                                          : 'bg-surface text-foreground/70 border border-border'
                                          }`}
                                      >
                                        {isServing === 'B' ? <Zap className="w-3 h-3" /> : 'B'}
                                      </div>
                                    </div>
                                    {teamBPlayers.length > 0 ? (
                                      teamBPlayers.map((p: string, i: number) => (
                                        <div key={i} className="flex items-center justify-end gap-1.5">
                                          <span className="text-[10.5px] font-bold text-foreground/90 truncate">{p}</span>
                                          <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-[7.5px] font-black text-amber-800 dark:text-amber-400">{p.charAt(0)}</span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-[10.5px] font-bold text-foreground/90 truncate block">{teamBName}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {(setsWonA > 0 || setsWonB > 0) && (
                                <div className="mx-3.5 mb-2 flex items-center gap-2 text-[8.5px] font-black uppercase tracking-wider text-foreground/40">
                                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">{setsWonA}</span>
                                  <div className="flex-1 h-[2px] rounded-full bg-foreground/10 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-500/30 rounded-full"
                                      style={{ width: `${(setsWonA / (setsWonA + setsWonB || 1)) * 100}%` }}
                                    />
                                  </div>
                                  <span>Sets</span>
                                  <div className="flex-1 h-[2px] rounded-full bg-foreground/10 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-l from-amber-500/80 to-amber-500/30 rounded-full ml-auto"
                                      style={{ width: `${(setsWonB / (setsWonA + setsWonB || 1)) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-amber-500 dark:text-amber-400 font-bold">{setsWonB}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between px-3.5 py-2 bg-surface/50 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                              <span className="text-[8.5px] font-bold text-foreground/50 uppercase tracking-wider truncate max-w-[60%]">
                                {config.tournamentName || 'Live Match'}
                              </span>
                              <span className="text-[8.5px] font-black text-red-500 uppercase tracking-wider flex items-center gap-0.5 group-hover:text-red-400 transition-colors">
                                Watch <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SECTION 2: Book Courts & Turfs ── */}
            {filteredVenues.length > 0 && (
              <div className="px-4 pb-3.5 pt-0.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Book Courts &amp; Turfs ({filteredVenues.length})
                    </h2>
                  </div>
                  <Link href="/venues" className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5">
                    <span>Explore</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredVenues.map((venue: any) => (
                    <div
                      key={venue.venueUuid || venue.venueId || venue.id}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                    >
                      <VenueMarketplaceCard venue={venue} className="h-full shadow-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 3: Featured Sports Academies & Coaching Centers ── */}
            {filteredAcademies.length > 0 && (
              <div className="px-4 pb-3.5 pt-0.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Training Academies ({filteredAcademies.length})
                    </h2>
                  </div>
                  <Link href="/academies?type=ACADEMY" className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5">
                    <span>Explore</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredAcademies.map((acad: any) => (
                    <div
                      key={acad.uuid || acad.id}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                    >
                      <AcademyMarketplaceCard academy={acad} className="h-full shadow-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 4: Professional Coaches & Mentors ── */}
            {filteredCoaches.length > 0 && (
              <div className="px-4 pb-3.5 pt-0.5 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Professional Coaches ({filteredCoaches.length})
                    </h2>
                  </div>
                  <Link href="/coaches" className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5">
                    <span>Explore</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredCoaches.map((coach: any) => (
                    <div
                      key={coach.uuid || coach.id}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                    >
                      <CoachMarketplaceCard coach={coach} className="h-full shadow-sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION: Sports Communities & Game Circles ── */}
            <div className="px-4 pb-4 pt-1 overflow-hidden">
              <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                    Sports Communities &amp; Circles
                  </h2>
                </div>
                <Link href="/communities" className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5">
                  <span>Explore</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* ── Ultra-Stylish Community Showcase Card ── */}
              <div
                className="relative rounded-[22px] border p-4 sm:p-5 overflow-hidden transition-all duration-300 hover:shadow-xl group"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                {/* Top Subtle Brand Gradient Line */}
                <div className="h-1 w-full bg-gradient-to-r from-primary/70 via-primary to-primary/20 absolute top-0 left-0 right-0" />

                {/* Ambient Decorative Glow */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary/15 dark:bg-primary/25 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/30 transition-all duration-500" />

                <div className="relative z-10 space-y-3.5">
                  {/* Header Row: Icon + Title + Live Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-surface border border-primary/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <Athlon3DIcon type="members" size={30} active={true} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                          Local Playing Circles
                        </h3>
                        <p className="text-[11px] text-foreground/60 font-medium line-clamp-1">
                          Let&apos;s Play games
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span>Active</span>
                    </span>
                  </div>

                  {/* Feature Highlights: 2-Column Clean Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="p-2.5 rounded-xl border flex items-center gap-2"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <span className="text-sm shrink-0">🏸</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-foreground truncate">Live RSVPs</p>
                        <p className="text-[8.5px] text-foreground/50 truncate">Weekly game slots</p>
                      </div>
                    </div>

                    <div
                      className="p-2.5 rounded-xl border flex items-center gap-2"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <span className="text-sm shrink-0">📊</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-foreground truncate">Squad Matches</p>
                        <p className="text-[8.5px] text-foreground/50 truncate">Scorecards &amp; kitty</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action & Social Proof Bar */}
                  <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border border-card text-[8px] font-black flex items-center justify-center text-primary">
                          DK
                        </div>
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-card text-[8px] font-black flex items-center justify-center text-blue-400">
                          AR
                        </div>
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-card text-[8px] font-black flex items-center justify-center text-amber-400">
                          SK
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-foreground/60 truncate">
                        Players nearby
                      </span>
                    </div>

                    <Link
                      href="/communities"
                      className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-black text-xs inline-flex items-center gap-1 transition-all shadow-[0_2px_8px_var(--athlon-primary-glow)] active:scale-95 shrink-0"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Finished Match Results */}
            {filteredFinishedScores.length > 0 && (
              <div className="px-4 pb-4 pt-1 mt-2 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Recent Match Results
                    </h2>
                  </div>
                  <Link
                    href="/live-score"
                    className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All ({filteredFinishedScores.length}) <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredFinishedScores.map((score) => {
                    const meta = score.scoreMeta || {};
                    const config = meta.config || {};
                    const teamAPlayers = config.teamA || [];
                    const teamBPlayers = config.teamB || [];
                    const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                    const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                    const games = meta.games || [];
                    const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                    const setsWonB = games.filter((g: any) => g.winner === 'B').length;
                    const winner = setsWonA > setsWonB ? 'A' : setsWonB > setsWonA ? 'B' : null;

                    return (
                      <div
                        key={score.scoreId}
                        className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                      >
                        <Link
                          href={`/live-score/${score.matchUuid}`}
                          className="block h-full rounded-[18px] overflow-hidden shadow-sm border relative transition-all hover:border-primary/50 group"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <SportCardSkeletonBackground sport={config.sport || config.category || (score as any).sport || 'Badminton'} />
                          <div className="h-[2px] w-full bg-primary shadow-[0_0_6px_var(--athlon-primary)] relative z-10" />
                          <div className="p-3.5 space-y-2.5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                                <CheckCircle2 className="w-2.5 h-2.5 text-primary" /> Completed
                              </span>
                              <span className="text-[8.5px] font-bold text-foreground/75 dark:text-foreground/45 uppercase tracking-wider truncate max-w-[150px]">
                                {config.tournamentName || 'Tournament Match'}
                              </span>
                            </div>

                            {/* Teams & Scores */}
                            <div
                              className="rounded-lg p-2.5 border space-y-1.5"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-black text-primary shrink-0">
                                    {teamAName.charAt(0)}
                                  </div>
                                  <span
                                    className={`text-xs truncate ${winner === 'A' ? 'font-black text-foreground' : 'font-medium text-foreground/70'
                                      }`}
                                  >
                                    {teamAName}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-black font-mono tabular-nums ${winner === 'A' ? 'text-primary font-black' : 'text-foreground/60'
                                    }`}
                                >
                                  {setsWonA}
                                </span>
                              </div>

                              <div
                                className="flex items-center justify-between gap-2 border-t pt-1.5"
                                style={{ borderColor: 'var(--athlon-border-subtle)' }}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-5 h-5 rounded bg-surface border border-border flex items-center justify-center text-[9px] font-bold text-foreground/70 shrink-0">
                                    {teamBName.charAt(0)}
                                  </div>
                                  <span
                                    className={`text-xs truncate ${winner === 'B' ? 'font-black text-foreground' : 'font-medium text-foreground/70'
                                      }`}
                                  >
                                    {teamBName}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-black font-mono tabular-nums ${winner === 'B' ? 'text-primary font-black' : 'text-foreground/60'
                                    }`}
                                >
                                  {setsWonB}
                                </span>
                              </div>
                            </div>

                            {/* Sets breakdown & CTA */}
                            <div
                              className="flex items-center justify-between pt-1.5 border-t text-[9.5px]"
                              style={{ borderColor: 'var(--athlon-border-subtle)' }}
                            >
                              {games.length > 0 ? (
                                <div className="flex items-center gap-1 flex-wrap text-foreground/80 dark:text-foreground/60">
                                  <span className="font-bold text-foreground/60 dark:text-foreground/40 text-[8.5px] uppercase">Sets:</span>
                                  {games.map((g: any, gIdx: number) => (
                                    <span key={gIdx} className="px-1 py-0.2 rounded bg-surface border border-border font-mono font-bold text-[8.5px] text-foreground">
                                      {g.scoreA ?? 0}–{g.scoreB ?? 0}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[8.5px] text-foreground/60 dark:text-foreground/40 font-bold uppercase">Finished</span>
                              )}

                              <span className="text-[8.5px] font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                                Scorecard <ChevronRight className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Championships (Auctions & Leagues) */}
            {filteredChampionships.length > 0 && (
              <div className="px-4 pb-4 pt-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Team Championships ({filteredChampionships.length})
                    </h2>
                  </div>
                  <Link
                    href="/tournaments"
                    className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredChampionships.map((c) => (
                    <div
                      key={c.championshipId || c.championshipUuid}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                    >
                      <PublicTeamChampionshipCard championship={c} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tournaments (Open, Ongoing & Finished) */}
            {filteredTournaments.length > 0 && (
              <div className="px-4 pb-4 pt-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Tournaments ({filteredTournaments.length})
                    </h2>
                  </div>
                  <Link
                    href="/home/tournaments"
                    className="text-[9.5px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {filteredTournaments.map((t) => (
                    <div
                      key={t.tournamentId || t.tournamentUuid}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[300px] md:w-[320px] max-w-[340px]"
                    >
                      <PublicTournamentCard tournament={t} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MOBILE SECTION: COMMUNITY GAME SESSIONS ── */}
            {filteredSessions.length > 0 && (
              <div className="px-4 pb-4 pt-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Community Sessions ({filteredSessions.length})
                    </h2>
                  </div>
                  <span className="text-[9.5px] font-bold text-primary/80 uppercase tracking-wider">
                    1-Tap RSVP
                  </span>
                </div>

                <div
                  ref={mobileSessionsScrollRef}
                  className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
                >
                  {filteredSessions.map((session) => (
                    <div
                      key={session.sessionUuid}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[320px] max-w-[350px] flex"
                    >
                      <CommunitySessionCard
                        session={session}
                        isLoggedIn={true}
                        onRsvp={handleSessionRsvp}
                        communityName={session.communityName || myCommunities.find((c) => c.communityUuid === session.communityUuid)?.name}
                        className="w-full h-full shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MOBILE SECTION: ACTIVE MEMBER POLLS & VOTES ── */}
            {memberPolls.length > 0 && (
              <div className="px-4 pb-4 pt-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Vote className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Active Member Polls &amp; Votes ({memberPolls.length})
                    </h2>
                  </div>
                  <span className="text-[9.5px] font-bold text-primary/80 uppercase tracking-wider">
                    1-Tap Vote
                  </span>
                </div>

                <div
                  ref={mobilePollsScrollRef}
                  className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
                >
                  {memberPolls.map(({ poll, communityName }) => (
                    <div
                      key={poll.pollId}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[320px] max-w-[350px] flex"
                    >
                      <CommunityPollCard
                        poll={poll}
                        communityName={communityName}
                        onVote={handleMemberPollVote}
                        className="w-full h-full shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Required: Pending Lineups */}
            {pendingLineups.length > 0 && (
              <div className="px-4 pb-4 pt-1">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <h2 className="text-[10.5px] font-black text-orange-500 uppercase tracking-wider">Action Required</h2>
                  </div>
                  <Link
                    href="/home/matches"
                    className="text-[9.5px] font-bold text-orange-500 hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {pendingLineups.map((match) => {
                    const isAApproved = match.teamALineupStatus === 'APPROVED';
                    const isBApproved = match.teamBLineupStatus === 'APPROVED';
                    const isASubmitted = match.teamALineupStatus === 'SUBMITTED' || isAApproved;
                    const isBSubmitted = match.teamBLineupStatus === 'SUBMITTED' || isBApproved;
                    const bothApproved = isAApproved && isBApproved;
                    const hasSubmitted = isASubmitted || isBSubmitted;

                    const statusBadgeText = bothApproved
                      ? 'Lineups Approved'
                      : hasSubmitted
                        ? 'Lineup Submitted'
                        : 'Pending Lineup';

                    const statusBadgeClass = bothApproved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : hasSubmitted
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-orange-500/20 text-orange-500 border border-orange-500/30';

                    const cardBgClass = bothApproved
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : hasSubmitted
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-orange-500/5 border-orange-500/25';

                    const dateStr = match.scheduledTime || match.matchDate;
                    let formattedDate = 'Date TBA';
                    let formattedTime = 'Time TBA';
                    if (dateStr) {
                      const d = new Date(dateStr);
                      if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      }
                    }
                    return (
                      <div
                        key={match.id}
                        className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <div className={`rounded-[16px] border p-3.5 flex flex-col gap-2.5 h-full transition-all ${cardBgClass}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${statusBadgeClass}`}
                              >
                                {statusBadgeText}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider text-foreground/40">
                                Team Event
                              </span>
                            </div>
                            <AlertCircle
                              className={`w-3.5 h-3.5 shrink-0 ${bothApproved ? 'text-emerald-400' : hasSubmitted ? 'text-primary' : 'text-orange-500'
                                }`}
                            />
                          </div>

                          <h3 className="text-xs sm:text-[13px] font-black tracking-tight text-foreground truncate">
                            {match.teamAName && match.teamBName
                              ? `${match.teamAName} vs ${match.teamBName}`
                              : `Team Event Match #${match.id}`}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2.5 text-[9.5px] font-semibold text-foreground/50">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-primary" /> {formattedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" /> {formattedTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />{' '}
                              {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                            </div>
                          </div>

                          <button
                            onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                            className={`mt-auto w-full py-2 text-xs font-black uppercase tracking-wider rounded-lg active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 ${bothApproved
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                              : hasSubmitted
                                ? 'bg-primary hover:bg-primary-hover text-black'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                              }`}
                          >
                            {hasSubmitted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> View Lineup
                              </>
                            ) : (
                              <>
                                <ClipboardList className="w-3.5 h-3.5" /> Submit Lineup
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matches */}
            {userMatches.length > 0 && (
              <div className="px-4 pb-6">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Matches ({userMatches.length})
                    </h2>
                  </div>
                  <Link
                    href="/home/matches"
                    className="text-[9.5px] font-bold text-primary uppercase tracking-wider flex items-center hover:underline"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {userMatches.map((match) => (
                    <div
                      key={match.id}
                      className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                    >
                      <div
                        className="relative rounded-[18px] overflow-hidden shadow-sm border h-full flex flex-col justify-between"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="h-[2px] w-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400" />
                        <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2 border-b border-foreground/5 pb-2">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="text-[9px] font-black text-foreground/40 uppercase tracking-wider block truncate">
                                {match.tournament}
                              </span>
                              <div className="flex items-center gap-1 text-xs font-bold text-primary">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{match.court}</span>
                              </div>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border shrink-0 ${match.status === 'LIVE' || match.status === 'IN_PROGRESS'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                                : 'bg-primary/10 text-primary border-primary/20'
                                }`}
                            >
                              {match.status === 'LIVE' || match.status === 'IN_PROGRESS' ? '● LIVE' : match.status}
                            </span>
                          </div>
                          <div
                            className="rounded-lg p-2.5 border space-y-1.5"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                                  {match.teamAName.charAt(0)}
                                </div>
                                <span className="text-xs font-extrabold text-foreground truncate">{match.teamAName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 my-0.5">
                              <div className="h-[1px] flex-1 bg-foreground/10" />
                              <span className="text-[8px] font-black text-primary uppercase tracking-wider bg-surface px-1.5 py-0.2 rounded-full border border-foreground/10 shrink-0">
                                VS
                              </span>
                              <div className="h-[1px] flex-1 bg-foreground/10" />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-[10px] shrink-0">
                                  {match.teamBName.charAt(0)}
                                </div>
                                <span className="text-xs font-extrabold text-foreground truncate">{match.teamBName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-foreground/5">
                            <span className="text-[8.5px] font-bold text-foreground/40 uppercase tracking-wider">Time</span>
                            <div className="flex items-center gap-1 text-foreground/80 font-bold bg-background px-2 py-0.5 rounded border border-foreground/5 text-[10.5px]">
                              <Clock className="w-2.5 h-2.5 text-primary" />
                              <span>{match.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Umpiring Assignments */}
            {umpireMatches.length > 0 && (
              <div className="px-4 pb-6">
                <div className="flex items-center justify-between mb-2.5 pl-0.5 pr-0.5">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <h2 className="text-[10.5px] font-black text-foreground/80 uppercase tracking-wider">
                      Umpiring Assignments ({umpireMatches.length})
                    </h2>
                  </div>
                  <Link
                    href="/home/matches"
                    className="text-[9.5px] font-bold text-red-400 uppercase tracking-wider flex items-center hover:underline"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  {umpireMatches.map((match) => {
                    const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                    const isCompleted = match.status === 'COMPLETED';
                    const dateStr = match.scheduledTime || match.matchDate;
                    let formattedTime = 'Time TBA';
                    if (dateStr) {
                      const d = new Date(dateStr);
                      if (!isNaN(d.getTime())) {
                        formattedTime = d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
                      }
                    }

                    return (
                      <div
                        key={match.id || match.uuid}
                        className="snap-start shrink-0 w-[calc(100vw-2.5rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <div
                          className="relative rounded-[18px] overflow-hidden shadow-sm border h-full flex flex-col justify-between"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

                          <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2 border-b border-foreground/5 pb-2">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <span className="text-[9px] font-black text-foreground/40 uppercase tracking-wider block truncate">
                                  {match.tournamentName || 'Tournament Match'}
                                </span>
                                <div className="flex items-center gap-1 text-xs font-bold text-red-400">
                                  <MapPin className="w-3 h-3 shrink-0 text-amber-400" />
                                  <span className="truncate">
                                    {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border shrink-0 ${isLive
                                  ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
                                  : isCompleted
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}
                              >
                                {isLive ? '● LIVE' : isCompleted ? 'Completed' : 'Assigned'}
                              </span>
                            </div>

                            <div
                              className="rounded-lg p-2.5 border space-y-1.5"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <div className="w-6 h-6 rounded bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-[10px] shrink-0">
                                    {(match.teamAName || 'A').charAt(0)}
                                  </div>
                                  <span className="text-xs font-extrabold text-foreground truncate">
                                    {match.teamAName || 'Team A'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 my-0.5">
                                <div className="h-[1px] flex-1 bg-foreground/10" />
                                <span className="text-[8px] font-black text-red-400 uppercase tracking-wider bg-surface px-1.5 py-0.2 rounded-full border border-foreground/10 shrink-0">
                                  VS
                                </span>
                                <div className="h-[1px] flex-1 bg-foreground/10" />
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                  <div className="w-6 h-6 rounded bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-[10px] shrink-0">
                                    {(match.teamBName || 'B').charAt(0)}
                                  </div>
                                  <span className="text-xs font-extrabold text-foreground truncate">
                                    {match.teamBName || 'Team B'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-1 border-t border-foreground/5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[8.5px] font-bold text-foreground/40 uppercase tracking-wider">
                                  Time
                                </span>
                                <div className="flex items-center gap-1 text-foreground/80 font-bold bg-background px-2 py-0.5 rounded border border-foreground/5 text-[10.5px]">
                                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                                  <span>{formattedTime}</span>
                                </div>
                              </div>

                              {isCompleted ? (
                                <button
                                  onClick={() => {
                                    const isTeamEvent =
                                      match.tournamentType === 'TEAM_EVENT' ||
                                      match.tournamentType === 'TEAM_LEAGUE' ||
                                      match.status === 'WAITING_FOR_LINEUPS';
                                    if (isTeamEvent) {
                                      router.push(`/home/team-events/${match.uuid}/score`);
                                    } else {
                                      router.push(`/live-score/${match.uuid}`);
                                    }
                                  }}
                                  className="w-full py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Match Results</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const isTeamEvent =
                                      match.tournamentType === 'TEAM_EVENT' ||
                                      match.tournamentType === 'TEAM_LEAGUE' ||
                                      match.status === 'WAITING_FOR_LINEUPS';
                                    if (isTeamEvent) {
                                      router.push(`/home/team-events/${match.uuid}/score`);
                                      return;
                                    }

                                    const sport = match.sportType || 'Badminton';
                                    const teamAStr = match.teamAName
                                      ? encodeURIComponent(match.teamAName.replace(/\s*&\s*/g, ','))
                                      : '';
                                    const teamBStr = match.teamBName
                                      ? encodeURIComponent(match.teamBName.replace(/\s*&\s*/g, ','))
                                      : '';
                                    const teamANameStr = match.teamAName ? encodeURIComponent(match.teamAName) : '';
                                    const teamBNameStr = match.teamBName ? encodeURIComponent(match.teamBName) : '';
                                    const tournamentNameStr = match.tournamentName
                                      ? encodeURIComponent(match.tournamentName)
                                      : '';
                                    const courtNameStr = match.courtName
                                      ? encodeURIComponent(match.courtName)
                                      : match.courtId
                                        ? encodeURIComponent(`Court ${match.courtId}`)
                                        : '';

                                    router.push(
                                      `/match-setup?matchId=${match.uuid}&sport=${sport}&teamA=${teamAStr}&teamB=${teamBStr}&teamAName=${teamANameStr}&teamBName=${teamBNameStr}&tournamentName=${tournamentNameStr}&courtName=${courtNameStr}&fromUmpire=true`
                                    );
                                  }}
                                  className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm shadow-red-500/25 active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                                  <span>{isLive ? 'Resume Scoring' : 'Start Scoring'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - ULTRA STYLISH HORIZONTAL SCROLLING RAILS WITH SMOOTH NAV CONTROLS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen bg-background pb-20 w-full max-w-full overflow-x-hidden">
        {/* Desktop Ambient Hero Banner with Video & Profile Telemetry */}
        <section className="relative w-full border-b overflow-hidden bg-gradient-to-b from-card/60 via-card/30 to-background" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
            {/* Top-Level App Mode Switcher (ATHLON ↔ MARKET) */}
            <div className="mb-6 flex items-center justify-between">
              <div className="w-80">
                <AppModeSwitcher showNotifications={false} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 flex-wrap">
              {/* Profile Card Block */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl bg-surface border-2 overflow-hidden flex items-center justify-center shadow-md"
                    style={{ borderColor: 'var(--athlon-primary)' }}
                  >
                    <img src={personalProfile?.avatar || '/placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">{displayName}</h1>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-primary/15 text-primary border border-primary/30">
                      {athlonId}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 flex items-center gap-2">
                    <span>Personal Athlete Workspace</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Active &amp; Ready</span>
                  </p>
                </div>
              </div>

              {/* 3 Telemetry Metrics: Matches, Wins, Win Rate */}
              <div className="flex items-center gap-3">
                <div className="p-3 px-4 rounded-2xl border bg-surface/70 backdrop-blur-md flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-foreground/50">Matches</div>
                    <div className="text-lg font-black text-foreground font-mono">{playerStats?.totalMatches ?? 0}</div>
                  </div>
                </div>

                <div className="p-3 px-4 rounded-2xl border bg-surface/70 backdrop-blur-md flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-foreground/50">Wins</div>
                    <div className="text-lg font-black text-amber-400 font-mono">{playerStats?.matchesWon ?? 0}</div>
                  </div>
                </div>

                <div className="p-3 px-4 rounded-2xl border bg-surface/70 backdrop-blur-md flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-foreground/50">Win Rate</div>
                    <div className="text-lg font-black text-primary font-mono">
                      {playerStats?.winRate ? `${Math.round(playerStats.winRate)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.id}
                  className="p-3.5 rounded-2xl border flex items-center gap-3.5 bg-surface/50 hover:bg-surface hover:border-primary/40 transition-all group shadow-sm"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <Athlon3DIcon type={action.icon3d} size={32} active={true} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{action.label}</div>
                    <div className="text-[10px] text-foreground/50 truncate">{action.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/30 ml-auto group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Desktop Workspace Content with Full-Width Horizontal Scrolling Tracks */}
        <main className="max-w-7xl mx-auto px-8 py-8 space-y-10">
          {/* 🔍 DESKTOP DISCOVERY SEARCH & FILTRATION (SPORTS & LOCATION) */}
          <div
            className="p-6 rounded-[28px] border shadow-lg space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <h2 className="text-base font-black text-foreground">Explore Sports Ecosystem</h2>
                <p className="text-xs text-foreground/50">Search tournaments, turfs, academies, and live scores by sport and city</p>
              </div>
              {isFilteringActive && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <HomeSearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              availablePlaces={availablePlaces}
              totalResults={totalFilteredMatches}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Desktop Empty Results Card */}
          {isFilteringActive && totalFilteredMatches === 0 && (
            <div
              className="p-12 rounded-[28px] border border-dashed text-center space-y-4 shadow-sm"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <Search className="w-10 h-10 text-foreground/30 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-foreground">No matching events, venues, or academies found</h3>
                <p className="text-xs text-foreground/50 max-w-md mx-auto">
                  We couldn't find any results matching your search criteria. Try choosing a different sport or clearing your filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-primary text-black hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* ── SECTION 0: 🔴 LIVE PLAYER AUCTIONS (HORIZONTAL SCROLL) ── */}
          {filteredLiveAuctionChampionships.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                    Live Player Auction Arenas ({filteredLiveAuctionChampionships.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider mr-2">
                    🔴 Broadcasting Live
                  </span>
                  <button
                    onClick={() => scrollContainer(auctionsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(auctionsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={auctionsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredLiveAuctionChampionships.map((champ) => (
                  <div key={champ.championshipUuid} className="snap-start shrink-0 w-[380px]">
                    <div
                      className="block h-full rounded-[24px] border p-5 relative overflow-hidden transition-all hover:border-red-500/60 hover:shadow-xl group space-y-4 flex flex-col justify-between"
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
                        <span className="text-[11px] font-bold text-foreground/50 truncate max-w-[180px]">
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
                        className="p-3.5 rounded-2xl border flex items-center justify-between text-xs bg-surface/50"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-foreground/60 font-semibold">Franchises Competing:</span>
                        <span className="font-mono font-black text-primary">{champ.registeredTeamsCount || champ.maxTeams || 0} Teams</span>
                      </div>

                      <Link
                        href={`/home/team-championship/${champ.championshipUuid}/auction`}
                        className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
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

          {/* ── SECTION 1: 🔴 LIVE MATCH BROADCASTS (HORIZONTAL SCROLL) ── */}
          {filteredLiveScores.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                    Live Broadcast Center ({filteredLiveScores.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/live-score" className="text-xs font-bold text-red-500 hover:underline uppercase tracking-wider mr-2">
                    Live Scoreboard →
                  </Link>
                  <button
                    onClick={() => scrollContainer(liveScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(liveScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={liveScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredLiveScores.map((score) => {
                  const meta = score.scoreMeta || {};
                  const config = meta.config || {};
                  const teamAPlayers = config.teamA || [];
                  const teamBPlayers = config.teamB || [];
                  const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                  const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                  const gi = meta.currentGameIndex || 0;
                  const games = meta.games || [];
                  const cur = games[gi] || {};
                  const scoreA = cur.scoreA ?? (score.teamAScore || 0);
                  const scoreB = cur.scoreB ?? (score.teamBScore || 0);
                  const isServing = cur.currentServer;

                  return (
                    <div key={score.scoreId} className="snap-start shrink-0 w-[380px]">
                      <Link
                        href={`/live-score/${score.matchUuid}`}
                        className="block h-full rounded-[24px] border p-5 bg-card relative overflow-hidden transition-all hover:border-red-500/60 hover:shadow-xl group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <SportCardSkeletonBackground sport={config.sport || config.category || (score as any).sport || 'Badminton'} />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse z-10" />
                        <div className="flex items-center justify-between text-xs pb-3 border-b relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            Live Game {gi + 1}
                          </span>
                          <span className="text-[11px] font-bold text-foreground/50 truncate max-w-[180px]">
                            {config.courtName || 'Court Arena'}
                          </span>
                        </div>

                        <div className="p-4 my-3 rounded-2xl border space-y-3 bg-surface/50 relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${isServing === 'A' ? 'bg-emerald-500 text-black' : 'bg-foreground/10 text-foreground/60'}`}>
                                A
                              </span>
                              <span className="text-sm font-black text-foreground truncate">{teamAName}</span>
                            </div>
                            <span className={`text-2xl font-mono font-black ${Number(scoreA) > Number(scoreB) ? 'text-emerald-400' : 'text-foreground'}`}>
                              {scoreA}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${isServing === 'B' ? 'bg-amber-500 text-black' : 'bg-foreground/10 text-foreground/60'}`}>
                                B
                              </span>
                              <span className="text-sm font-black text-foreground truncate">{teamBName}</span>
                            </div>
                            <span className={`text-2xl font-mono font-black ${Number(scoreB) > Number(scoreA) ? 'text-amber-400' : 'text-foreground'}`}>
                              {scoreB}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 text-foreground/50">
                          <span className="truncate max-w-[200px]">{config.tournamentName || 'Tournament Match'}</span>
                          <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Enter Arena <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── SECTION 2: ⚠️ ACTION REQUIRED: PENDING LINEUPS (HORIZONTAL SCROLL) ── */}
          {pendingLineups.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-orange-500">
                  <AlertCircle className="w-5 h-5" />
                  <h2 className="text-base font-black uppercase tracking-wider">
                    Action Required: Captain Lineups ({pendingLineups.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(lineupsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(lineupsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={lineupsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {pendingLineups.map((match) => (
                  <div key={match.id} className="snap-start shrink-0 w-[360px]">
                    <div className="p-5 rounded-[24px] border space-y-3.5 bg-orange-500/5 border-orange-500/25 h-full flex flex-col justify-between shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Pending Lineup
                        </span>
                        <span className="text-xs text-foreground/50 font-bold">Team Tie Event</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          {match.teamAName && match.teamBName ? `${match.teamAName} vs ${match.teamBName}` : `Team Event #${match.id}`}
                        </h3>
                        <div className="text-xs text-foreground/60 flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{match.scheduledTime ? new Date(match.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Time TBA'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                        className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/25"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Submit Order of Play</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 3: 🛡️ FEATURED TEAM CHAMPIONSHIPS (HORIZONTAL SCROLL) ── */}
          {filteredChampionships.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Featured Team Championships ({filteredChampionships.length})
                    </h2>
                    <p className="text-xs text-foreground/50">Multi-category franchise leagues, live auctions, and team draft competitions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/tournaments" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    View All ({filteredChampionships.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(champsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(champsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={champsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredChampionships.map((c) => (
                  <div key={c.championshipId || c.championshipUuid} className="snap-start shrink-0 w-[360px]">
                    <PublicTeamChampionshipCard championship={c} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 4: 🏆 OPEN TOURNAMENTS (HORIZONTAL SCROLL) ── */}
          {filteredTournaments.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Open Tournaments ({filteredTournaments.length})
                    </h2>
                    <p className="text-xs text-foreground/50">Knockout, round-robin &amp; league championships open for registration</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/home/tournaments" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    View All ({filteredTournaments.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(tournsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(tournsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={tournsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredTournaments.map((t) => (
                  <div key={t.tournamentId || t.tournamentUuid} className="snap-start shrink-0 w-[360px]">
                    <PublicTournamentCard tournament={t} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION: 🏸 WEEKLY "LET'S PLAY" COMMUNITY SESSIONS (HORIZONTAL SCROLL) ── */}
          {filteredSessions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Weekly &quot;Let&apos;s Play&quot; Community Sessions ({filteredSessions.length})
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Casual games, open rosters &amp; weekly club runs. Joining automatically makes you part of the community!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(sessionsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(sessionsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={sessionsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredSessions.map((session) => (
                  <div key={session.sessionUuid} className="snap-start shrink-0 w-[350px]">
                    <CommunitySessionCard
                      session={session}
                      isLoggedIn={true}
                      onRsvp={handleSessionRsvp}
                      communityName={session.communityName || myCommunities.find((c) => c.communityUuid === session.communityUuid)?.name}
                      className="w-full h-full shadow-md"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION: 🗳️ ACTIVE MEMBER POLLS & VOTES (HORIZONTAL SCROLL) ── */}
          {memberPolls.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Vote className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Active Member Polls &amp; Votes ({memberPolls.length})
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Shape decisions, pick match days &amp; cast votes for communities you belong to!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(pollsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(pollsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={pollsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {memberPolls.map(({ poll, communityName }) => (
                  <div key={poll.pollId} className="snap-start shrink-0 w-[350px]">
                    <CommunityPollCard
                      poll={poll}
                      communityName={communityName}
                      onVote={handleMemberPollVote}
                      className="w-full h-full shadow-md"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 4.4: 🏟️ FEATURED SPORTS VENUES & TURFS (HORIZONTAL SCROLL) ── */}
          {filteredVenues.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Featured Sports Venues &amp; Turfs ({filteredVenues.length})
                    </h2>
                    <p className="text-xs text-foreground/50">Instant hourly court bookings, floodlit turfs, and multi-sport arenas</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/venues" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    Explore All Venues ({filteredVenues.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(venuesScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(venuesScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={venuesScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredVenues.map((venue: any) => (
                  <div key={venue.venueUuid || venue.venueId || venue.id} className="snap-start shrink-0 w-[360px]">
                    <VenueMarketplaceCard venue={venue} className="h-full" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 4.5: 🎓 FEATURED SPORTS ACADEMIES & TRAINING CENTERS ── */}
          {filteredAcademies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Featured Sports Academies & Training Centers ({filteredAcademies.length})
                    </h2>
                    <p className="text-xs text-foreground/50">Certified coaching batches, multi-court venues, and professional training</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/academies" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    Explore All Academies ({filteredAcademies.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(academiesScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(academiesScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={academiesScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredAcademies.map((acad: any) => (
                  <div key={acad.uuid || acad.id} className="snap-start shrink-0 w-[360px]">
                    <AcademyMarketplaceCard academy={acad} className="h-full" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 4.6: 🏅 PROFESSIONAL COACHES & MENTORS (HORIZONTAL SCROLL) ── */}
          {filteredCoaches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Professional Coaches &amp; Mentors ({filteredCoaches.length})
                    </h2>
                    <p className="text-xs text-foreground/50">Personal training, specialized drills, and private sparring sessions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/coaches" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    Explore All Coaches ({filteredCoaches.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(coachesScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(coachesScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={coachesScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredCoaches.map((coach: any) => (
                  <div key={coach.uuid || coach.id} className="snap-start shrink-0 w-[360px]">
                    <CoachMarketplaceCard coach={coach} className="h-full" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 5: 📅 MATCHES & UMPIRING (HORIZONTAL SCROLL) ── */}
          {(userMatches.length > 0 || umpireMatches.length > 0) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">Matches &amp; Umpiring</h2>
                    <p className="text-xs text-foreground/50">Your active matches, tie fixtures, and umpire assignments</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/home/matches" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    Full Calendar →
                  </Link>
                  <button
                    onClick={() => scrollContainer(schedScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(schedScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={schedScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {/* Umpire Matches */}
                {umpireMatches.map((match) => (
                  <div key={match.id || match.uuid} className="snap-start shrink-0 w-[360px]">
                    <div
                      className="p-5 rounded-[24px] border space-y-3.5 bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-lg"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-red-500 to-amber-500 absolute top-0 left-0 right-0" />
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/25">
                          Umpiring Assignment
                        </span>
                        <span className="font-mono text-[11px] text-foreground/60">{match.courtName || 'Court TBD'}</span>
                      </div>

                      <div className="text-sm font-black text-foreground">
                        {match.teamAName || 'Team A'} vs {match.teamBName || 'Team B'}
                      </div>

                      <button
                        onClick={() => {
                          const sport = match.sportType || 'Badminton';
                          const teamAStr = match.teamAName ? encodeURIComponent(match.teamAName.replace(/\s*(?:\/|&|\+|,|\band\b)\s*/g, ',')) : '';
                          const teamBStr = match.teamBName ? encodeURIComponent(match.teamBName.replace(/\s*(?:\/|&|\+|,|\band\b)\s*/g, ',')) : '';
                          router.push(`/match-setup?matchId=${match.uuid}&sport=${sport}&teamA=${teamAStr}&teamB=${teamBStr}&fromUmpire=true`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25 cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Start / Resume Digital Score</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Player Matches */}
                {userMatches.map((match) => (
                  <div key={match.id} className="snap-start shrink-0 w-[360px]">
                    <div
                      className="p-5 rounded-[24px] border space-y-3.5 bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-lg"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400 absolute top-0 left-0 right-0" />
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-bold text-primary truncate max-w-[200px]">{match.tournament}</span>
                        <span className="font-mono text-[11px] text-foreground/60">{match.court}</span>
                      </div>

                      <div className="text-sm font-black text-foreground">
                        {match.teamAName} vs {match.teamBName}
                      </div>

                      <div className="flex items-center justify-between text-xs text-foreground/60 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{match.date}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          {match.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 6: ✅ RECENT RESULTS (HORIZONTAL SCROLL) ── */}
          {filteredFinishedScores.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">
                      Recent Match Results ({filteredFinishedScores.length})
                    </h2>
                    <p className="text-xs text-foreground/50">Official scorecards and completed fixture results</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/live-score" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    All Results →
                  </Link>
                  <button
                    onClick={() => scrollContainer(resultsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(resultsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={resultsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {filteredFinishedScores.map((score) => {
                  const meta = score.scoreMeta || {};
                  const config = meta.config || {};
                  const teamAPlayers = config.teamA || [];
                  const teamBPlayers = config.teamB || [];
                  const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                  const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                  const games = meta.games || [];
                  const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                  const setsWonB = games.filter((g: any) => g.winner === 'B').length;

                  return (
                    <div key={score.scoreId} className="snap-start shrink-0 w-[360px]">
                      <Link
                        href={`/live-score/${score.matchUuid}`}
                        className="block h-full p-5 rounded-[24px] border bg-card space-y-3.5 hover:border-primary/50 transition-all shadow-lg group relative overflow-hidden"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <SportCardSkeletonBackground sport={config.sport || config.category || (score as any).sport || 'Badminton'} />
                        <div className="flex items-center justify-between text-xs relative z-10">
                          <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase">
                            Finished
                          </span>
                          <span className="text-[11px] text-foreground/50 truncate max-w-[180px]">{config.tournamentName || 'Tournament'}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl border space-y-2 bg-surface/50 relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-foreground truncate">{teamAName}</span>
                            <span className="font-mono font-black text-sm text-primary">{setsWonA}</span>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border)' }}>
                            <span className="text-xs font-black text-foreground truncate">{teamBName}</span>
                            <span className="font-mono font-black text-sm text-primary">{setsWonB}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-1 relative z-10">
                          <span>Scorecard View</span>
                          <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── MANAGED WORKSPACES ── */}
          {organizations.length > 0 && (
            <section
              className="p-6 rounded-[28px] border space-y-4 shadow-lg"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-black text-foreground">Managed Clubs, Academies &amp; Workspaces</h2>
                </div>
                <Link href="/subscription" className="text-xs font-bold text-primary hover:underline">
                  + Add Workspace
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => selectRole(org.id)}
                    className="p-4 rounded-2xl border flex items-center justify-between text-left hover:border-primary/50 transition-all bg-surface/40 group"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        {orgIcon(org.type, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-foreground truncate">{org.name}</div>
                        <div className="text-[10px] text-foreground/50 uppercase font-bold">
                          {org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER' ? 'Venue Manager' : org.type === 'COACH' ? 'Freelance Coach' : org.type}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
