'use client';

import {
  ArrowLeft,
  Settings,
  MapPin,
  Edit3,
  Wallet,
  Trophy,
  Target,
  Zap,
  Activity,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  LogOut,
  CreditCard,
  User as UserIcon,
  Gift,
  Mail,
  Phone,
  Key,
  Trash,
  FileText,
  ShieldCheck,
  Plus,
  Building2,
  Palette,
  Sparkles,
  Award,
  Crown,
  CheckCircle2,
  ArrowUpRight,
  Compass,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContextSwitcher from '@/components/ContextSwitcher';
import { ThemeSelector, ThemeModal } from '@/components/theme';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { UserService, UserResponse, SportsProfileResponse } from '@/lib/api/user';
import { compressImageFile, COMPRESSION_PRESETS } from '@/lib/utils/imageCompression';
import { OrganizationService, Organization } from '@/lib/api/organization';
import { LocationService, FALLBACK_INDIAN_STATES, FALLBACK_STATE_DISTRICTS } from '@/lib/api/location';
import { RewardsService } from '@/lib/api/rewards';
import { MatchService, Match } from '@/lib/api/matches';

export default function ProfilePage() {
  const { userId: playerId, userUuid, token, logout, userEmail, isSuperAdmin, role } = useAuthStore();
  const {
    activeWorkspaceId,
    organizations: storeOrgs,
    setOrganizations: setStoreOrganizations,
    personalProfile,
    setPersonalProfile,
  } = useWorkspaceStore();
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { theme, mode } = useAthlonTheme();

  const isUserSuperAdmin = Boolean(
    role === 'PLATFORM_SUPER_ADMIN' ||
    (Array.isArray(profile?.roles) && profile.roles.includes('PLATFORM_SUPER_ADMIN')) ||
    profile?.primaryRole === 'PLATFORM_SUPER_ADMIN' ||
    (typeof isSuperAdmin === 'function' && isSuperAdmin())
  );

  const sportsTrackRef = useRef<HTMLDivElement>(null);
  const orgsTrackRef = useRef<HTMLDivElement>(null);
  const historyTrackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sportsProfiles = profile?.sportsProfiles || [];
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [activeDesktopTab, setActiveDesktopTab] = useState<'all' | 'sports' | 'matches' | 'orgs' | 'identity'>('all');

  const { totalMatchesCount, winsCount, overallWinRate } = useMemo(() => {
    let wins = 0;
    let completed = 0;
    userMatches.forEach((m) => {
      if (m.status === 'COMPLETED') {
        completed++;
        const isWinner =
          m.winnerRegistrationId &&
          ((m.teamARegistrationId && m.winnerRegistrationId === m.teamARegistrationId) ||
            (m.teamBRegistrationId && m.winnerRegistrationId === m.teamBRegistrationId));
        if (isWinner) wins++;
      }
    });

    const rate = completed > 0 ? Math.round((wins / completed) * 100) : 0;
    return {
      totalMatchesCount: userMatches.length,
      winsCount: wins,
      overallWinRate: rate,
    };
  }, [userMatches]);

  const getSportStyle = (sportName: string) => {
    const s = (sportName || '').toLowerCase();
    if (s.includes('badminton')) {
      return { icon: Target, color: 'text-primary', badge: 'bg-primary/10 text-primary border-primary/25', line: 'from-primary to-emerald-400' };
    }
    if (s.includes('cricket')) {
      return { icon: Award, color: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25', line: 'from-amber-400 to-yellow-500' };
    }
    if (s.includes('football') || s.includes('soccer')) {
      return { icon: Zap, color: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', line: 'from-emerald-400 to-teal-500' };
    }
    if (s.includes('tennis') || s.includes('pickleball')) {
      return { icon: Trophy, color: 'text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/25', line: 'from-sky-400 to-blue-500' };
    }
    return { icon: Activity, color: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25', line: 'from-purple-400 to-pink-500' };
  };

  const [isAddingSport, setIsAddingSport] = useState(false);
  const [newSportName, setNewSportName] = useState('Badminton');
  const [newCategory, setNewCategory] = useState('Beginner');
  const [newRanking, setNewRanking] = useState('');
  const [newHighlights, setNewHighlights] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editState, setEditState] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [statesList, setStatesList] = useState<string[]>(FALLBACK_INDIAN_STATES);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await LocationService.getAllStates();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((s) => s.name))).sort();
          setStatesList(names);
        } else {
          setStatesList(FALLBACK_INDIAN_STATES);
        }
      } catch (err) {
        setStatesList(FALLBACK_INDIAN_STATES);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!editState) {
      setDistrictsList([]);
      return;
    }

    const fetchDistricts = async () => {
      setIsLoadingLocations(true);
      try {
        const res = await LocationService.getDistrictsByStateName(editState);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((d) => d.name))).sort();
          setDistrictsList(names);
        } else if (FALLBACK_STATE_DISTRICTS[editState]) {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[editState]);
        } else {
          setDistrictsList([]);
        }
      } catch (err) {
        if (FALLBACK_STATE_DISTRICTS[editState]) {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[editState]);
        } else {
          setDistrictsList([]);
        }
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchDistricts();
  }, [editState]);

  const handleEditProfileSubmit = async () => {
    if (!userUuid) return;
    setIsSavingProfile(true);
    try {
      const res = await UserService.updateUser({
        uuid: userUuid,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        city: editCity,
        district: editDistrict,
        state: editState,
        dob: editDob || undefined,
        gender: editGender || undefined,
      });
      if (res.success && res.data) {
        setProfile(res.data);
        if (personalProfile) {
          setPersonalProfile({
            ...personalProfile,
            name: `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim(),
            avatar: res.data.photo ? UserService.getPhotoUrl(res.data.photo) : personalProfile.avatar,
          });
        }
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── DOB / Gender display helpers ──
  const parseDob = (dob?: string) => {
    if (!dob) return null;
    const [y, m, d] = dob.split('T')[0].split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const formatDob = (dob?: string) => {
    const date = parseDob(dob);
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getAge = (dob?: string) => {
    const date = parseDob(dob);
    if (!date) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const beforeBirthday =
      today.getMonth() < date.getMonth() ||
      (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
    if (beforeBirthday) age -= 1;
    return age >= 0 ? age : null;
  };

  const formatGender = (g?: string) => (g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : '');

  // ── Profile completion (each field carries equal weight) ──
  const completionFields: { key: string; label: string; done: boolean }[] = [
    { key: 'photo', label: 'Photo', done: !!profile?.photo },
    { key: 'firstName', label: 'First Name', done: !!profile?.firstName?.trim() },
    { key: 'lastName', label: 'Last Name', done: !!profile?.lastName?.trim() },
    { key: 'email', label: 'Email', done: !!(profile?.email || userEmail) },
    { key: 'phone', label: 'Phone', done: !!profile?.phone?.trim() },
    { key: 'dob', label: 'Date of Birth', done: !!profile?.dob },
    { key: 'gender', label: 'Gender', done: !!profile?.gender },
    { key: 'state', label: 'State', done: !!profile?.state },
    { key: 'district', label: 'District', done: !!profile?.district },
    { key: 'city', label: 'City', done: !!profile?.city?.trim() },
  ];
  const completedCount = completionFields.filter((f) => f.done).length;
  const completionPercent = Math.round((completedCount / completionFields.length) * 100);
  const missingFields = completionFields.filter((f) => !f.done);

  const openEditProfile = () => {
    setEditFirstName(profile?.firstName || '');
    setEditLastName(profile?.lastName || '');
    setEditPhone(profile?.phone || '');
    setEditCity(profile?.city || '');
    setEditDistrict(profile?.district || '');
    setEditState(profile?.state || '');
    setEditDob(profile?.dob || '');
    setEditGender(profile?.gender || '');
    setIsEditingProfile(true);
  };

  const completionCard = profile && (
    <section
      id="profile-completion-card"
      className="bg-surface border border-foreground/5 rounded-xl p-3.5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        {/* Circular progress ring */}
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" className="stroke-foreground/10" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="var(--athlon-primary)"
              strokeDasharray={`${(completionPercent / 100) * 97.4} 97.4`}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-foreground">
            {completionPercent}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/70">
              Profile Completion
            </span>
            </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completionPercent}%`, transition: 'width 0.6s ease' }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-foreground/60 font-medium">
            {completionPercent === 100
              ? 'Your profile is complete. Nice work!'
              : 'Complete your profile to get better match & tournament recommendations.'}
          </p>
        </div>
      </div>
    </section>
  );

  const handleAddSportsProfile = async () => {
    if (!userUuid) return;
    setIsSubmitting(true);
    try {
      const res = await UserService.addSportsProfile({
        userUuid,
        sportName: newSportName,
        category: newCategory,
        currentRanking: newRanking ? parseInt(newRanking) : undefined,
        careerHighlights: newHighlights,
      });
      if (res.success) {
        setIsAddingSport(false);
        setNewRanking('');
        setNewHighlights('');
        const profileRes = await UserService.getUserByUuid(userUuid);
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
          setSelectedSportId(res.data.uuid);
        }
      }
    } catch (error) {
      console.error('Failed to add sports profile', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (sportsProfiles.length > 0 && !selectedSportId) {
      setSelectedSportId(sportsProfiles[0].uuid);
    }
  }, [sportsProfiles, selectedSportId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!userUuid && !playerId && !token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      if (!userUuid) {
        setLoading(false);
        return;
      }
      try {
        const [res, orgsRes, walletRes] = await Promise.allSettled([
          UserService.getUserByUuid(userUuid),
          OrganizationService.getByUserUuid(userUuid),
          RewardsService.getWallet(userUuid),
        ]);
        if (res.status === 'fulfilled' && res.value?.success && res.value.data) {
          const data = res.value.data;
          setProfile(data);

          // Dynamically sync Super Admin role if present on profile
          const dynamicRoles: string[] = data.roles || [];
          const dynamicPrimaryRole: string = data.primaryRole || '';
          if (dynamicRoles.includes('PLATFORM_SUPER_ADMIN') || dynamicPrimaryRole === 'PLATFORM_SUPER_ADMIN') {
            useAuthStore.setState({
              role: 'PLATFORM_SUPER_ADMIN',
              platformRoles: Array.from(new Set([...(useAuthStore.getState().platformRoles || []), 'PLATFORM_SUPER_ADMIN'])),
            });
          }

          setEditFirstName(data.firstName || '');
          setEditLastName(data.lastName || '');
          setEditPhone(data.phone || '');
          setEditCity(data.city || '');
          setEditDistrict(data.district || '');
          setEditState(data.state || '');
          setEditDob(data.dob || '');
          setEditGender(data.gender || '');
          setPersonalProfile({
            id: data.uuid,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            athlonId: '',
            avatar: data.photo ? UserService.getPhotoUrl(data.photo) : '',
          });
        }
        if (orgsRes.status === 'fulfilled' && orgsRes.value?.data && Array.isArray(orgsRes.value.data)) {
          const apiOrgs = orgsRes.value.data.map((o: any) => ({
            id: o.uuid || o.organizationUuid,
            name: o.name,
            type: o.type,
            logo: o.logo,
            role: o.role || 'MEMBER',
          }));
          setOrganizations(orgsRes.value.data);
          const currentOrgs = useWorkspaceStore.getState().organizations || [];
          const mergedMap = new Map<string, any>();
          currentOrgs.forEach((org) => mergedMap.set(org.id, org));
          apiOrgs.forEach((org: any) => mergedMap.set(org.id, org));
          setStoreOrganizations(Array.from(mergedMap.values()));
        }
        if (walletRes.status === 'fulfilled' && walletRes.value?.data) {
          setUserCredits(walletRes.value.data.balance ?? 0);
        }
        if (playerId) {
          try {
            const matchesRes = await MatchService.getByUser(Number(playerId));
            if (matchesRes?.data && Array.isArray(matchesRes.data)) {
              setUserMatches(matchesRes.data);
            } else {
              setUserMatches([]);
            }
          } catch (err) {
            console.warn('Failed to load user match history', err);
            setUserMatches([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [playerId, userUuid, token]);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetUuid = userUuid || profile?.uuid;
    if (!file || !targetUuid) {
      console.warn('Upload aborted: missing file or user uuid', { file, targetUuid });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImageFile(file, COMPRESSION_PRESETS.AVATAR);
      const res = await UserService.uploadProfilePhoto(targetUuid, compressed.file);
      if (res.success && res.data) {
        setProfile(res.data);
        if (personalProfile) {
          setPersonalProfile({
            ...personalProfile,
            avatar: res.data.photo ? UserService.getPhotoUrl(res.data.photo) : '',
          });
        }
      }
    } catch (error) {
      console.error('Error uploading photo', error);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-20 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-md border-b border-foreground/5 safe-header">
          <div className="flex items-center gap-2">
            <Link href="/home" className="p-1.5 -ml-1.5 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-sm font-black uppercase tracking-wider">My Profile</h1>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 -mr-1.5 text-foreground hover:text-gray-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-10 w-60 bg-surface border border-foreground/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setEditFirstName(profile?.firstName || '');
                      setEditLastName(profile?.lastName || '');
                      setEditPhone(profile?.phone || '');
                      setEditCity(profile?.city || '');
                      setEditDistrict(profile?.district || '');
                      setEditState(profile?.state || '');
                      setEditDob(profile?.dob || '');
                      setEditGender(profile?.gender || '');
                      setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-foreground/70" /> Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsThemeModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Palette className="w-3.5 h-3.5 text-primary" /> Appearance &amp; Theme
                  </button>
                  <Link
                    href="/settings"
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Settings className="w-3.5 h-3.5 text-foreground/70" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-3.5 pt-4">
          {/* User Identity Header */}
          <section className="flex flex-col items-center relative">
            {/* Avatar with Glow */}
            <div className="relative mb-2.5">
              <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-25" />
              <div
                className="relative w-20 h-20 rounded-full bg-primary p-[2.5px] cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full bg-background border-2 border-[#0A0F1A] overflow-hidden relative">
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  {profile?.photo ? (
                    <img
                      src={UserService.getPhotoUrl(profile.photo)}
                      alt="User Avatar"
                      className="w-full h-full object-cover relative z-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : personalProfile?.avatar && !personalProfile.avatar.includes('umpire.png') ? (
                    <img
                      src={personalProfile.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover relative z-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface text-primary font-black text-xl">
                      {profile?.firstName ? (
                        profile.firstName.charAt(0).toUpperCase()
                      ) : userEmail ? (
                        userEmail.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="w-7 h-7 text-primary" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>

            {!isEditingProfile ? (
              <>
                <h2 className="text-lg font-black text-foreground tracking-wide mt-1">
                  {loading ? (
                    <span className="inline-block w-32 h-5 bg-white/10 rounded-md animate-pulse" />
                  ) : profile ? (
                    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Athlete'
                  ) : (
                    personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete')
                  )}
                </h2>

                {profile?.phone && (
                  <div className="flex items-center gap-1.5 text-foreground/50 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{profile.phone}</span>
                  </div>
                )}

                {(profile?.city || profile?.district || profile?.state) && (
                  <div className="flex items-center gap-1.5 text-primary/90 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[11px] font-medium">
                      {[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full mt-3 flex flex-col gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary outline-none"
                />

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-foreground/50 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editDob}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-foreground/50 block mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="">-- Select --</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic State Selection */}
                <div>
                  <label className="text-[9.5px] font-bold uppercase text-foreground/50 block mb-1">State</label>
                  <select
                    value={editState}
                    onChange={(e) => {
                      const chosenState = e.target.value;
                      setEditState(chosenState);
                      setEditDistrict('');
                    }}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs font-bold text-foreground focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">-- Choose State --</option>
                    {statesList.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic District Selection & City */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-foreground/50 block mb-1">District</label>
                    <select
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      disabled={!editState}
                      className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs font-bold text-foreground focus:border-primary outline-none disabled:opacity-40 cursor-pointer"
                    >
                      <option value="">
                        {!editState ? 'Select state' : districtsList.length === 0 ? 'No districts' : '-- Select District --'}
                      </option>
                      {districtsList.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold uppercase text-foreground/50 block mb-1">City / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Kozhikode"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-surface border border-foreground/10 rounded-lg p-2.5 text-xs text-foreground focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-foreground/60 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditProfileSubmit}
                    disabled={isSavingProfile}
                    className="px-4 py-2 text-xs font-bold bg-primary text-black rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSavingProfile && (
                      <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Core Stats Grid */}
          <section className="grid grid-cols-3 gap-2">
            <div className="bg-surface border border-foreground/5 p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-primary mb-0.5" />
              <span className="text-sm sm:text-base font-black text-foreground font-mono">{sportsProfiles[0]?.totalMatches ?? 0}</span>
              <span className="text-[7.5px] uppercase tracking-wider text-foreground/50 font-extrabold">Matches</span>
            </div>
            <div className="bg-surface border border-foreground/5 p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">{sportsProfiles[0]?.matchesWon ?? 0}</span>
              <span className="text-[7.5px] uppercase tracking-wider text-foreground/50 font-extrabold">Wins</span>
            </div>
            <div className="bg-surface border border-primary/20 p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <Target className="w-3.5 h-3.5 text-primary mb-0.5 relative z-10" />
              <span className="text-sm sm:text-base font-black text-primary relative z-10 font-mono">
                {sportsProfiles[0]?.winRate ? `${Math.round(sportsProfiles[0].winRate)}%` : '0%'}
              </span>
              <span className="text-[7.5px] uppercase tracking-wider text-primary font-extrabold relative z-10">Win Rate</span>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════════
              SUPER ADMIN CONSOLE - ADAPTIVE LIGHT/DARK & THEME PALETTE CARD
             ══════════════════════════════════════════════════════════════════════ */}
          {isUserSuperAdmin && (
            <Link
              href="/admin"
              className="relative w-full rounded-2xl p-4 overflow-hidden border bg-surface shadow-sm group active:scale-[0.98] hover:border-primary/40 transition-all duration-300 block"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Glowing Shield Icon Container */}
                  <div
                    className="relative w-12 h-12 rounded-2xl p-[1.5px] shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--athlon-primary), color-mix(in srgb, var(--athlon-primary) 35%, var(--athlon-card)))',
                      boxShadow: '0 4px 14px 0 color-mix(in srgb, var(--athlon-primary) 30%, transparent)',
                    }}
                  >
                    <div
                      className="w-full h-full rounded-[14px] flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: mode === 'light' ? 'var(--athlon-card)' : 'color-mix(in srgb, var(--athlon-card) 85%, black)',
                      }}
                    >
                      <ShieldCheck
                        className="w-6 h-6 transition-colors"
                        style={{
                          color: 'var(--athlon-primary)',
                          filter: 'drop-shadow(0 0 6px color-mix(in srgb, var(--athlon-primary) 50%, transparent))',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-widest border transition-colors"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--athlon-primary) 14%, transparent)',
                          color: 'var(--athlon-primary)',
                          borderColor: 'color-mix(in srgb, var(--athlon-primary) 30%, transparent)',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ backgroundColor: 'var(--athlon-primary)' }}
                        />
                        Platform
                      </span>

                    </div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground group-hover:opacity-90 transition-opacity">
                      Super Admin
                    </h3>
                  </div>
                </div>

                {/* Stylish Launch Button Pill */}
                <div
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-wider transition-all shrink-0 shadow-sm group-hover:scale-105"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--athlon-primary) 14%, transparent)',
                    color: 'var(--athlon-primary)',
                    borderColor: 'color-mix(in srgb, var(--athlon-primary) 32%, transparent)',
                  }}
                >
                  <span>Enter</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Subtitle & Quick Capability Strip */}
              <div
                className="relative z-10 mt-3 pt-2.5 border-t flex items-center justify-between gap-2 flex-wrap text-[10px]"
                style={{
                  borderColor: 'color-mix(in srgb, var(--athlon-primary) 15%, var(--athlon-border))',
                }}
              >
                <span className="text-foreground/60 font-medium truncate">
                  Manage users, packages, requests &amp; audit trails
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className="px-1.5 py-0.5 rounded text-[8.5px] font-bold border transition-colors"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--athlon-primary) 8%, var(--athlon-surface))',
                      borderColor: 'color-mix(in srgb, var(--athlon-primary) 20%, var(--athlon-border))',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    Users
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[8.5px] font-bold border transition-colors"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--athlon-primary) 8%, var(--athlon-surface))',
                      borderColor: 'color-mix(in srgb, var(--athlon-primary) 20%, var(--athlon-border))',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    Packages
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[8.5px] font-bold border transition-colors"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--athlon-primary) 8%, var(--athlon-surface))',
                      borderColor: 'color-mix(in srgb, var(--athlon-primary) 20%, var(--athlon-border))',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    Approvals
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* PROFILE COMPLETION */}
          {completionCard}

          {/* PERSONAL INFO */}
          <section className="bg-surface border border-foreground/5 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-foreground/5">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/70">Personal Info</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-foreground/30" />
            </div>
            <div className="divide-y divide-foreground/5">
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground/70">Email</span>
                <span className="text-xs font-semibold text-foreground">{profile?.email || userEmail || '-'}</span>
              </div>
              {profile?.phone && (
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/70">Phone</span>
                  <span className="text-xs font-semibold text-foreground">{profile.phone}</span>
                </div>
              )}
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground/70">Date of Birth</span>
                {profile?.dob ? (
                  <span className="text-xs font-semibold text-foreground">
                    {formatDob(profile.dob)}
                    {getAge(profile.dob) !== null && (
                      <span className="text-foreground/50 font-medium"> · {getAge(profile.dob)} yrs</span>
                    )}
                  </span>
                ) : (
                  <button type="button" onClick={openEditProfile} className="text-xs font-bold text-primary">
                    + Add
                  </button>
                )}
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground/70">Gender</span>
                {profile?.gender ? (
                  <span className="text-xs font-semibold text-foreground">{formatGender(profile.gender)}</span>
                ) : (
                  <button type="button" onClick={openEditProfile} className="text-xs font-bold text-primary">
                    + Add
                  </button>
                )}
              </div>
              {profile?.city && (
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/70">City</span>
                  <span className="text-xs font-semibold text-foreground">{profile.city}</span>
                </div>
              )}
              {profile?.district && (
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/70">District</span>
                  <span className="text-xs font-semibold text-foreground">{profile.district}</span>
                </div>
              )}
              {profile?.state && (
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/70">State</span>
                  <span className="text-xs font-semibold text-foreground">{profile.state}</span>
                </div>
              )}
            </div>
          </section>

          {/* APPEARANCE & THEMES (Color + 2D/3D Icons) */}
          <section className="bg-surface border border-foreground/5 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3.5 py-2.5 border-b border-foreground/5 flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/70">Appearance &amp; Style</span>
              <span className="text-[9.5px] font-bold text-primary uppercase">Customize</span>
            </div>
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Theme &amp; Icon Mode</div>
                  <div className="text-[11px] text-foreground/60">Change color palette and 2D / 3D icon graphics</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-foreground/40" />
            </button>
          </section>

          {/* REWARDS */}
          <section className="bg-surface border border-primary/20 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3.5 py-2.5 border-b border-primary/10">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/70">Rewards</span>
            </div>
            <Link
              href="/referrals"
              className="w-full px-3.5 py-3 flex items-center justify-between gap-2.5 hover:bg-foreground/5 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    Referrals
                  </span>
                  <span className="text-[10px] font-medium text-foreground/60 truncate">
                    Invite players · earn credits
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  {userCredits !== null ? `${userCredits} credits` : '0 credits'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </section>

          {/* LEGAL */}
          <section className="bg-surface border border-foreground/5 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3.5 py-2.5 border-b border-foreground/5">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/70">Legal</span>
            </div>
            <Link
              href="/terms"
              className="w-full px-3.5 py-3 flex items-center justify-between border-b border-foreground/5 hover:bg-foreground/5 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Terms &amp; Conditions</span>
              <ChevronRight className="w-3.5 h-3.5 text-foreground/40" />
            </Link>
            <Link
              href="/privacy"
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left"
            >
              <span className="text-xs font-medium text-foreground">Privacy Policy</span>
              <ChevronRight className="w-3.5 h-3.5 text-foreground/40" />
            </Link>
          </section>

          {/* SUPPORT & HELP */}
          <section className="bg-surface border border-foreground/5 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3.5 py-2.5 border-b border-foreground/5">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/70">Support &amp; Help</span>
            </div>
            <button className="w-full px-3.5 py-3 flex items-center justify-between border-b border-foreground/5 hover:bg-foreground/5 transition-colors text-left">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-foreground/60" />
                <span className="text-xs font-medium text-foreground">admin@athlon.com</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-foreground/40" />
            </button>
            <button className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-foreground/60" />
                <span className="text-xs font-medium text-foreground">+91 8891704026</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-foreground/40" />
            </button>
          </section>

          {/* ACCOUNT */}
          <section className="bg-surface border border-red-500/20 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3.5 py-2.5 border-b border-red-500/10">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-red-500/70">Account</span>
            </div>

            <div className="flex flex-col border-b border-red-500/10 px-3.5 py-3">
              <button className="flex items-center gap-2.5 text-[#FF7722] font-bold text-xs w-full text-left hover:text-[#FF7722]/80 transition-colors">
                <Key className="w-3.5 h-3.5" /> Reset Password
              </button>
              <p className="text-[11px] text-foreground/40 mt-2 leading-relaxed">
                You logged in using Google. Please continue with Google sign-in.
              </p>
            </div>

            <button
              onClick={() => handleLogout()}
              className="w-full px-3.5 py-3 flex items-center gap-2.5 border-b border-red-500/10 text-red-400 font-bold text-xs hover:bg-red-500/5 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>

            <button className="w-full px-3.5 py-3 flex items-center gap-2.5 text-red-400 font-bold text-xs hover:bg-red-500/5 transition-colors text-left">
              <Trash className="w-3.5 h-3.5" /> Delete Account
            </button>
          </section>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - ATHLETE PASSPORT & PERFORMANCE TELEMETRY DASHBOARD
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-24 bg-background">
        {/* Ambient Hero Banner & Athlete Telemetry Passport */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
            {/* Top Navigation & Actions Bar (Clean Back Button to /home) */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Link
                  href="/home"
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0 hover:bg-white/5 cursor-pointer text-foreground/80 hover:text-foreground mr-1"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                  title="Return to Athlete Workspace"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Athlete Identity &amp; Credential Passport
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {isUserSuperAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Admin Console</span>
                  </Link>
                )}

                <button
                  onClick={openEditProfile}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => setIsThemeModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Palette className="w-3.5 h-3.5 text-primary" />
                  <span>Theme &amp; Style</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Athlete Passport ID Card */}
            <div
              className="p-6 rounded-3xl border relative overflow-hidden shadow-sm"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Avatar & Personal Dossier */}
                <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
                  {/* Interactive Avatar with Glowing Border */}
                  <div
                    className="relative w-24 h-24 rounded-3xl p-1 cursor-pointer group shadow-xl transition-transform hover:scale-105 shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, var(--athlon-primary), #10B981, #06B6D4)',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to update athlete avatar photo"
                  >
                    <div
                      className="w-full h-full rounded-[20px] overflow-hidden relative flex items-center justify-center border-2 border-background"
                      style={{ backgroundColor: 'var(--athlon-surface)' }}
                    >
                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                          <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-5 h-5 text-white" />
                      </div>
                      {profile?.photo ? (
                        <img
                          src={UserService.getPhotoUrl(profile.photo)}
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : personalProfile?.avatar ? (
                        <img src={personalProfile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-primary">
                          {profile?.firstName ? (
                            profile.firstName.charAt(0).toUpperCase()
                          ) : userEmail ? (
                            userEmail.charAt(0).toUpperCase()
                          ) : (
                            <UserIcon className="w-8 h-8 text-primary" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name, Chips & Badges */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight uppercase">
                        {profile
                          ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Athlete'
                          : personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete')}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span>Pro Verified</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/60">
                        ATH-{(profile?.uuid || userUuid || 'ATHLON').slice(0, 6).toUpperCase()}
                      </span>
                    </div>

                    {/* Metadata & Demographic Pill Badges */}
                    <div className="flex items-center gap-3 text-xs text-foreground/65 font-medium flex-wrap">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>{profile?.email || userEmail || 'athlete@athlon.com'}</span>
                      </span>
                      {profile?.phone && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{profile.phone}</span>
                        </span>
                      )}
                      {(profile?.city || profile?.district || profile?.state) && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          <span>{[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}</span>
                        </span>
                      )}
                      {profile?.dob && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {formatDob(profile.dob)}
                            {getAge(profile.dob) !== null && ` (${getAge(profile.dob)} yrs)`}
                          </span>
                        </span>
                      )}
                      {profile?.gender && (
                        <span className="flex items-center gap-1.5 shrink-0">
                          <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>{formatGender(profile.gender)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Circular Profile Completion Telemetry Gauge */}
                <div
                  className="p-4 rounded-2xl border flex items-center gap-4 shrink-0 max-w-sm"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="relative w-14 h-14 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-foreground/10" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        stroke="var(--athlon-primary)"
                        strokeDasharray={`${(completionPercent / 100) * 97.4} 97.4`}
                        style={{ transition: 'stroke-dasharray 0.6s ease' }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground font-mono">
                      {completionPercent}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
                        Profile Health
                      </span>
                      {completionPercent < 100 && (
                        <button
                          onClick={openEditProfile}
                          className="text-[9.5px] font-black uppercase tracking-wider text-primary hover:underline cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-foreground/60 leading-tight">
                      {completionPercent === 100
                        ? '100% verified athlete profile ready for tournament draws.'
                        : `${missingFields.length} field${missingFields.length > 1 ? 's' : ''} left for optimal seeding.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Telemetry HUD Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Matches */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Matches</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-foreground">{totalMatchesCount}</div>
                <span className="text-[10px] text-foreground/50 font-medium">Bouts recorded</span>
              </div>

              {/* Win Rate */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Win Rate</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">{overallWinRate}%</div>
                <span className="text-[10px] text-foreground/50 font-medium">{winsCount} won matches</span>
              </div>

              {/* Sports Disciplines */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">Disciplines</span>
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-black font-mono text-foreground">{sportsProfiles.length}</div>
                <span className="text-[10px] text-foreground/50 font-medium">Active passports</span>
              </div>

              {/* Club Affiliations */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Affiliations</span>
                  <Building2 className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black font-mono text-foreground">{organizations.length}</div>
                <span className="text-[10px] text-foreground/50 font-medium">Clubs &amp; academies</span>
              </div>

              {/* Wallet Credits */}
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between shadow-xs"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400">Credits</span>
                  <Wallet className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-black font-mono text-yellow-400">{userCredits !== null ? userCredits : 0}</div>
                <span className="text-[10px] text-foreground/50 font-medium">Athlon tokens</span>
              </div>
            </div>

            {/* Desktop Segmented Tab Filters */}
            <div className="pt-2 flex items-center gap-2 overflow-x-auto hide-scrollbar">
              {[
                { id: 'all', label: 'All Overview' },
                { id: 'sports', label: 'Sports Passports', count: sportsProfiles.length },
                { id: 'matches', label: 'Match History', count: totalMatchesCount },
                { id: 'orgs', label: 'Club Affiliations', count: organizations.length },
                { id: 'identity', label: 'Athlete Dossier' },
              ].map((tab) => {
                const active = activeDesktopTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDesktopTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                      active
                        ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: active ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                      borderColor: active ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                    }}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold"
                        style={{
                          backgroundColor: active ? 'rgba(0,0,0,0.2)' : 'var(--athlon-surface)',
                          color: active ? '#000' : 'var(--athlon-text-muted)',
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Desktop Main Content Dashboard */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-10">
          {/* Super Admin Console Quick Launcher (if super admin and tab is 'all') */}
          {isUserSuperAdmin && activeDesktopTab === 'all' && (
            <Link
              href="/admin"
              className="relative w-full rounded-3xl p-6 overflow-hidden border shadow-sm group active:scale-[0.99] hover:border-primary/40 transition-all duration-300 block"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: 'var(--athlon-primary-soft)',
                      borderColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                        Platform Governance
                      </span>
                      <span className="text-[10px] font-bold text-foreground/50 tracking-wider uppercase">
                        Super Admin Access
                      </span>
                    </div>
                    <h2 className="text-base font-black uppercase tracking-wider text-foreground">
                      Super Admin Platform Console
                    </h2>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Platform user directory, organization approvals, subscription tiers, and system logs.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider group-hover:scale-105 transition-transform">
                  <span>Launch Admin Console</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )}

          {/* 1. Athletic Disciplines & Passports Section */}
          {(activeDesktopTab === 'all' || activeDesktopTab === 'sports') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                      Athletic Disciplines ({sportsProfiles.length})
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Your verified sports passports, official skill ratings, and career win rates
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingSport(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sport Discipline</span>
                </button>
              </div>

              {/* 3-Column Sports Disciplines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sportsProfiles.map((sport) => {
                  const style = getSportStyle(sport.sportName);
                  const isSelected = selectedSportId === sport.uuid;
                  const IconComp = style.icon;

                  return (
                    <div
                      key={sport.uuid}
                      onClick={() => setSelectedSportId(sport.uuid)}
                      className={`p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                        isSelected ? 'ring-2 ring-primary/30 border-primary' : 'hover:border-primary/40'
                      }`}
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                      }}
                    >
                      {/* Top Gradient Accent Line */}
                      <div className={`h-1 w-full bg-gradient-to-r ${style.line} absolute top-0 left-0 right-0`} />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-surface border border-foreground/10 flex items-center justify-center">
                              <IconComp className={`w-4 h-4 ${style.color}`} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider text-foreground">
                              {sport.sportName}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.badge}`}>
                            {sport.category || 'Athlete'}
                          </span>
                        </div>

                        {/* 3 Metric Tiles */}
                        <div className="grid grid-cols-3 gap-2">
                          <div
                            className="p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="text-[9px] uppercase font-bold text-foreground/40 mb-0.5">Rank</span>
                            <span className="text-sm font-black font-mono text-foreground">
                              {sport.currentRanking ? `#${sport.currentRanking}` : '-'}
                            </span>
                          </div>

                          <div
                            className="p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="text-[9px] uppercase font-bold text-foreground/40 mb-0.5">Matches</span>
                            <span className="text-sm font-black font-mono text-foreground">
                              {sport.totalMatches ?? 0}
                            </span>
                          </div>

                          <div
                            className="p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="text-[9px] uppercase font-bold text-foreground/40 mb-0.5">Win Rate</span>
                            <span className="text-sm font-black font-mono text-primary">
                              {sport.winRate ? `${Math.round(sport.winRate)}%` : '0%'}
                            </span>
                          </div>
                        </div>

                        {sport.careerHighlights && (
                          <p className="text-xs text-foreground/70 italic line-clamp-2 border-l-2 border-primary/40 pl-2 py-0.5 font-medium">
                            &ldquo;{sport.careerHighlights}&rdquo;
                          </p>
                        )}
                      </div>

                      <div
                        className="flex items-center justify-between pt-3 mt-3 border-t text-[11px] font-bold text-foreground/50"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span>Active Skill Passport</span>
                        <span className="text-primary font-mono">Verified ✓</span>
                      </div>
                    </div>
                  );
                })}

                {/* Add Discipline Slot Card */}
                <div
                  onClick={() => setIsAddingSport(true)}
                  className="p-6 rounded-3xl border border-dashed flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:border-primary/50 transition-colors shadow-xs group min-h-[190px]"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: 'var(--athlon-primary-soft)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight">
                      Add Sport Discipline
                    </h3>
                    <p className="text-xs text-foreground/50 max-w-[200px] mt-0.5">
                      Register badminton, cricket, football, or tennis passport
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 2. Competitive Match History Section */}
          {(activeDesktopTab === 'all' || activeDesktopTab === 'matches') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                      Recent Match History ({totalMatchesCount})
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Past tournament fixtures, official scorecards, and head-to-head outcomes
                    </p>
                  </div>
                </div>

                <Link
                  href="/home/matches"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <span>Open Match Center</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                </Link>
              </div>

              {/* 3-Column Match Cards Grid */}
              {userMatches.length === 0 ? (
                <div
                  className="p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 shadow-xs max-w-lg mx-auto"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Trophy className="w-10 h-10 text-foreground/30" />
                  <h3 className="text-base font-black text-foreground uppercase tracking-tight">
                    No Matches Recorded Yet
                  </h3>
                  <p className="text-xs text-foreground/50 max-w-xs leading-relaxed font-medium">
                    Register for tournaments or book matches to start building your competitive record.
                  </p>
                  <Link
                    href="/tournaments"
                    className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm"
                  >
                    Explore Tournaments
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userMatches.map((m) => {
                    const isCompleted = m.status === 'COMPLETED';
                    const isWin =
                      isCompleted &&
                      m.winnerRegistrationId &&
                      ((m.teamARegistrationId && m.winnerRegistrationId === m.teamARegistrationId) ||
                        (m.teamBRegistrationId && m.winnerRegistrationId === m.teamBRegistrationId));
                    const opponentName = m.teamBName || m.teamAName || 'Opponent TBD';
                    const matchStatusText = isCompleted ? (isWin ? 'WIN' : 'LOSS') : m.status || 'SCHEDULED';
                    const scoreDisplay = m.setScores
                      ? typeof m.setScores === 'string'
                        ? m.setScores
                        : Array.isArray(m.setScores)
                        ? m.setScores.join(', ')
                        : JSON.stringify(m.setScores)
                      : m.status || 'Upcoming';

                    return (
                      <div
                        key={m.id || m.uuid}
                        className="p-5 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        {/* Status Accent Line */}
                        <div
                          className={`h-1 w-full absolute top-0 left-0 right-0 ${
                            isCompleted ? (isWin ? 'bg-emerald-500' : 'bg-red-500') : 'bg-primary'
                          }`}
                        />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isCompleted
                                  ? isWin
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                    : 'bg-red-500/15 text-red-400 border-red-500/25'
                                  : 'bg-primary/15 text-primary border-primary/25'
                              }`}
                            >
                              {matchStatusText}
                            </span>
                            <span className="text-xs text-foreground/50 font-mono">
                              {m.matchDate || 'Upcoming'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-foreground/40 block">
                              Tournament
                            </span>
                            <h3 className="text-sm font-black text-foreground truncate">
                              {m.tournamentName || 'Tournament Match'}
                            </h3>
                          </div>

                          <div
                            className="p-3 rounded-2xl border flex items-center justify-between"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-[9px] uppercase font-bold text-foreground/40 block">
                                Opponent Team
                              </span>
                              <span className="text-xs font-black text-foreground truncate block">
                                {opponentName}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] uppercase font-bold text-foreground/40 block">
                                Score / Status
                              </span>
                              <span className="text-xs font-black font-mono text-primary truncate block">
                                {scoreDisplay}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href="/home/matches"
                          className="flex items-center justify-between pt-3 mt-3 border-t text-xs font-bold text-primary hover:underline"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          <span>Review Scorecard</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* 3. Club & Academy Affiliations Section */}
          {(activeDesktopTab === 'all' || activeDesktopTab === 'orgs') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                      Club &amp; Academy Affiliations ({organizations.length})
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Organizations, training academies, and coaching teams you belong to
                    </p>
                  </div>
                </div>

                <Link
                  href="/academies"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <span>Explore Academies</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              </div>

              {/* 3-Column Organizations Grid */}
              {organizations.length === 0 ? (
                <div
                  className="p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3 shadow-xs max-w-lg mx-auto"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Building2 className="w-10 h-10 text-foreground/30" />
                  <h3 className="text-base font-black text-foreground uppercase tracking-tight">
                    No Club Affiliations
                  </h3>
                  <p className="text-xs text-foreground/50 max-w-xs leading-relaxed font-medium">
                    Join an academy or organization to access group training, court bookings, and club fixtures.
                  </p>
                  <Link
                    href="/academies"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm"
                  >
                    Browse Academies
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {organizations.map((org, index) => {
                    const orgKey = (org as any).uuid || org.orgId || (org as any).id || index;
                    const orgHref = `/org/${(org as any).uuid || org.orgId || (org as any).id}/dashboard`;

                    return (
                      <div
                        key={orgKey}
                        className="p-5 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0 right-0" />

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-black text-lg shrink-0">
                              {org.name ? org.name.charAt(0).toUpperCase() : 'O'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-black text-foreground truncate">{org.name}</h3>
                              <span className="text-[10px] uppercase font-bold text-foreground/50 block">
                                {org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER'
                                  ? 'Venue Manager'
                                  : org.type === 'COACH'
                                  ? 'Freelance Coach'
                                  : org.type || 'Academy / Club'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={orgHref}
                          className="w-full mt-4 py-2.5 rounded-xl bg-surface border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all"
                        >
                          <span>Open Workspace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* 4. Athlete Personal Credentials Dossier Section */}
          {(activeDesktopTab === 'all' || activeDesktopTab === 'identity') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                      Athlete Identity &amp; Account Dossier
                    </h2>
                    <p className="text-xs text-foreground/50">
                      Official contact channels, demographic verification, and account security
                    </p>
                  </div>
                </div>

                <button
                  onClick={openEditProfile}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Athlete Details</span>
                </button>
              </div>

              {/* Dossier Grid */}
              <div
                className="p-6 rounded-3xl border shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                {/* Legal Name */}
                <div
                  className="p-4 rounded-2xl border space-y-1"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 block">
                    Full Legal Name
                  </span>
                  <div className="text-sm font-black text-foreground">
                    {profile?.firstName || profile?.lastName
                      ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
                      : 'Not Configured'}
                  </div>
                  <span className="text-[10px] text-primary font-mono block">Verified Profile</span>
                </div>

                {/* Email Address */}
                <div
                  className="p-4 rounded-2xl border space-y-1"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 block">
                    Contact Email
                  </span>
                  <div className="text-sm font-black text-foreground truncate">
                    {profile?.email || userEmail || 'Not Provided'}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">Primary Notification Channel</span>
                </div>

                {/* Contact Phone */}
                <div
                  className="p-4 rounded-2xl border space-y-1"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 block">
                    Mobile Phone
                  </span>
                  <div className="text-sm font-black text-foreground">
                    {profile?.phone || 'Not Provided'}
                  </div>
                  <span className="text-[10px] text-foreground/50 font-mono block">SMS &amp; Match Day Dispatches</span>
                </div>

                {/* Geography / State & City */}
                <div
                  className="p-4 rounded-2xl border space-y-1"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 block">
                    State &amp; City
                  </span>
                  <div className="text-sm font-black text-foreground truncate">
                    {[profile?.city, profile?.state].filter(Boolean).join(', ') || 'Not Configured'}
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono block">Regional Tournament Circuit</span>
                </div>

                {/* Date of Birth */}
                <div
                  className="p-4 rounded-2xl border space-y-1"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 block">
                    Date of Birth
                  </span>
                  <div className="text-sm font-black text-foreground">
                    {profile?.dob ? formatDob(profile.dob) : 'Not Provided'}
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono block">
                    {profile?.dob && getAge(profile.dob) !== null ? `Age: ${getAge(profile.dob)} years` : 'Age Category Unverified'}
                  </span>
                </div>

                {/* Gender */}
                <div
                  className="p-4 rounded-2xl border space-y-1"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/45 block">
                    Gender Identity
                  </span>
                  <div className="text-sm font-black text-foreground">
                    {profile?.gender ? formatGender(profile.gender) : 'Not Specified'}
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono block">Division Brackets Eligibility</span>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div
            className="w-full max-w-md p-6 rounded-[32px] border space-y-5 shadow-2xl bg-card"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground">Edit Athlete Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-foreground/50 hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">Date of Birth</label>
                  <input
                    id="edit-profile-dob"
                    type="date"
                    value={editDob}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">Gender</label>
                  <select
                    id="edit-profile-gender"
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary cursor-pointer"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="">-- Select --</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Dynamic State Selection */}
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">State</label>
                <select
                  value={editState}
                  onChange={(e) => {
                    const chosenState = e.target.value;
                    setEditState(chosenState);
                    setEditDistrict('');
                  }}
                  className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary cursor-pointer"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <option value="">-- Choose State --</option>
                  {statesList.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic District & City Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">District</label>
                  <select
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    disabled={!editState}
                    className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary disabled:opacity-40 cursor-pointer"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <option value="">
                      {!editState ? 'Select state first' : districtsList.length === 0 ? 'No districts' : '-- Choose District --'}
                    </option>
                    {districtsList.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">City / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Kozhikode"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfileSubmit}
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2"
              >
                {isSavingProfile && (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sport Profile Modal Dialog */}
      {isAddingSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div
            className="w-full max-w-md p-6 rounded-[32px] border space-y-5 shadow-2xl bg-card"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground">Add Sports Profile</h3>
              <button
                onClick={() => setIsAddingSport(false)}
                className="text-foreground/50 hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">Sport Discipline</label>
                <select
                  value={newSportName}
                  onChange={(e) => setNewSportName(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <option value="Badminton">Badminton</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Volleyball">Volleyball</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">Skill Tier</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">
                  Current Ranking (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={newRanking}
                  onChange={(e) => setNewRanking(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs font-bold text-foreground bg-surface outline-none focus:border-primary"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-foreground/50 block mb-1">
                  Career Highlights (Optional)
                </label>
                <textarea
                  placeholder="e.g. Winner of State Open 2025"
                  value={newHighlights}
                  onChange={(e) => setNewHighlights(e.target.value)}
                  className="w-full p-3 rounded-xl border text-xs font-medium text-foreground bg-surface outline-none focus:border-primary resize-none h-20"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAddingSport(false)}
                className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSportsProfile}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Sport Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />

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
