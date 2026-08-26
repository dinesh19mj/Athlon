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
import MyOrganizationsList from '@/components/MyOrganizationsList';
import { ThemeSelector, ThemeModal } from '@/components/theme';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { PlayerService } from '@/lib/api/player';
import { UserService, UserResponse, SportsProfileResponse } from '@/lib/api/user';
import { OrganizationService, Organization } from '@/lib/api/organization';

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
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleEditProfileSubmit = async () => {
    if (!userUuid) return;
    setIsSavingProfile(true);
    try {
      const res = await UserService.updateUser({
        uuid: userUuid,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
      });
      if (res.success && res.data) {
        setProfile(res.data);
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
    if (!playerId || !token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      if (!userUuid) {
        setLoading(false);
        return;
      }
      try {
        const [res, orgsRes] = await Promise.all([
          UserService.getUserByUuid(userUuid),
          OrganizationService.getByUserUuid(userUuid),
        ]);
        if (res.success && res.data) {
          setProfile(res.data);
          setPersonalProfile({
            id: res.data.uuid,
            name: `${res.data.firstName} ${res.data.lastName}`,
            athlonId: '',
            avatar: (res.data as any).photo
              ? `http://localhost:5050/player/photo/${(res.data as any).photo}`
              : '',
          });
        }
        if (orgsRes?.data) {
          setOrganizations(orgsRes.data);
          setStoreOrganizations(
            orgsRes.data.map((o: any) => ({
              id: o.uuid,
              name: o.name,
              type: o.type,
              logo: o.logo,
            }))
          );
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
    if (!file || !playerId || !token) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/player/updatePhoto/${playerId}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
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

  const matchHistory = [
    {
      id: 1,
      opponent: 'Rahul Verma',
      tournament: 'Smash Arena Practice',
      result: 'WIN',
      score: '21-18, 21-15',
      date: 'Yesterday',
    },
    {
      id: 2,
      opponent: 'Vikram Singh',
      tournament: 'District Qualifiers',
      result: 'LOSS',
      score: '19-21, 21-18, 15-21',
      date: '12 Jul 2024',
    },
    {
      id: 3,
      opponent: 'Amit Sharma',
      tournament: 'Corporate League',
      result: 'WIN',
      score: '21-12, 21-10',
      date: '08 Jul 2024',
    },
    {
      id: 4,
      opponent: 'Karthik N.',
      tournament: 'Friendly Match',
      result: 'WIN',
      score: '21-19, 21-17',
      date: '05 Jul 2024',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <Link href="/home" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold uppercase tracking-wider">My Profile</h1>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 -mr-2 text-foreground hover:text-gray-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 top-12 w-64 bg-surface border border-foreground/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col">
                  <div className="px-4 py-2 border-b border-foreground/5">
                    <ContextSwitcher />
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setEditFirstName(profile?.firstName || '');
                      setEditLastName(profile?.lastName || '');
                      setEditPhone(profile?.phone || '');
                      setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Edit3 className="w-4 h-4 text-foreground/70" /> Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsThemeModalOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Palette className="w-4 h-4 text-primary" /> Appearance &amp; Theme
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Wallet className="w-4 h-4 text-[#FF7722]" /> My Wallet
                  </button>
                  <Link
                    href="/settings"
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5"
                  >
                    <Settings className="w-4 h-4 text-foreground/70" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-6">
          {/* User Identity Header */}
          <section className="flex flex-col items-center relative">
            {/* Avatar with Glow */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 animate-pulse" />
              <div
                className="relative w-24 h-24 rounded-full bg-primary p-[3px] cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full bg-background border-4 border-[#0A0F1A] overflow-hidden relative">
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  {(profile as any)?.photo ? (
                    <img
                      src={`http://localhost:5050/player/photo/${(profile as any).photo}`}
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
                    <div className="w-full h-full flex items-center justify-center bg-surface text-primary font-black text-2xl">
                      {profile?.firstName ? (
                        profile.firstName.charAt(0).toUpperCase()
                      ) : userEmail ? (
                        userEmail.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="w-8 h-8 text-primary" />
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
                <h2 className="text-2xl font-black text-foreground tracking-wide mt-2">
                  {loading ? (
                    <span className="inline-block w-40 h-7 bg-white/10 rounded-lg animate-pulse" />
                  ) : profile ? (
                    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Athlete'
                  ) : (
                    personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete')
                  )}
                </h2>

                {profile?.phone && (
                  <div className="flex items-center gap-1.5 text-foreground/50 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{profile.phone}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full mt-4 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditProfileSubmit}
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 text-xs font-bold bg-primary text-black rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
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
          <section className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-surface border border-foreground/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg">
              <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
              <span className="text-xl font-black text-foreground">0</span>
              <span className="text-[9px] uppercase tracking-wider text-foreground/50 font-bold">Matches</span>
            </div>
            <div className="bg-surface border border-primary/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(0,255,102,0.05)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <Target className="w-5 h-5 text-primary mb-1 relative z-10" />
              <span className="text-xl font-black text-foreground relative z-10">0%</span>
              <span className="text-[9px] uppercase tracking-wider text-primary font-bold relative z-10">Win Rate</span>
            </div>
            <div className="bg-surface border border-foreground/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg">
              <Zap className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-xl font-black text-foreground">
                {sportsProfiles[0]?.currentRanking || '0'}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-foreground/50 font-bold">RANK</span>
            </div>
          </section>

          {/* PERSONAL INFO */}
          <section className="bg-surface border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between border-b border-foreground/5">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Personal Info</span>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </div>
            <div className="px-4 py-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/60">Email</span>
              <span className="text-sm font-medium text-white">{profile?.email || userEmail || '-'}</span>
            </div>
          </section>

          {/* SPORTS PROFILE */}
          <section className="bg-surface border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between border-b border-foreground/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Sports Profile</span>
              </div>
              <button
                onClick={() => setIsAddingSport(true)}
                className="text-[10px] font-bold text-primary hover:text-white transition-colors flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md"
              >
                <Plus className="w-3 h-3" /> Add New
              </button>
            </div>

            <div className="px-4 py-3 border-b border-foreground/5 overflow-x-auto hide-scrollbar flex gap-2">
              {sportsProfiles.length === 0 ? (
                <span className="text-sm text-foreground/50">No sports profiles found.</span>
              ) : (
                sportsProfiles.map((sp) => (
                  <button
                    key={sp.uuid}
                    onClick={() => setSelectedSportId(sp.uuid)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedSportId === sp.uuid
                        ? 'bg-primary text-black'
                        : 'bg-surface border border-foreground/10 text-foreground/70 hover:border-primary/50'
                    }`}
                  >
                    {sp.sportName}
                  </button>
                ))
              )}
            </div>

            {isAddingSport && (
              <div className="p-4 border-b border-foreground/5 bg-foreground/5">
                <div className="flex flex-col gap-3">
                  <select
                    value={newSportName}
                    onChange={(e) => setNewSportName(e.target.value)}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none"
                  >
                    <option value="Badminton">Badminton</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Volleyball">Volleyball</option>
                  </select>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Current Ranking (Optional)"
                    value={newRanking}
                    onChange={(e) => setNewRanking(e.target.value)}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none placeholder:text-foreground/40"
                  />
                  <textarea
                    placeholder="Career Highlights (Optional)"
                    value={newHighlights}
                    onChange={(e) => setNewHighlights(e.target.value)}
                    className="w-full bg-surface border border-foreground/10 rounded-lg p-3 text-sm text-foreground focus:border-primary outline-none resize-none h-24 placeholder:text-foreground/40"
                  />
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      onClick={() => setIsAddingSport(false)}
                      className="px-4 py-2 text-xs font-bold text-foreground/60 hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSportsProfile}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 text-xs font-bold bg-primary text-black rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(27,156,86,0.2)]"
                    >
                      {isSubmitting && (
                        <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      )}
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isAddingSport &&
              sportsProfiles
                .filter((sp) => sp.uuid === selectedSportId)
                .map((sp) => (
                  <div key={sp.uuid}>
                    <div className="px-4 py-4 flex items-center justify-between border-b border-foreground/5">
                      <span className="text-sm font-medium text-foreground/60">Sport</span>
                      <span className="text-sm font-medium text-white">{sp.sportName}</span>
                    </div>
                    <div className="px-4 py-4 flex items-center justify-between border-b border-foreground/5">
                      <span className="text-sm font-medium text-foreground/60">Ranking</span>
                      <span className="text-sm font-medium text-white">{sp.currentRanking || 'N/A'}</span>
                    </div>
                    <div className="px-4 py-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground/60">Highlights</span>
                      <span className="text-sm font-medium text-white">{sp.careerHighlights || 'None'}</span>
                    </div>
                  </div>
                ))}
          </section>

          <MyOrganizationsList />

          {/* REWARDS */}
          <section className="bg-surface border border-primary/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-primary/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Rewards</span>
            </div>
            <div className="px-4 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-white truncate">Referrals</span>
                  <span className="text-[10px] font-medium text-foreground/40 truncate">
                    Invite players · earn credits
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold">
                  0 credits
                </span>
                <ChevronRight className="w-4 h-4 text-foreground/30" />
              </div>
            </div>
          </section>

          {/* LEGAL */}
          <section className="bg-surface border border-foreground/5 rounded-2xl overflow-hidden shadow-sm mt-4">
            <div className="px-4 py-3 border-b border-foreground/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Legal</span>
            </div>
            <button className="w-full px-4 py-4 flex items-center justify-between border-b border-foreground/5 hover:bg-foreground/5 transition-colors text-left">
              <span className="text-sm font-medium text-white">Terms &amp; Conditions</span>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </button>
            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left">
              <span className="text-sm font-medium text-white">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </button>
          </section>

          {/* SUPPORT & HELP */}
          <section className="bg-surface border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-foreground/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Support &amp; Help</span>
            </div>
            <button className="w-full px-4 py-4 flex items-center justify-between border-b border-foreground/5 hover:bg-foreground/5 transition-colors text-left">
              <div className="flex items-center gap-3 text-white">
                <Mail className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-medium text-white">admin@athlon.com</span>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </button>
            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left">
              <div className="flex items-center gap-3 text-white">
                <Phone className="w-4 h-4 text-foreground/60" />
                <span className="text-sm font-medium text-white">+91 8891704026</span>
              </div>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </button>
          </section>

          {/* ACCOUNT */}
          <section className="bg-surface border border-red-500/20 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-red-500/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500/70">Account</span>
            </div>

            <div className="flex flex-col border-b border-red-500/10 px-4 py-4">
              <button className="flex items-center gap-3 text-[#FF7722] font-bold text-sm w-full text-left hover:text-[#FF7722]/80 transition-colors">
                <Key className="w-4 h-4" /> Reset Password
              </button>
              <p className="text-xs text-foreground/40 mt-3 leading-relaxed">
                You logged in using Google. Please continue with Google sign-in.
              </p>
            </div>

            <button
              onClick={() => handleLogout()}
              className="w-full px-4 py-4 flex items-center gap-3 border-b border-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/5 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>

            <button className="w-full px-4 py-4 flex items-center gap-3 text-red-400 font-bold text-sm hover:bg-red-500/5 transition-colors text-left">
              <Trash className="w-4 h-4" /> Delete Account
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
                  {(profile as any)?.photo ? (
                    <img
                      src={`http://localhost:5050/player/photo/${(profile as any).photo}`}
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
                    {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Athlete'}
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
                <Activity className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Sports Profiles &amp; Skill Tiers</h2>
                  <p className="text-xs text-foreground/50">Your active disciplines, rankings, and career highlights</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddingSport(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-black hover:bg-primary hover:text-black transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>Add Sport</span>
                </button>

                <div className="flex items-center gap-1.5">
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
            </div>

            <div
              ref={sportsTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {sportsProfiles.length === 0 ? (
                <div
                  className="snap-start shrink-0 w-[360px] p-6 rounded-[28px] border border-dashed flex flex-col items-center justify-center text-center space-y-3"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Activity className="w-10 h-10 text-foreground/30" />
                  <h3 className="text-sm font-black text-foreground">No Sports Profiles Added</h3>
                  <p className="text-xs text-foreground/50">Add Badminton, Cricket, Football or Volleyball</p>
                  <button
                    onClick={() => setIsAddingSport(true)}
                    className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs"
                  >
                    Add Sport Profile
                  </button>
                </div>
              ) : (
                sportsProfiles.map((sp) => (
                  <div key={sp.uuid} className="snap-start shrink-0 w-[360px]">
                    <div
                      className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-5 hover:border-primary/50 transition-all group"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div className="h-1 w-full bg-primary absolute top-0 left-0 right-0" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-foreground">{sp.sportName}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {(sp as any).category || sp.verificationStatus || 'Competitor'}
                          </span>
                        </div>

                        <div
                          className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-center"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Division Rank</span>
                            <span className="text-base font-black text-primary font-mono">
                              #{sp.currentRanking || '12'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Skill Level</span>
                            <span className="text-xs font-black text-emerald-400 font-mono">
                              {(sp as any).category || 'Advanced'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-foreground/40 block mb-1">
                            Career Highlights
                          </span>
                          <p className="text-xs text-foreground/75 leading-relaxed bg-surface/50 p-3 rounded-xl border border-foreground/5">
                            {sp.careerHighlights || 'Active competitor registered for tournament leagues'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
              {matchHistory.map((m) => {
                const isWin = m.result === 'WIN';
                return (
                  <div key={m.id} className="snap-start shrink-0 w-[360px]">
                    <div
                      className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-primary/40 transition-all"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div
                        className={`h-1 w-full absolute top-0 left-0 right-0 ${
                          isWin ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isWin
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                : 'bg-red-500/15 text-red-400 border-red-500/25'
                            }`}
                          >
                            {m.result}
                          </span>
                          <span className="text-xs text-foreground/50 font-medium">{m.date}</span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-foreground/40 block">Tournament</span>
                          <h3 className="text-sm font-black text-foreground truncate">{m.tournament}</h3>
                        </div>

                        <div
                          className="p-3 rounded-2xl border flex items-center justify-between"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Opponent</span>
                            <span className="text-xs font-black text-foreground">{m.opponent}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Score</span>
                            <span className="text-xs font-black font-mono text-primary">{m.score}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                              {org.type || 'Academy / Club'}
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
