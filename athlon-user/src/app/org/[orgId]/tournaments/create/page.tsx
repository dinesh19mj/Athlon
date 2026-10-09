'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ImageIcon,
  X,
  Trophy,
  Shield,
  ShieldCheck,
  Globe,
  Lock,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Activity,
  Plus,
  Trash2,
  QrCode,
  Users,
  Minus,
  Tag,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { TournamentService, CategoryService, SportMetadataService, SportMetadata } from '@/lib/api/tournaments';
import { TeamEventCategoryBuilder, TeamEventCategoryConfig } from '@/components/tournaments/teamevent/TeamEventCategoryBuilder';
import { OrganizationService } from '@/lib/api/organization';
import { LocationService, StateItem, DistrictItem, FALLBACK_INDIAN_STATES, FALLBACK_STATE_DISTRICTS } from '@/lib/api/location';
import { AcademyService, AcademyCentre } from '@/lib/api/academy';
import { AcademyStudentService, AcademyBatch } from '@/lib/api/academyStudent';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgSports, getSportEmoji } from '@/lib/hooks/useOrgSports';

interface TournamentCategoryItem {
  id: string;
  name: string;
  maxTeams?: number | string;
}

interface SportConfig {
  name: string;
  matchFormats: string[];
  categoryPresets: string[];
  defaultMatchFormat: string;
  defaultCategoryPreset: string;
  supportsMultiCategory: boolean;
  defaultCustomCategories?: TournamentCategoryItem[];
}

const DEFAULT_SPORT_CONFIG: SportConfig = {
  name: 'Sport',
  matchFormats: ['Standard Match', 'Singles', 'Doubles', 'Team Event', 'Open Format'],
  categoryPresets: [],
  defaultMatchFormat: 'Standard Match',
  defaultCategoryPreset: '',
  supportsMultiCategory: true,
  defaultCustomCategories: [],
};

const getSportConfig = (sportName: string, sportsMap: Record<string, SportConfig> = {}): SportConfig => {
  const normalizedKey = Object.keys(sportsMap).find(
    (k) => k.toLowerCase() === (sportName || '').trim().toLowerCase()
  );
  if (normalizedKey && sportsMap[normalizedKey]) {
    return sportsMap[normalizedKey];
  }
  return {
    ...DEFAULT_SPORT_CONFIG,
    name: sportName || 'Sport',
  };
};

const getFormatsForSport = (sportName: string, sportsMap: Record<string, SportConfig> = {}): string[] => {
  return getSportConfig(sportName, sportsMap).matchFormats;
};

const getCategoryPresetsForSport = (sportName: string, sportsMap: Record<string, SportConfig> = {}): string[] => {
  return getSportConfig(sportName, sportsMap).categoryPresets;
};

const isSportMultiCategoryAllowed = (sportName: string, sportsMap: Record<string, SportConfig> = {}): boolean => {
  return getSportConfig(sportName, sportsMap).supportsMultiCategory;
};

const getDefaultCustomCatsForSport = (sportName: string, sportsMap: Record<string, SportConfig> = {}): TournamentCategoryItem[] => {
  const config = getSportConfig(sportName, sportsMap);
  if (config.defaultCustomCategories && config.defaultCustomCategories.length > 0) {
    return config.defaultCustomCategories.map((c, idx) => ({
      id: `${Date.now()}_${idx}`,
      name: c.name,
      maxTeams: c.maxTeams,
    }));
  }
  return [];
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const orgUuid = params.orgId as string;
  const { sports: orgSports } = useOrgSports(orgUuid);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const desktopPosterInputRef = useRef<HTMLInputElement>(null);

  const { userId, userUuid } = useAuthStore();
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg =
    organizations.find((o) => o.id === orgUuid) ||
    getActiveOrganization() ||
    { id: orgUuid, name: 'Organization', type: 'ORGANIZER' };

  const isAcademy = activeOrg.type === 'ACADEMY';
  const isClub = activeOrg.type === 'CLUB';
  const isInternalOrg = isAcademy || isClub;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgCategories, setOrgCategories] = useState<any[]>([]);
  const [commonCategories, setCommonCategories] = useState<any[]>([]);

  // Academy venue & batch targeting states
  const [academyCentres, setAcademyCentres] = useState<AcademyCentre[]>([]);
  const [academyBatches, setAcademyBatches] = useState<AcademyBatch[]>([]);
  const [targetCentreUuid, setTargetCentreUuid] = useState<string>('ALL');
  const [targetBatchUuids, setTargetBatchUuids] = useState<string[]>([]);
  const [targetLevels, setTargetLevels] = useState<string[]>([]);

  // Dynamic Organizer Categories & Modal State
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySport, setNewCategorySport] = useState('Badminton');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // 1. Fetch system common categories from tournament_category table
        try {
          const commonRes: any = await CategoryService.getCommonCategories();
          const commonList = Array.isArray(commonRes?.data?.data)
            ? commonRes.data.data
            : Array.isArray(commonRes?.data)
              ? commonRes.data
              : Array.isArray(commonRes)
                ? commonRes
                : [];
          if (commonList.length > 0) setCommonCategories(commonList);
        } catch (e) {
          console.warn('Failed to load common categories from DB', e);
        }

        // 2. Fetch organization-specific categories
        const orgResponse = await OrganizationService.getById(orgUuid);
        const orgData = orgResponse.data;
        if (orgData && orgData.orgId) {
          const catResponse: any = await CategoryService.getByOrg(orgData.orgId);
          const list = Array.isArray(catResponse?.data?.data)
            ? catResponse.data.data
            : Array.isArray(catResponse?.data)
              ? catResponse.data
              : [];
          if (list.length > 0) setOrgCategories(list);
        } else {
          const catResponse: any = await CategoryService.getByOrgUuid(orgUuid);
          const list = Array.isArray(catResponse?.data?.data)
            ? catResponse.data.data
            : Array.isArray(catResponse?.data)
              ? catResponse.data
              : [];
          if (list.length > 0) setOrgCategories(list);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    loadCategories();

    if (activeOrg.type === 'ACADEMY') {
      const loadAcademyDetails = async () => {
        try {
          const [centres, batches] = await Promise.allSettled([
            AcademyService.getCentres(orgUuid),
            AcademyStudentService.getBatches(orgUuid),
          ]);
          if (centres.status === 'fulfilled') setAcademyCentres(centres.value || []);
          if (batches.status === 'fulfilled') setAcademyBatches(batches.value || []);
        } catch (e) {
          console.warn('Failed to load academy details', e);
        }
      };
      loadAcademyDetails();
    }
  }, [orgUuid, activeOrg.type]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'PRIVATE',
    location: '',
    state: '',
    district: '',
    city: '',
    mapLink: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    registrationClosingDate: '',
    registrationClosingTime: '',
    tournamentType: 'KNOCKOUT',
    sport: 'Badminton',
    category: '',
    categories: [] as string[],
    matchFormat: "Men's Singles",
    matchFormats: [] as string[],
    teamCount: '',
    playersCount: '',
    registrationFees: '',
    gpayNumber: '',
    description: '',
    contactPhone: '',
    teamEventCategories: [] as TeamEventCategoryConfig[],
    registrationMode: 'PUBLIC',
  });

  const [statesList, setStatesList] = useState<string[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);

  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await LocationService.getAllStates();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((s: StateItem) => s.name))).sort() as string[];
          setStatesList(names);
        } else {
          setStatesList(FALLBACK_INDIAN_STATES);
        }
      } catch {
        setStatesList(FALLBACK_INDIAN_STATES);
      }
    }
    fetchStates();
  }, []);

  useEffect(() => {
    if (!formData.state) {
      setDistrictsList([]);
      return;
    }
    async function fetchDistricts() {
      try {
        setLoadingDistricts(true);
        const res = await LocationService.getDistrictsByStateName(formData.state);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((d: DistrictItem) => d.name))).sort() as string[];
          setDistrictsList(names);
        } else {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[formData.state] || []);
        }
      } catch {
        setDistrictsList(FALLBACK_STATE_DISTRICTS[formData.state] || []);
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, [formData.state]);

  const [isMultiCategory, setIsMultiCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<TournamentCategoryItem[]>([]);

  const [dynamicSportsMap, setDynamicSportsMap] = useState<Record<string, SportConfig>>({});

  useEffect(() => {
    const fetchDynamicMetadata = async () => {
      try {
        const res: any = await SportMetadataService.getAllSports();
        const sportsData: any[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        if (Array.isArray(sportsData) && sportsData.length > 0) {
          const map: Record<string, SportConfig> = {};
          sportsData.forEach((s: any) => {
            const formatNames: string[] = Array.isArray(s.formats)
              ? s.formats.map((f: any) => f.formatName)
              : [];
            map[s.sportName] = {
              name: s.sportName,
              matchFormats:
                formatNames.length > 0
                  ? formatNames
                  : DEFAULT_SPORT_CONFIG.matchFormats,
              categoryPresets: [],
              defaultMatchFormat: s.defaultFormat || (formatNames[0] || 'Standard Match'),
              defaultCategoryPreset: '',
              supportsMultiCategory: s.supportsMultiCategory !== undefined ? !!s.supportsMultiCategory : true,
              defaultCustomCategories: [],
            };
          });
          setDynamicSportsMap(map);
        }
      } catch (err) {
        console.warn('Using fallback for sport metadata', err);
      }
    };
    fetchDynamicMetadata();
  }, []);

  const resolveSportConfig = (sportName: string): SportConfig => {
    return getSportConfig(sportName, dynamicSportsMap);
  };

  const getFormatsForSport = (sportName: string): string[] => {
    return resolveSportConfig(sportName).matchFormats;
  };

  const getCategoryPresetsForSport = (sportName: string): string[] => {
    const normalizedSport = (sportName || '').toLowerCase().trim();
    const fromDb = commonCategories
      .filter((c) => {
        const catSport = (c.sportType || 'ALL').toLowerCase().trim();
        return catSport === 'all' || catSport === normalizedSport;
      })
      .map((c) => c.categoryName)
      .filter(Boolean);

    return Array.from(new Set(fromDb));
  };

  const isSportMultiCategoryAllowed = (sportName: string): boolean => {
    return resolveSportConfig(sportName).supportsMultiCategory;
  };

  const getDefaultCustomCatsForSport = (sportName: string): TournamentCategoryItem[] => {
    const config = resolveSportConfig(sportName);
    if (config.defaultCustomCategories && config.defaultCustomCategories.length > 0) {
      return config.defaultCustomCategories.map((c, idx) => ({
        id: `${Date.now()}_${idx}`,
        name: c.name,
        maxTeams: c.maxTeams,
      }));
    }
    return [];
  };

  const handleSportChange = (sport: string) => {
    const config = resolveSportConfig(sport);
    const isBadminton = sport.toLowerCase() === 'badminton';
    const newFormat = isBadminton ? "Men's Singles" : config.defaultMatchFormat;

    setFormData((prev) => ({
      ...prev,
      sport,
      matchFormat: newFormat,
      category: '',
    }));

    if (!config.supportsMultiCategory) {
      setIsMultiCategory(false);
    }

    setCustomCategories(getDefaultCustomCatsForSport(sport));
  };

  const addCategoryItem = (name = '', maxTeams: number | string = 16) => {
    setCustomCategories((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        maxTeams,
      },
    ]);
  };

  const removeCategoryItem = (id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCategoryItem = (id: string, field: keyof TournamentCategoryItem, value: any) => {
    setCustomCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setIsSavingCategory(true);
      const orgResponse = await OrganizationService.getById(orgUuid);
      const orgData = orgResponse.data;
      if (!orgData?.orgId) throw new Error('Organization not found');

      const targetSport = newCategorySport || formData.sport || 'Badminton';
      const catName = newCategoryName.trim();

      const res = await CategoryService.create({
        organizationId: orgData.orgId,
        organizationUuid: orgUuid,
        sportType: targetSport,
        categoryName: catName,
        createdBy: userId ? Number(userId) : 0,
      });

      const created = res.data?.data || res.data || {
        categoryUuid: String(Date.now()),
        categoryName: catName,
        sportType: targetSport,
      };

      setOrgCategories((prev) => [
        created,
        ...prev.filter(
          (c) =>
            (c.categoryName || '').toLowerCase() !== catName.toLowerCase()
        ),
      ]);
      setFormData((prev) => ({ ...prev, category: catName }));

      // Also add as tier if in multi-category mode
      if (isMultiCategory) {
        setCustomCategories((prev) => {
          if (!prev.some((c) => c.name.toLowerCase() === catName.toLowerCase())) {
            return [...prev, { id: Date.now().toString(), name: catName, maxTeams: 16 }];
          }
          return prev;
        });
      }

      setNewCategoryName('');
      setIsCreateCategoryModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create category', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to create category';
      alert(msg);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const qrCodeInputRef = useRef<HTMLInputElement>(null);
  const desktopQrCodeInputRef = useRef<HTMLInputElement>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrCodeFile(file);
    const reader = new FileReader();
    reader.onload = () => setQrCodePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isFormValid = !!(
    formData.name.trim() &&
    formData.startDate &&
    formData.endDate
  );

  const filledCount = [
    formData.name.trim(),
    formData.startDate,
    formData.endDate,
    formData.sport,
    formData.location,
    formData.contactPhone,
    formData.registrationFees,
  ].filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((filledCount / 7) * 100));

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const orgResponse = await OrganizationService.getById(orgUuid);
      const orgData = orgResponse.data;

      if (!orgData || !orgData.orgId) {
        throw new Error('Could not load organization details.');
      }

      let finalDescription = formData.description || '';
      let finalLocation = formData.location;
      if (activeOrg.type === 'ACADEMY') {
        const selectedCentre = academyCentres.find((c) => c.centreUuid === targetCentreUuid);
        if (selectedCentre && !finalLocation) {
          finalLocation = selectedCentre.name;
        }
        const metadata = {
          academyOrgUuid: orgUuid,
          centreUuid: targetCentreUuid,
          centreName: selectedCentre ? selectedCentre.name : 'All Venues',
          targetBatchUuids,
          targetBatchNames: academyBatches
            .filter((b) => targetBatchUuids.includes(b.batchUuid))
            .map((b) => b.batchName),
          targetLevels,
        };
        finalDescription = `${finalDescription}\n\n[ACADEMY_INTERNAL_CONFIG:${JSON.stringify(metadata)}]`.trim();
      }

      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', finalDescription);

      const startDateTime = formData.startDate
        ? `${formData.startDate}T${formData.startTime || '00:00'}:00`
        : '';
      if (startDateTime) form.append('startDate', startDateTime);

      const endDateTime = formData.endDate
        ? `${formData.endDate}T${formData.endTime || '00:00'}:00`
        : '';
      if (endDateTime) form.append('endDate', endDateTime);

      const registrationClosingDateTime = formData.registrationClosingDate
        ? `${formData.registrationClosingDate}T${formData.registrationClosingTime || '23:59'}:00`
        : '';
      if (registrationClosingDateTime) form.append('registrationClosingDate', registrationClosingDateTime);

      form.append('tournamentType', formData.tournamentType);
      form.append('sport', formData.sport);
      const multiCategoryActive =
        isSportMultiCategoryAllowed(formData.sport) && isMultiCategory && customCategories.length > 0;

      if (formData.tournamentType === 'TEAM_EVENT') {
        form.append('teamEventCategories', JSON.stringify(formData.teamEventCategories));
      } else if (multiCategoryActive) {
        const categoryNames = customCategories.map((c) => c.name.trim()).filter(Boolean).join(', ');
        form.append('category', categoryNames || 'Open');
        form.append('matchFormat', formData.matchFormat);
        const totalTeams = customCategories.reduce((sum, c) => sum + (Number(c.maxTeams) || 0), 0);
        if (totalTeams > 0) {
          form.append('teamCount', totalTeams.toString());
          form.append('playersCount', totalTeams.toString());
        }
      } else {
        form.append('matchFormat', formData.matchFormat);
        form.append('category', formData.category || 'Open');
        const limit = formData.teamCount || formData.playersCount;
        if (limit) {
          form.append('teamCount', limit.toString());
          form.append('playersCount', limit.toString());
        }
      }
      form.append('visibility', isInternalOrg ? 'PRIVATE' : formData.type);
      form.append('registrationMode', formData.registrationMode || 'PUBLIC');
      form.append('location', finalLocation);
      if (formData.state) form.append('state', formData.state);
      if (formData.district) form.append('district', formData.district);
      if (formData.city) form.append('city', formData.city);
      if (formData.mapLink) form.append('mapLink', formData.mapLink);
      if (formData.contactPhone) form.append('contactPhone', formData.contactPhone);
      if (formData.gpayNumber) form.append('gpayNumber', formData.gpayNumber.trim());
      if (formData.registrationFees) form.append('registrationFees', formData.registrationFees);

      form.append('organizerId', orgData.orgId.toString());
      form.append('organizerUuid', orgUuid);

      if (userId) form.append('userId', userId.toString());
      if (userUuid) form.append('userUuid', userUuid);
      if (userId) form.append('createdBy', userId.toString());

      if (posterFile) {
        form.append('poster', posterFile);
      }

      if (qrCodeFile) {
        form.append('upiQrCode', qrCodeFile);
      }

      await TournamentService.create(form);
      router.push(`/org/${orgUuid}/tournaments`);
    } catch (error: any) {
      console.error('Failed to create tournament', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to create tournament. Please check required fields.';
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-foreground/15 text-sm font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-card placeholder:text-foreground/30';
  const labelClass = 'block text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-2';

  const desktopInputClass =
    'w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30';
  const desktopLabelClass = 'block text-xs font-black uppercase tracking-wider text-foreground/60 mb-2';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - THEME-ADAPTIVE MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-36">
        {/* Sticky Athletic Top Header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-foreground/10 shadow-xs">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/org/${orgUuid}/tournaments`}
                className="w-9 h-9 rounded-full bg-card border border-foreground/10 flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 transition-all shadow-xs"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h1 className="text-xs font-black uppercase tracking-widest text-foreground">
                    Create Tournament
                  </h1>
                </div>
                <p className="text-[10px] text-foreground/50 font-medium">
                  {activeOrg.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary font-mono">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="h-0.5 w-full bg-foreground/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="px-4 pt-5 space-y-6 max-w-xl mx-auto">
          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 1: EVENT SCOPE & REGISTRATION MODE
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Access &amp; Registration
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Configure event visibility and entry mode
                </p>
              </div>
            </div>

            {/* Visibility Selector */}
            {!isInternalOrg ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block">
                  Event Visibility
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      value: 'PRIVATE',
                      label: 'Private (Invite Only)',
                      desc: 'Only players with a direct invite or link can view',
                      icon: Lock,
                    },
                    {
                      value: 'PUBLIC',
                      label: 'Public Open',
                      desc: 'Listed on public discovery for all athletes to join',
                      icon: Globe,
                    },
                  ].map((opt) => {
                    const isSelected = formData.type === opt.value;
                    const IconComp = opt.icon;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setFormData({ ...formData, type: opt.value })}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${isSelected
                          ? 'border-primary bg-primary/10 shadow-xs'
                          : 'border-foreground/10 bg-card hover:border-foreground/20'
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary text-black' : 'bg-foreground/5 text-foreground/60'
                            }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {opt.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[10.5px] text-foreground/60 mt-0.5 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Event Scope
                </label>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-primary/30 bg-primary/10">
                  <div className="w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-primary flex items-center gap-1.5">
                      <span>{isClub ? 'Internal Club Tournament' : 'Internal Academy Tournament'}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-primary/20 text-primary uppercase">
                        Private
                      </span>
                    </div>
                    <div className="text-[10.5px] text-foreground/60 mt-0.5">
                      {isClub
                        ? 'Exclusively for registered club members in this club'
                        : 'Exclusively for enrolled academy students & coaches in this academy'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Mode */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block">
                Participant Registration Mode
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    value: 'PUBLIC',
                    label: 'Public Online Registration',
                    desc: 'Players & teams register online directly via public link',
                    icon: Users,
                  },
                  {
                    value: 'ORGANIZER_MANAGED',
                    label: 'Organizer Managed (Manual Entry)',
                    desc: 'Organizer manually adds players/teams. No public registration.',
                    icon: ShieldCheck,
                  },
                ].map((opt) => {
                  const isSelected = formData.registrationMode === opt.value;
                  const IconComp = opt.icon;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, registrationMode: opt.value })}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${isSelected
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-foreground/10 bg-card hover:border-foreground/20'
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary text-black' : 'bg-foreground/5 text-foreground/60'
                          }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {opt.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[10.5px] text-foreground/60 mt-0.5 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academy Targeting (If Academy Workspace) */}
            {activeOrg.type === 'ACADEMY' && (
              <div className="p-3.5 rounded-2xl border bg-primary/5 border-primary/20 space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-foreground">Academy Venue &amp; Batch Targeting</h4>
                    <p className="text-[9.5px] text-foreground/50">Restricts view &amp; registration to specific cohorts</p>
                  </div>
                </div>

                {/* Venue / Campus */}
                <div>
                  <label className="text-[9px] font-black uppercase text-foreground/50 block mb-1">Target Campus</label>
                  <select
                    value={targetCentreUuid}
                    onChange={(e) => {
                      setTargetCentreUuid(e.target.value);
                      const sel = academyCentres.find((c) => c.centreUuid === e.target.value);
                      if (sel && !formData.location) {
                        setFormData({ ...formData, location: sel.name });
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="ALL">All Academy Campuses ({academyCentres.length})</option>
                    {academyCentres.map((c) => (
                      <option key={c.centreUuid} value={c.centreUuid}>
                        {c.name} {c.city ? `(${c.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batches */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] font-black uppercase text-foreground/50">Target Batches</label>
                    <span className="text-[9px] text-primary font-bold">
                      {targetBatchUuids.length === 0 ? 'All Batches' : `${targetBatchUuids.length} Selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetBatchUuids([])}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${targetBatchUuids.length === 0
                        ? 'bg-primary text-black border-primary font-black'
                        : 'border-foreground/15 bg-card text-foreground/70'
                        }`}
                    >
                      All Batches
                    </button>
                    {academyBatches.map((b) => {
                      const isSel = targetBatchUuids.includes(b.batchUuid);
                      return (
                        <button
                          key={b.batchUuid}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setTargetBatchUuids((prev) => prev.filter((id) => id !== b.batchUuid));
                            } else {
                              setTargetBatchUuids((prev) => [...prev, b.batchUuid]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${isSel
                            ? 'bg-primary text-black border-primary font-black'
                            : 'border-foreground/15 bg-card text-foreground/70'
                            }`}
                        >
                          {b.batchName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skill Levels */}
                <div>
                  <label className="text-[9px] font-black uppercase text-foreground/50 block mb-1">Eligible Skill Levels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'].map((lvl) => {
                      const isSel = targetLevels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setTargetLevels((prev) => prev.filter((l) => l !== lvl));
                            } else {
                              setTargetLevels((prev) => [...prev, lvl]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${isSel
                            ? 'bg-primary text-black border-primary font-black'
                            : 'border-foreground/15 bg-card text-foreground/70'
                            }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 2: TOURNAMENT IDENTITY & SPORT DISCIPLINE
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Event Identity &amp; Discipline
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Name, sport discipline, and match draw format
                </p>
              </div>
            </div>

            {/* Tournament Name */}
            <div>
              <label className={labelClass}>
                Tournament Title <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`${inputClass} pl-10`}
                  placeholder="e.g. State Open Championship 2026"
                />
              </div>
            </div>

            {/* Sport Selector Chips */}
            <div>
              <label className={labelClass}>
                Sport Discipline <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {orgSports.map((sport) => {
                  const isSelected = formData.sport.toLowerCase() === sport.toLowerCase();
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleSportChange(sport)}
                      className={`p-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center gap-2 text-left cursor-pointer ${isSelected
                        ? 'border-primary bg-primary/15 text-primary shadow-xs'
                        : 'border-foreground/10 bg-card text-foreground/70 hover:border-foreground/25 hover:text-foreground'
                        }`}
                    >
                      <span className="text-base shrink-0">{getSportEmoji(sport)}</span>
                      <span className="truncate">{sport}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tournament Draw Format */}
            <div>
              <label className={labelClass}>
                Draw Format <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'KNOCKOUT', label: 'Knockout', icon: Zap },
                  { value: 'LEAGUE', label: 'Pool League', icon: Trophy },
                ].map((fmt) => {
                  const isSelected = formData.tournamentType === fmt.value;
                  const IconComp = fmt.icon;
                  return (
                    <button
                      key={fmt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tournamentType: fmt.value })}
                      className={`py-3 px-3 rounded-2xl border-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isSelected
                        ? 'border-primary bg-primary/15 text-primary shadow-xs'
                        : 'border-foreground/10 bg-card text-foreground/60 hover:border-foreground/25'
                        }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match Format */}
            <div>
              <label className={labelClass}>
                Match Format <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.matchFormat}
                  onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer pr-10`}
                >
                  {getFormatsForSport(formData.sport).map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 3: VENUE, LOCATION & LOGISTICS
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Venue &amp; Location
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Address, state/district, and Google Maps pin
                </p>
              </div>
            </div>

            {/* Venue Address */}
            <div>
              <label className={labelClass}>
                Venue / Arena Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`${inputClass} pl-10`}
                  placeholder="e.g. Central Sports Complex, Court 1-4"
                />
              </div>
            </div>

            {/* State & District & City Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* State */}
              <div>
                <label className={labelClass}>State</label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        state: newState,
                        district: '',
                      }));
                    }}
                    className={`${inputClass} appearance-none cursor-pointer pr-8 text-xs`}
                  >
                    <option value="">Select State</option>
                    {statesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                </div>
              </div>

              {/* District */}
              <div>
                <label className={labelClass}>District</label>
                <div className="relative">
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                    disabled={!formData.state || loadingDistricts}
                    className={`${inputClass} appearance-none cursor-pointer pr-8 text-xs disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {!formData.state
                        ? 'Select State 1st'
                        : loadingDistricts
                          ? 'Loading...'
                          : 'Select District'}
                    </option>
                    {districtsList.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                </div>
              </div>

              {/* City */}
              <div>
                <label className={labelClass}>City / Area</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className={`${inputClass} text-xs`}
                  placeholder="e.g. Kazhakootam, T. Nagar..."
                />
              </div>
            </div>

            {/* Google Map Link */}
            <div>
              <label className={labelClass}>Google Maps Pin URL (Optional)</label>
              <div className="relative">
                <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="url"
                  value={formData.mapLink}
                  onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                  className={`${inputClass} pl-10 text-xs`}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              {formData.mapLink && (
                <a
                  href={formData.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Google Maps Location</span>
                </a>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 4: TIMELINE & SCHEDULE
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-500 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Schedule &amp; Timelines
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Tournament dates, timings, and registration lock deadline
                </p>
              </div>
            </div>

            {/* Tournament Start Date & Time */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                Tournament Start <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-card border border-foreground/15 rounded-xl pl-9 pr-2.5 py-2.5 text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-5 relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-card border border-foreground/15 rounded-xl pl-8 pr-2 py-2.5 text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Tournament End Date & Time */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                Tournament End <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-card border border-foreground/15 rounded-xl pl-9 pr-2.5 py-2.5 text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-5 relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-card border border-foreground/15 rounded-xl pl-8 pr-2 py-2.5 text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Registration Closing Deadline */}
            <div className="space-y-1.5 pt-1">
              <label className={labelClass}>Registration Closing Deadline (Optional)</label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-7 relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="date"
                    value={formData.registrationClosingDate}
                    onChange={(e) => setFormData({ ...formData, registrationClosingDate: e.target.value })}
                    className="w-full bg-card border border-foreground/15 rounded-xl pl-9 pr-2.5 py-2.5 text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-5 relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
                  <input
                    type="time"
                    value={formData.registrationClosingTime}
                    onChange={(e) => setFormData({ ...formData, registrationClosingTime: e.target.value })}
                    className="w-full bg-card border border-foreground/15 rounded-xl pl-8 pr-2 py-2.5 text-foreground text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <p className="text-[10px] text-foreground/50 mt-1">
                Registrations will automatically lock after this date and time.
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 5: TOURNAMENT POSTER
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-500 shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Tournament Poster
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Official tournament graphic for posters &amp; social links
                </p>
              </div>
            </div>

            <input ref={posterInputRef} type="file" accept="image/*" onChange={handlePosterChange} className="hidden" />
            {posterPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-foreground/15 aspect-[16/8] shadow-md group">
                <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => posterInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-bold hover:bg-white/30 transition-all"
                  >
                    Change Poster
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPosterPreview(null);
                      setPosterFile(null);
                    }}
                    className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => posterInputRef.current?.click()}
                className="w-full bg-card border-2 border-dashed border-foreground/15 rounded-2xl py-7 flex flex-col items-center gap-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ImageIcon className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-black text-foreground/80 group-hover:text-foreground transition-colors">
                    Tap to upload tournament poster
                  </div>
                  <div className="text-[10px] text-foreground/40 mt-0.5">JPG, PNG or WEBP · Max 5MB</div>
                </div>
              </button>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 6: CATEGORY SETUP & DRAW CAPACITY
             ════════════════════════════════════════════════════════════════ */}
          {formData.tournamentType !== 'TEAM_EVENT' ? (
            <div
              className="p-5 rounded-3xl border space-y-4 shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Header & Mode Switcher */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-black uppercase tracking-wider text-foreground block leading-tight">
                      Category Setup
                    </h2>
                    <p className="text-[10px] text-foreground/50 font-medium truncate block leading-tight">
                      {isSportMultiCategoryAllowed(formData.sport) && isMultiCategory
                        ? 'Multi-Tier draws'
                        : 'Single category format'}
                    </p>
                  </div>
                </div>

                {isSportMultiCategoryAllowed(formData.sport) ? (
                  <div
                    className="flex items-center p-0.5 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsMultiCategory(false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${!isMultiCategory
                        ? 'bg-primary text-black font-black shadow-2xs'
                        : 'text-foreground/50 hover:text-foreground'
                        }`}
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMultiCategory(true)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${isMultiCategory
                        ? 'bg-primary text-black font-black shadow-2xs'
                        : 'text-foreground/50 hover:text-foreground'
                        }`}
                    >
                      Multi-Tier
                    </button>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    Single Category
                  </span>
                )}
              </div>

              {(!isSportMultiCategoryAllowed(formData.sport) || !isMultiCategory) ? (
                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass}>Category Tier</label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCategorySport(formData.sport);
                          setIsCreateCategoryModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Category
                      </button>
                    </div>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          if (e.target.value === '__CREATE_NEW__') {
                            setNewCategorySport(formData.sport);
                            setIsCreateCategoryModalOpen(true);
                            return;
                          }
                          setFormData({ ...formData, category: e.target.value });
                        }}
                        className={`${inputClass} appearance-none cursor-pointer pr-10`}
                        disabled={!formData.sport}
                      >
                        <option value="">Select Category</option>
                        {/* Organization Custom Categories (Dynamically saved in DB) */}
                        {orgCategories.filter((c) => !c.sportType || c.sportType.toLowerCase() === (formData.sport || '').toLowerCase()).length > 0 && (
                          <optgroup label="🏢 Organization Categories">
                            {orgCategories
                              .filter((c) => !c.sportType || c.sportType.toLowerCase() === (formData.sport || '').toLowerCase())
                              .map((c) => (
                                <option key={c.categoryUuid || c.categoryId || c.categoryName} value={c.categoryName}>
                                  {c.categoryName}
                                </option>
                              ))}
                          </optgroup>
                        )}
                        {/* Common Standard Categories from tournament_category table */}
                        {getCategoryPresetsForSport(formData.sport).filter((preset) => !orgCategories.some((c) => (c.categoryName || '').toLowerCase() === preset.toLowerCase())).length > 0 && (
                          <optgroup label="🏆 Common Standard Categories">
                            {getCategoryPresetsForSport(formData.sport)
                              .filter((preset) => !orgCategories.some((c) => (c.categoryName || '').toLowerCase() === preset.toLowerCase()))
                              .map((preset) => (
                                <option key={preset} value={preset}>
                                  {preset}
                                </option>
                              ))}
                          </optgroup>
                        )}
                        <option value="__CREATE_NEW__">➕ Add New Category...</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Max Teams Limit (Optional) */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass}>
                        Max Teams Limit (Optional)
                      </label>
                      <span className="text-[9.5px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        {formData.teamCount ? `${formData.teamCount} Teams Max` : 'Unlimited Entry'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="2"
                      value={formData.teamCount}
                      onChange={(e) => setFormData({ ...formData, teamCount: e.target.value })}
                      placeholder="e.g. 16, 32 or leave blank for unlimited"
                      className={`${inputClass} font-mono`}
                    />
                    <p className="text-[10px] text-foreground/45 mt-1">
                      Leave empty to accept unlimited team registrations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div
                    className="p-3 rounded-2xl border flex items-center justify-between gap-2 shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-primary-soft)',
                      borderColor: 'var(--athlon-primary)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-foreground">
                        {customCategories.length} Categories
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary font-black rounded-md border border-primary/30 uppercase">
                        {formData.matchFormat || 'Format'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        addCategoryItem(
                          `Category ${String.fromCharCode(65 + customCategories.length)}`
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-primary text-black text-[11px] font-black uppercase flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  {/* Category Cards */}
                  <div className="space-y-2.5">
                    {customCategories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-2xl border space-y-3 transition-all relative shadow-xs"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-md border flex items-center justify-center font-mono font-black text-[10px] text-primary"
                              style={{
                                backgroundColor: 'var(--athlon-primary-soft)',
                                borderColor: 'var(--athlon-primary)',
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {cat.name.trim() ? cat.name : `Category Tier ${idx + 1}`}
                            </span>
                          </div>

                          {customCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCategoryItem(cat.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Remove category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-12 gap-2.5">
                          <div className="col-span-7">
                            <label className="text-[9px] font-black uppercase text-foreground/50 block mb-1">
                              Category Name
                            </label>
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) =>
                                updateCategoryItem(cat.id, 'name', e.target.value)
                              }
                              placeholder="e.g. Beginner, Open..."
                              className="w-full bg-card border rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary placeholder:text-foreground/30"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>

                          <div className="col-span-5">
                            <label className="text-[9px] font-black uppercase text-foreground/50 block mb-1">
                              Max Teams
                            </label>
                            <div
                              className="flex items-center bg-card border rounded-xl overflow-hidden"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const current = Number(cat.maxTeams) || 16;
                                  if (current > 2)
                                    updateCategoryItem(cat.id, 'maxTeams', current - 2);
                                }}
                                className="w-7 h-7 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="2"
                                value={cat.maxTeams}
                                onChange={(e) =>
                                  updateCategoryItem(cat.id, 'maxTeams', e.target.value)
                                }
                                className="w-full bg-transparent text-center text-xs font-mono font-black text-foreground focus:outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const current = Number(cat.maxTeams) || 16;
                                  updateCategoryItem(cat.id, 'maxTeams', current + 2);
                                }}
                                className="w-7 h-7 flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quick Draw Cap Pills */}
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[9px] font-semibold text-foreground/40 mr-1">
                            Draw Cap:
                          </span>
                          {[8, 16, 32, 64].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateCategoryItem(cat.id, 'maxTeams', size)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${Number(cat.maxTeams) === size
                                ? 'bg-primary text-black font-black'
                                : 'bg-card border border-foreground/10 text-foreground/60 hover:text-foreground'
                                }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Another Category & Capacity Summary */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        addCategoryItem(
                          `Category ${String.fromCharCode(65 + customCategories.length)}`
                        )
                      }
                      className="w-full py-2.5 rounded-xl border-2 border-dashed hover:border-primary/50 text-foreground/70 hover:text-primary font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] cursor-pointer"
                      style={{
                        borderColor: 'var(--athlon-border)',
                        backgroundColor: 'var(--athlon-surface)',
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      <span>Add Another Category Tier</span>
                    </button>

                    <div className="flex items-center justify-between px-2 pt-1 text-[10px] text-foreground/50 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        Total Capacity:
                      </span>
                      <strong className="text-foreground font-mono font-bold">
                        {customCategories.reduce(
                          (acc, c) => acc + (Number(c.maxTeams) || 0),
                          0
                        )}{' '}
                        Teams
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-3xl border bg-card">
              <TeamEventCategoryBuilder
                categories={formData.teamEventCategories || []}
                onChange={(cats: TeamEventCategoryConfig[]) => setFormData({ ...formData, teamEventCategories: cats })}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 7: REGISTRATION FEES & UPI PAYMENT SETUP
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Registration Fees &amp; UPI
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Entry fees, UPI payment ID, and QR code scanner
                </p>
              </div>
            </div>

            {/* Entry Fee */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Entry Fee Per Team / Entry</label>
                <span className="text-[10px] font-black text-primary font-mono">
                  {formData.registrationFees ? `₹${formData.registrationFees}` : 'Free Entry'}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 font-black text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={formData.registrationFees}
                  onChange={(e) => setFormData({ ...formData, registrationFees: e.target.value })}
                  className={`${inputClass} pl-9 font-mono`}
                  placeholder="0 for free entry"
                />
              </div>
            </div>

            {/* UPI Number / ID */}
            <div>
              <label className={labelClass}>UPI ID / GPay / PhonePe Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/25">
                  UPI
                </div>
                <input
                  type="text"
                  value={formData.gpayNumber}
                  onChange={(e) => setFormData({ ...formData, gpayNumber: e.target.value })}
                  className={`${inputClass} pl-13 font-mono text-xs`}
                  placeholder="e.g. 9876543210 or user@okhdfcbank"
                />
              </div>
            </div>

            {/* UPI QR Code Scanner Upload */}
            <div>
              <label className={labelClass}>UPI QR Code Image (Optional)</label>
              <input
                ref={qrCodeInputRef}
                type="file"
                accept="image/*"
                onChange={handleQrCodeChange}
                className="hidden"
              />
              {qrCodePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-foreground/15 p-3.5 bg-card flex items-center gap-3.5 shadow-xs">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-foreground/10 flex items-center justify-center">
                    <img src={qrCodePreview} alt="UPI QR" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-foreground truncate">QR Code Selected</p>
                    <p className="text-[10px] text-foreground/50">For player registration scan &amp; pay</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQrCodePreview(null);
                      setQrCodeFile(null);
                    }}
                    className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => qrCodeInputRef.current?.click()}
                  className="w-full bg-card border-2 border-dashed border-foreground/15 rounded-2xl py-3.5 flex items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <QrCode className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">
                      Upload UPI QR Code (Scanner)
                    </div>
                    <div className="text-[10px] text-foreground/40">PNG, JPG or WEBP</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              BENTO CARD 8: NOTES & ORGANIZER CONTACT
             ════════════════════════════════════════════════════════════════ */}
          <div
            className="p-5 rounded-3xl border shadow-xs space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2.5 pb-2.5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-500 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Guidelines &amp; Contact
                </h2>
                <p className="text-[10px] text-foreground/50 font-medium">
                  Court guidelines, equipment notes, and support line
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Tournament Description &amp; Rules (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${inputClass} min-h-[90px] resize-none text-xs leading-relaxed`}
                placeholder="Shuttlecock specs, reporting time, court dress code, referee notes..."
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className={labelClass}>Organizer Contact Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className={`${inputClass} pl-10 text-xs`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              MOBILE CREATE TOURNAMENT SUBMIT ACTION (IN-FLOW)
             ════════════════════════════════════════════════════════════════ */}
          <div className="pt-2 pb-6 flex flex-col items-center space-y-2.5">
            {(!formData.name.trim() || !formData.location.trim()) && (
              <div className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Please enter tournament name and location.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.name.trim() || !formData.location.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-black text-xs font-black uppercase tracking-wider transition-all hover:brightness-105 active:scale-95 shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Tournament</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - 2-COLUMN DESIGN WITH LIVE PREVIEW & FORM SECTIONS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Header Command Bar */}
        <div
          className="border-b px-8 py-8 bg-gradient-to-b from-card/80 via-card/30 to-background"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-foreground/50 font-bold uppercase tracking-wider">
                <Link href={`/org/${orgUuid}/dashboard`} className="hover:text-primary transition-colors">
                  {activeOrg.name}
                </Link>
                <span>/</span>
                <Link href={`/org/${orgUuid}/tournaments`} className="hover:text-primary transition-colors">
                  Tournaments
                </Link>
                <span>/</span>
                <span className="text-primary">Create Event</span>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Launch Tournament Competition
              </h1>
              <p className="text-xs text-foreground/60">
                Setup match brackets, venue logistics, registration fee schedules, and public event visibility
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/org/${orgUuid}/tournaments`}
                className="px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                {isSubmitting ? (
                  <span>Publishing Competition...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Tournament</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <main className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Main Form Column (7 Cols) */}
            <div className="col-span-7 space-y-8">
              {/* Card 1: Event Identity & Format */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Event Identity &amp; Discipline</h2>
                    <p className="text-xs text-foreground/50">Core competition name, sport discipline, and draw type</p>
                  </div>
                </div>

                {/* Tournament Name */}
                <div>
                  <label className={desktopLabelClass}>
                    Tournament Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={desktopInputClass}
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    placeholder="e.g. State Open Championship 2026"
                  />
                </div>

                {/* Sport Discipline Selector */}
                <div>
                  <label className={desktopLabelClass}>
                    Sport Discipline <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {orgSports.map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => handleSportChange(sport)}
                        className={`py-3 px-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${formData.sport.toLowerCase() === sport.toLowerCase()
                          ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 scale-[1.02]'
                          : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                          }`}
                        style={{
                          backgroundColor: formData.sport.toLowerCase() === sport.toLowerCase() ? 'var(--athlon-primary)' : 'var(--athlon-surface)',
                          borderColor: formData.sport.toLowerCase() === sport.toLowerCase() ? 'transparent' : 'var(--athlon-border)',
                        }}
                      >
                        <span>{sport}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tournament Type & Visibility Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className={desktopLabelClass}>
                      Draw Format <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['KNOCKOUT', 'LEAGUE'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, tournamentType: type })}
                          className={`py-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${formData.tournamentType === type
                            ? 'bg-primary/15 text-primary border-primary shadow-sm'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                          style={{
                            backgroundColor:
                              formData.tournamentType === type ? 'rgba(27, 156, 86, 0.15)' : 'var(--athlon-surface)',
                            borderColor: formData.tournamentType === type ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                          }}
                        >
                          {type === 'KNOCKOUT' ? 'Knockout' : 'Pool League'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className={desktopLabelClass}>Event Visibility</label>
                    {!isInternalOrg ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            value: 'PRIVATE',
                            label: 'Private',
                            icon: Lock,
                          },
                          { value: 'PUBLIC', label: 'Public Open', icon: Globe },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: opt.value })}
                            className={`py-3 px-2 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${formData.type === opt.value
                              ? 'bg-primary/15 text-primary border-primary shadow-sm'
                              : 'text-foreground/60 hover:text-foreground'
                              }`}
                            style={{
                              backgroundColor:
                                formData.type === opt.value ? 'rgba(27, 156, 86, 0.15)' : 'var(--athlon-surface)',
                              borderColor: formData.type === opt.value ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                            }}
                          >
                            <opt.icon className="w-3.5 h-3.5" />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="py-3 px-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-between text-primary bg-primary/10 border-primary/30"
                      >
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" />
                          <span>{isClub ? 'Internal Club Only' : 'Internal Academy Only'}</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-black">
                          {isClub ? 'Club Members' : 'Private Cohort'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participant Registration Mode */}
                <div>
                  <label className={desktopLabelClass}>Participant Registration Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: 'PUBLIC',
                        label: 'Public Registration',
                        icon: Globe,
                        desc: 'Online participant signup',
                      },
                      {
                        value: 'ORGANIZER_MANAGED',
                        label: 'Organizer Managed',
                        icon: Layers,
                        desc: 'Manual participant entry only',
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, registrationMode: opt.value })}
                        className={`py-2.5 px-3 rounded-2xl border text-left transition-all ${formData.registrationMode === opt.value
                          ? 'bg-primary/15 text-primary border-primary shadow-sm'
                          : 'text-foreground/60 hover:text-foreground'
                          }`}
                        style={{
                          backgroundColor:
                            formData.registrationMode === opt.value ? 'rgba(27, 156, 86, 0.15)' : 'var(--athlon-surface)',
                          borderColor: formData.registrationMode === opt.value ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                          <opt.icon className="w-3.5 h-3.5" />
                          <span>{opt.label}</span>
                        </div>
                        <div className="text-[10px] text-foreground/50 mt-1 font-normal leading-tight">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Academy Cohort Targeting (Desktop) */}
                {activeOrg.type === 'ACADEMY' && (
                  <div
                    className="p-5 rounded-3xl border shadow-sm space-y-4"
                    style={{
                      backgroundColor: 'rgba(27, 156, 86, 0.04)',
                      borderColor: 'rgba(27, 156, 86, 0.25)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                          🎯
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-foreground">Academy Cohort & Venue Targeting</h4>
                          <p className="text-xs text-foreground/50">
                            Tournament poster and registration will be scoped to enrolled students of the selected venue &amp; batches.
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider">
                        Internal Academy Event
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Venue / Campus */}
                      <div>
                        <label className={desktopLabelClass}>Target Campus / Venue</label>
                        <select
                          value={targetCentreUuid}
                          onChange={(e) => {
                            setTargetCentreUuid(e.target.value);
                            const sel = academyCentres.find((c) => c.centreUuid === e.target.value);
                            if (sel && !formData.location) {
                              setFormData({ ...formData, location: sel.name });
                            }
                          }}
                          className={`${desktopInputClass} appearance-none cursor-pointer`}
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <option value="ALL">All Academy Campuses ({academyCentres.length})</option>
                          {academyCentres.map((c) => (
                            <option key={c.centreUuid} value={c.centreUuid}>
                              {c.name} {c.city ? `(${c.city})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Batches Selection */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className={desktopLabelClass}>Target Batches</label>
                          <span className="text-[10px] font-black text-primary uppercase">
                            {targetBatchUuids.length === 0 ? 'All Batches Eligible' : `${targetBatchUuids.length} Batches Selected`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setTargetBatchUuids([])}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${targetBatchUuids.length === 0
                              ? 'bg-primary text-primary-foreground border-primary font-black shadow-sm'
                              : 'text-foreground/70 hover:text-foreground'
                              }`}
                            style={{
                              backgroundColor: targetBatchUuids.length === 0 ? undefined : 'var(--athlon-surface)',
                              borderColor: targetBatchUuids.length === 0 ? undefined : 'var(--athlon-border)',
                            }}
                          >
                            All Batches
                          </button>
                          {academyBatches.map((b) => {
                            const isSel = targetBatchUuids.includes(b.batchUuid);
                            return (
                              <button
                                key={b.batchUuid}
                                type="button"
                                onClick={() => {
                                  if (isSel) {
                                    setTargetBatchUuids((prev) => prev.filter((id) => id !== b.batchUuid));
                                  } else {
                                    setTargetBatchUuids((prev) => [...prev, b.batchUuid]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isSel
                                  ? 'bg-primary text-primary-foreground border-primary font-black shadow-sm'
                                  : 'text-foreground/70 hover:text-foreground'
                                  }`}
                                style={{
                                  backgroundColor: isSel ? undefined : 'var(--athlon-surface)',
                                  borderColor: isSel ? undefined : 'var(--athlon-border)',
                                }}
                              >
                                {b.batchName} {b.level ? `(${b.level})` : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Skill Levels */}
                    <div>
                      <label className={desktopLabelClass}>Eligible Coaching Levels</label>
                      <div className="flex flex-wrap gap-2">
                        {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'].map((lvl) => {
                          const isSel = targetLevels.includes(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => {
                                if (isSel) {
                                  setTargetLevels((prev) => prev.filter((l) => l !== lvl));
                                } else {
                                  setTargetLevels((prev) => [...prev, lvl]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isSel
                                ? 'bg-primary text-primary-foreground border-primary font-black shadow-sm'
                                : 'text-foreground/70 hover:text-foreground'
                                }`}
                              style={{
                                backgroundColor: isSel ? undefined : 'var(--athlon-surface)',
                                borderColor: isSel ? undefined : 'var(--athlon-border)',
                              }}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Configuration Area */}
                <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={desktopLabelClass}>Tournament Category Architecture</span>
                      <p className="text-xs text-foreground/50">
                        {isSportMultiCategoryAllowed(formData.sport)
                          ? 'Choose between a single open bracket or multiple tiered categories (e.g. Beginner, 70+, C Level)'
                          : 'Single category tournament bracket for selected sport'}
                      </p>
                    </div>

                    {isSportMultiCategoryAllowed(formData.sport) ? (
                      <div
                        className="flex items-center p-1 rounded-2xl border"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <button
                          type="button"
                          onClick={() => setIsMultiCategory(false)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${!isMultiCategory
                            ? 'bg-primary text-black shadow-md'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                        >
                          Single Category
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMultiCategory(true)}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${isMultiCategory
                            ? 'bg-primary text-black shadow-md'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                        >
                          Multi-Category (Pooled Knockout)
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        Single Category Mode
                      </span>
                    )}
                  </div>

                  {(!isSportMultiCategoryAllowed(formData.sport) || !isMultiCategory) ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={desktopLabelClass}>
                          Match Format <span className="text-primary">*</span>
                        </label>
                        <select
                          value={formData.matchFormat}
                          onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
                          className={`${desktopInputClass} appearance-none cursor-pointer`}
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          {getFormatsForSport(formData.sport).map((fmt) => (
                            <option key={fmt} value={fmt}>
                              {fmt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-black uppercase tracking-wider text-foreground/60">
                            Category Tier
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setNewCategorySport(formData.sport);
                              setIsCreateCategoryModalOpen(true);
                            }}
                            className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> + Add Category
                          </button>
                        </div>
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            if (e.target.value === '__CREATE_NEW__') {
                              setNewCategorySport(formData.sport);
                              setIsCreateCategoryModalOpen(true);
                              return;
                            }
                            setFormData({ ...formData, category: e.target.value });
                          }}
                          className={`${desktopInputClass} appearance-none cursor-pointer`}
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <option value="">Select Category</option>
                          {/* Organization Custom Categories (Dynamically saved in DB) */}
                          {orgCategories.filter((c) => !c.sportType || c.sportType.toLowerCase() === (formData.sport || '').toLowerCase()).length > 0 && (
                            <optgroup label="🏢 Organization Categories">
                              {orgCategories
                                .filter((c) => !c.sportType || c.sportType.toLowerCase() === (formData.sport || '').toLowerCase())
                                .map((c) => (
                                  <option key={c.categoryUuid || c.categoryId || c.categoryName} value={c.categoryName}>
                                    {c.categoryName}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                          {/* Common Standard Categories from tournament_category table */}
                          {getCategoryPresetsForSport(formData.sport).filter((preset) => !orgCategories.some((c) => (c.categoryName || '').toLowerCase() === preset.toLowerCase())).length > 0 && (
                            <optgroup label="🏆 Common Standard Categories">
                              {getCategoryPresetsForSport(formData.sport)
                                .filter((preset) => !orgCategories.some((c) => (c.categoryName || '').toLowerCase() === preset.toLowerCase()))
                                .map((preset) => (
                                  <option key={preset} value={preset}>
                                    {preset}
                                  </option>
                                ))}
                            </optgroup>
                          )}
                          <option value="__CREATE_NEW__">➕ Add New Category</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-black uppercase tracking-wider text-foreground/60">
                            Max Teams Limit
                          </label>
                          <span className="text-[10px] font-bold text-primary">
                            {formData.teamCount ? `${formData.teamCount} Teams` : 'Unlimited'}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="2"
                          value={formData.teamCount}
                          onChange={(e) => setFormData({ ...formData, teamCount: e.target.value })}
                          placeholder="Optional (leave empty for unlimited)"
                          className={`${desktopInputClass} font-mono`}
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-5 rounded-2xl border space-y-4 shadow-sm"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-foreground">Tournament Categories ({customCategories.length})</h4>
                            <p className="text-[11px] text-foreground/50">
                              Format: <span className="text-primary font-bold">{formData.matchFormat}</span> (applies to all pools &amp; categories)
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addCategoryItem(`Category ${String.fromCharCode(65 + customCategories.length)}`)}
                          className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Category
                        </button>
                      </div>

                      {/* Category cards */}
                      <div className="space-y-3 pt-1">
                        {customCategories.map((cat, idx) => (
                          <div
                            key={cat.id}
                            className="p-4 rounded-2xl border flex items-center gap-4 shadow-sm"
                            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-xs flex items-center justify-center font-mono shrink-0">
                              #{idx + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block mb-1">
                                Category Name
                              </label>
                              <input
                                type="text"
                                value={cat.name}
                                onChange={(e) => updateCategoryItem(cat.id, 'name', e.target.value)}
                                placeholder="e.g. Beginner, 70+, C Level..."
                                className="w-full bg-transparent border-b text-sm font-black text-foreground focus:outline-none focus:border-primary pb-1 placeholder:text-foreground/30"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              />
                            </div>

                            <div className="w-40">
                              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block mb-1">
                                Max Teams (Draw Cap)
                              </label>
                              <input
                                type="number"
                                min="2"
                                value={cat.maxTeams}
                                onChange={(e) => updateCategoryItem(cat.id, 'maxTeams', e.target.value)}
                                placeholder="16"
                                className="w-full px-3 py-2 rounded-xl border text-xs font-bold text-foreground focus:outline-none focus:border-primary font-mono"
                                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                              />
                            </div>

                            {customCategories.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCategoryItem(cat.id)}
                                className="p-2 rounded-xl hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors mt-4"
                                title="Remove category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Card 2: Venue & Location */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Venue &amp; Location Logistics</h2>
                    <p className="text-xs text-foreground/50">Stadium address and Google Maps navigation pin</p>
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>
                    Venue / Arena Name &amp; Address <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`${desktopInputClass} pl-11`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      placeholder="e.g. Central Sports Complex, Court 1-4, Anna Nagar"
                    />
                  </div>
                </div>

                {/* STATE, DISTRICT & CITY (3-column responsive grid) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={desktopLabelClass}>State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          state: newState,
                          district: '',
                        }));
                      }}
                      className={`${desktopInputClass} appearance-none cursor-pointer`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="">Select State</option>
                      {statesList.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>District</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                      disabled={!formData.state || loadingDistricts}
                      className={`${desktopInputClass} appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="">
                        {!formData.state
                          ? 'Select State first'
                          : loadingDistricts
                            ? 'Loading districts...'
                            : 'Select District'}
                      </option>
                      {districtsList.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>City / Area / Town</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      className={desktopInputClass}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      placeholder="e.g. Kazhakootam, Whitefield, T. Nagar..."
                    />
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>Google Maps Pin URL (Optional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="url"
                      value={formData.mapLink}
                      onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                      className={`${desktopInputClass} pl-11 text-xs`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  {formData.mapLink && (
                    <a
                      href={formData.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Google Maps Navigation Pin</span>
                    </a>
                  )}
                </div>
              </section>

              {/* Card 3: Schedules & Lock Times */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Competition Schedule &amp; Lock Dates</h2>
                    <p className="text-xs text-foreground/50">Start &amp; end dates, match hours, and registration deadlines</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={desktopLabelClass}>
                      Tournament Start Date <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`${desktopInputClass} col-span-2`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className={desktopInputClass}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>
                      Tournament End Date <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`${desktopInputClass} col-span-2`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className={desktopInputClass}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>Registration Lock Deadline (Optional)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="date"
                      value={formData.registrationClosingDate}
                      onChange={(e) => setFormData({ ...formData, registrationClosingDate: e.target.value })}
                      className={`${desktopInputClass} col-span-2`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                    <input
                      type="time"
                      value={formData.registrationClosingTime}
                      onChange={(e) => setFormData({ ...formData, registrationClosingTime: e.target.value })}
                      className={desktopInputClass}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                  <span className="text-[11px] text-foreground/45 mt-1.5 block">
                    Entries will automatically close after this timestamp.
                  </span>
                </div>
              </section>

              {/* Card 4: Entry Fees & Rules Notes */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Registration Fees &amp; Payment Details</h2>
                    <p className="text-xs text-foreground/50">Entry pricing, GPay/UPI payment details, and organizer contact</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={desktopLabelClass}>Entry Fee Per Entry (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-black">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.registrationFees}
                        onChange={(e) => setFormData({ ...formData, registrationFees: e.target.value })}
                        className={`${desktopInputClass} pl-8`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        placeholder="0 for free entry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>GPay / PhonePe / UPI Number</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        UPI
                      </div>
                      <input
                        type="text"
                        value={formData.gpayNumber}
                        onChange={(e) => setFormData({ ...formData, gpayNumber: e.target.value })}
                        className={`${desktopInputClass} pl-14 font-mono text-sm`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        placeholder="9876543210 or ID"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>Organizer Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className={`${desktopInputClass} pl-11`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* UPI QR CODE UPLOAD IN DESKTOP */}
                <div className="p-4 rounded-2xl border border-foreground/10 bg-surface/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" />
                      UPI Scanner QR Code Image (Optional)
                    </label>
                    <span className="text-[10px] text-foreground/40 font-bold">For player registration scan &amp; pay</span>
                  </div>

                  <input
                    ref={desktopQrCodeInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeChange}
                    className="hidden"
                  />

                  {qrCodePreview ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-foreground/15 bg-card">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/10 shrink-0 border border-foreground/10 flex items-center justify-center">
                        <img src={qrCodePreview} alt="QR Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-foreground">UPI QR Code Uploaded</p>
                        <p className="text-[11px] text-foreground/50">Players will be able to scan and pay directly during registration</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => desktopQrCodeInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-foreground/15 text-xs font-bold text-foreground hover:border-primary transition-all"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQrCodePreview(null);
                            setQrCodeFile(null);
                          }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => desktopQrCodeInputRef.current?.click()}
                      className="border border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-foreground block">Click to upload UPI QR Code</span>
                        <span className="text-[10px] text-foreground/40">PNG, JPG or WEBP · Max 5MB</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={desktopLabelClass}>Tournament Description &amp; Guidelines</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${desktopInputClass} min-h-[120px] resize-none leading-relaxed`}
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    placeholder="Enter court rules, shuttlecock specifications, referee contacts, and reporting time notes..."
                  />
                </div>
              </section>
            </div>

            {/* Right Sticky Preview & Action Column (5 Cols) */}
            <div className="col-span-5 space-y-6 sticky top-6">
              {/* Poster Upload Zone */}
              <div
                className="p-6 rounded-[28px] border shadow-xl space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground/60">
                    Tournament Poster
                  </span>
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    2:3 or 4:5 Portrait
                  </span>
                </div>

                <input
                  ref={desktopPosterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                />

                {posterPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/5] max-h-[380px] mx-auto shadow-lg group bg-black/40 flex items-center justify-center">
                    <img src={posterPreview} alt="Poster Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => desktopPosterInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold text-white hover:bg-white/30 transition-all"
                      >
                        Change Poster
                      </button>
                      <button
                        onClick={() => {
                          setPosterPreview(null);
                          setPosterFile(null);
                        }}
                        className="p-2 rounded-xl bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => desktopPosterInputRef.current?.click()}
                    className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-black text-foreground">Upload Tournament Poster</span>
                    <span className="text-xs text-foreground/40 mt-1">Portrait ratio 2:3 or 4:5 · Max 5MB</span>
                  </div>
                )}
              </div>

              {/* Live Card Preview in Athlete Portal */}
              <div
                className="p-6 rounded-[28px] border shadow-xl space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground/60">
                    Live Portal Card Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/20 text-primary border border-primary/30">
                    Live Preview
                  </span>
                </div>

                {/* The Mocked Card */}
                <div
                  className="rounded-[24px] border overflow-hidden shadow-2xl relative"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-400 to-yellow-500" />
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                        {formData.tournamentType}
                      </span>
                      <span className="text-xs font-bold text-foreground/60">{formData.sport}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-foreground leading-snug truncate">
                        {formData.name || 'Tournament Title Preview'}
                      </h3>
                      <span className="text-xs text-primary font-bold">{formData.matchFormat}</span>
                    </div>

                    <div className="space-y-1 text-xs text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {formData.startDate && formData.endDate && formData.startDate === formData.endDate
                            ? formData.startDate
                            : `${formData.startDate || 'Start Date'} - ${formData.endDate || 'End Date'}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{formData.location || 'Venue Location'}</span>
                      </div>
                    </div>

                    <div
                      className="pt-3 border-t flex items-center justify-between text-xs"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <span className="font-mono font-black text-foreground">
                        {formData.registrationFees ? `₹${formData.registrationFees}` : 'Free Entry'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        {formData.type} EVENT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Progress Meter */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground/60">Form Completion</span>
                    <span className="font-black text-primary font-mono">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Publishing Tournament...</span>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>Launch Competition Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DYNAMIC CATEGORY CREATION MODAL (IN-PLACE DATABASE PERSISTENCE)
         ══════════════════════════════════════════════════════════════════════ */}
      {isCreateCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="max-w-md w-full p-6 rounded-[28px] border shadow-2xl space-y-5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                    Add Custom Category
                  </h3>
                  <p className="text-[11px] text-foreground/50">
                    Saved to database for your organization
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreateCategoryModalOpen(false);
                  setNewCategoryName('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                  Category Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveNewCategory();
                    }
                  }}
                  placeholder="e.g. Under-11 Girls, Corporate IT Cup, 55+ Veterans..."
                  className="w-full px-4 py-3 rounded-xl border text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-all bg-card"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/60 mb-1.5">
                  Sport Discipline <span className="text-primary">*</span>
                </label>
                <select
                  value={newCategorySport}
                  onChange={(e) => setNewCategorySport(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-semibold text-foreground focus:outline-none focus:border-primary transition-all bg-card appearance-none cursor-pointer"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  {orgSports.map((s) => (
                    <option key={s} value={s}>
                      {getSportEmoji(s)} {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateCategoryModalOpen(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all cursor-pointer"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewCategory}
                disabled={!newCategoryName.trim() || isSavingCategory}
                className="px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingCategory ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
