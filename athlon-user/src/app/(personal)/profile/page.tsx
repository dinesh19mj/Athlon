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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContextSwitcher from '@/components/ContextSwitcher';
import { ThemeSelector, ThemeModal } from '@/components/theme';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { UserService, UserResponse, SportsProfileResponse } from '@/lib/api/user';
import { OrganizationService, Organization } from '@/lib/api/organization';
import { LocationService, FALLBACK_INDIAN_STATES, FALLBACK_STATE_DISTRICTS } from '@/lib/api/location';
import { RewardsService } from '@/lib/api/rewards';
import { MatchService, Match } from '@/lib/api/matches';

export default function ProfilePage() {
  const { userId: playerId, userUuid, token, logout, userEmail } = useAuthStore();
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
          setEditFirstName(data.firstName || '');
          setEditLastName(data.lastName || '');
          setEditPhone(data.phone || '');
          setEditCity(data.city || '');
          setEditDistrict(data.district || '');
          setEditState(data.state || '');
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
      const res = await UserService.uploadProfilePhoto(targetUuid, file);
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
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur-md border-b border-foreground/5">
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
                  <div className="px-3.5 py-2 border-b border-foreground/5">
                    <ContextSwitcher />
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setEditFirstName(profile?.firstName || '');
                      setEditLastName(profile?.lastName || '');
                      setEditPhone(profile?.phone || '');
                      setEditCity(profile?.city || '');
                      setEditDistrict(profile?.district || '');
                      setEditState(profile?.state || '');
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
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#FF7722]" /> My Wallet
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
                    />
                  ) : personalProfile?.avatar ? (
                    <img
                      src={personalProfile.avatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover relative z-0"
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
             - ATHLETE PASSPORT & HORIZONTAL SCROLLING TRACKS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Athlete Banner & Passport Header */}
        <section
          className="border-b px-8 py-10 bg-gradient-to-b from-card/80 via-card/40 to-background relative overflow-hidden"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-[450px] h-[250px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 flex-wrap relative z-10">
            {/* Athlete Info Header */}
            <div className="flex items-center gap-6">
              {/* Interactive Avatar */}
              <div
                className="relative w-28 h-28 rounded-[32px] p-1 cursor-pointer group shadow-2xl transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--athlon-primary), #10B981, #06B6D4)',
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to update athlete avatar photo"
              >
                <div
                  className="w-full h-full rounded-[28px] overflow-hidden relative flex items-center justify-center border-2 border-background"
                  style={{ backgroundColor: 'var(--athlon-card)' }}
                >
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-6 h-6 text-white" />
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
                    <span className="text-3xl font-black text-primary">
                      {profile?.firstName ? (
                        profile.firstName.charAt(0).toUpperCase()
                      ) : userEmail ? (
                        userEmail.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="w-10 h-10 text-primary" />
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-foreground tracking-tight">
                    {profile ? (`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Athlete') : (personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete'))}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/30">
                    Pro Verified
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-foreground/60 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {profile?.email || userEmail || 'athlete@athlon.com'}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {profile.phone}
                    </span>
                  )}
                  {(profile?.city || profile?.district || profile?.state) && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {[profile.city, profile.district, profile.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditFirstName(profile?.firstName || '');
                  setEditLastName(profile?.lastName || '');
                  setEditPhone(profile?.phone || '');
                  setEditCity(profile?.city || '');
                  setEditDistrict(profile?.district || '');
                  setEditState(profile?.state || '');
                  setIsEditingProfile(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <Edit3 className="w-4 h-4 text-primary" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <Palette className="w-4 h-4 text-primary" />
                <span>Theme &amp; Style</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-black uppercase tracking-wider active:scale-95 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </section>

        {/* Desktop Main Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-10 space-y-12">
          {/* 1. Sports Disciplines Track (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Athletic Disciplines</h2>
                  <p className="text-xs text-foreground/50">Your active sports passports, tiers, and win ratios</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingSport(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all mr-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Sport</span>
                </button>
                <button
                  onClick={() => scrollTrack(sportsTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(sportsTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={sportsTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {sportsProfiles.length === 0 ? (
                <div
                  className="snap-start shrink-0 w-[360px] p-6 rounded-[28px] border border-dashed flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  onClick={() => setIsAddingSport(true)}
                >
                  <Sparkles className="w-10 h-10 text-primary/40" />
                  <h3 className="text-sm font-black text-foreground">No Sports Profile Yet</h3>
                  <p className="text-xs text-foreground/50">Add your first sport to track rankings and matches</p>
                  <span className="text-xs font-black text-primary uppercase tracking-wider">+ Add Sport Now</span>
                </div>
              ) : (
                sportsProfiles.map((sport) => {
                  const isSelected = selectedSportId === sport.uuid;
                  return (
                    <div
                      key={sport.uuid}
                      className="snap-start shrink-0 w-[360px] cursor-pointer"
                      onClick={() => setSelectedSportId(sport.uuid)}
                    >
                      <div
                        className={`p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl transition-all ${
                          isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40'
                        }`}
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                        }}
                      >
                        <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400 absolute top-0 left-0 right-0" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-primary font-mono">
                              {sport.sportName}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-foreground/80 border border-white/10">
                              {sport.category || 'Athlete'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div
                              className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                            >
                              <span className="text-[9px] uppercase font-bold text-foreground/40 mb-1">Rank</span>
                              <span className="text-sm font-black font-mono text-foreground">
                                {sport.currentRanking ? `#${sport.currentRanking}` : '-'}
                              </span>
                            </div>

                            <div
                              className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                            >
                              <span className="text-[9px] uppercase font-bold text-foreground/40 mb-1">Matches</span>
                              <span className="text-sm font-black font-mono text-foreground">{sport.totalMatches ?? 0}</span>
                            </div>

                            <div
                              className="p-3 rounded-2xl border flex flex-col items-center justify-center text-center"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                            >
                              <span className="text-[9px] uppercase font-bold text-foreground/40 mb-1">Win Rate</span>
                              <span className="text-sm font-black font-mono text-primary">
                                {sport.winRate ? `${Math.round(sport.winRate)}%` : '0%'}
                              </span>
                            </div>
                          </div>

                          {sport.careerHighlights && (
                            <p className="text-xs text-foreground/60 italic line-clamp-2">
                              &ldquo;{sport.careerHighlights}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 2. Match History Track (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Recent Match History</h2>
                  <p className="text-xs text-foreground/50">Past tournament bouts, scores, and head-to-head outcomes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(historyTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(historyTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={historyTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {userMatches.length === 0 ? (
                <div
                  className="snap-start shrink-0 w-[360px] p-6 rounded-[28px] border border-dashed flex flex-col items-center justify-center text-center space-y-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Trophy className="w-10 h-10 text-foreground/30" />
                  <h3 className="text-sm font-black text-foreground">No Matches Played Yet</h3>
                  <p className="text-xs text-foreground/50">Register for tournaments or book matches to build your competitive history.</p>
                  <Link
                    href="/tournaments"
                    className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider"
                  >
                    Browse Tournaments
                  </Link>
                </div>
              ) : (
                userMatches.map((m) => {
                  const isCompleted = m.status === 'COMPLETED';
                  const isWin = isCompleted && m.winnerRegistrationId && (
                    (m.teamARegistrationId && m.winnerRegistrationId === m.teamARegistrationId) ||
                    (m.teamBRegistrationId && m.winnerRegistrationId === m.teamBRegistrationId)
                  );
                  const opponentName = m.teamBName || m.teamAName || 'TBD Opponent';
                  const matchStatusText = isCompleted ? (isWin ? 'WIN' : 'LOSS') : (m.status || 'SCHEDULED');
                  const scoreDisplay = m.setScores 
                    ? (typeof m.setScores === 'string' ? m.setScores : Array.isArray(m.setScores) ? m.setScores.join(', ') : JSON.stringify(m.setScores))
                    : (m.status || 'Upcoming');

                  return (
                    <div key={m.id || m.uuid} className="snap-start shrink-0 w-[360px]">
                      <div
                        className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-primary/40 transition-all"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
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
                                  ? (isWin ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25')
                                  : 'bg-primary/15 text-primary border-primary/25'
                              }`}
                            >
                              {matchStatusText}
                            </span>
                            <span className="text-xs text-foreground/50 font-medium">{m.matchDate || 'Upcoming'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-foreground/40 block">Tournament</span>
                            <h3 className="text-sm font-black text-foreground truncate">{m.tournamentName || 'Tournament Match'}</h3>
                          </div>

                          <div
                            className="p-3 rounded-2xl border flex items-center justify-between"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div>
                              <span className="text-[9px] uppercase font-bold text-foreground/40 block">Opponent / Team</span>
                              <span className="text-xs font-black text-foreground truncate max-w-[140px] block">{opponentName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase font-bold text-foreground/40 block">Score / Status</span>
                              <span className="text-xs font-black font-mono text-primary truncate max-w-[120px] block">{scoreDisplay}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 3. Organizations Track (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Club &amp; Academy Affiliations</h2>
                  <p className="text-xs text-foreground/50">Organizations and coaching workspaces you belong to</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(orgsTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(orgsTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={orgsTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {organizations.length === 0 ? (
                <div
                  className="snap-start shrink-0 w-[360px] p-6 rounded-[28px] border border-dashed flex flex-col items-center justify-center text-center space-y-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Building2 className="w-10 h-10 text-foreground/30" />
                  <h3 className="text-sm font-black text-foreground">No Club Affiliations</h3>
                  <p className="text-xs text-foreground/50">Join an academy or organization to train and compete</p>
                  <Link
                    href="/academies"
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs"
                  >
                    Browse Academies
                  </Link>
                </div>
              ) : (
                organizations.map((org, index) => {
                  const orgKey = (org as any).uuid || org.orgId || (org as any).id || index;
                  const orgHref = `/org/${(org as any).uuid || org.orgId || (org as any).id}/dashboard`;
                  return (
                    <div key={orgKey} className="snap-start shrink-0 w-[360px]">
                      <div
                        className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-emerald-500/50 transition-all"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0 right-0" />

                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-black text-lg shrink-0">
                            {org.name ? org.name.charAt(0).toUpperCase() : 'O'}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-foreground truncate">{org.name}</h3>
                            <span className="text-[10px] uppercase font-bold text-foreground/50">
                              {org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER' ? 'Venue Manager' : org.type === 'COACH' ? 'Freelance Coach' : org.type || 'Academy / Club'}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={orgHref}
                          className="w-full py-2.5 rounded-xl bg-surface border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all"
                        >
                          <span>Open Workspace</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
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
