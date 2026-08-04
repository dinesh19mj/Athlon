'use client';

import { ArrowLeft, Settings, MapPin, Edit3, Wallet, Trophy, Target, Zap, Activity, UserPlus, ChevronRight, LogOut, CreditCard, User as UserIcon, Gift, Mail, Phone, Key, Trash, FileText, ShieldCheck as ShieldAlert, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ContextSwitcher from '@/components/ContextSwitcher';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { PlayerService } from '@/lib/api/player';


export default function ProfilePage() {
  const { userId: playerId, token, logout, userEmail } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [roles, setRoles] = useState<string[]>([]);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sportsProfiles = [
    { id: 1, sport: 'Badminton', level: 'Intermediate', handedness: 'Right' },
    { id: 2, sport: 'Cricket', level: 'Amateur', handedness: 'Right' },
  ];
  const [selectedSportId, setSelectedSportId] = useState(1);

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
      try {
        const res = await PlayerService.getById(parseInt(playerId));
        setProfile(res);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const res = await PlayerService.getRoles(parseInt(playerId));
        // map if it returns object array or just strings
        if (Array.isArray(res)) {
          // Check if it's returning strings or objects based on previous mock
          setRoles(res.map(r => typeof r === 'string' ? r : (r as any).roleName || r));
        }
      } catch (error) {
        console.error('Failed to fetch roles', error);
      }
    };

    fetchProfile();
    fetchRoles();
  }, [playerId, token]);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !playerId || !token) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/player/updatePhoto/${playerId}`, {
        method: 'PUT',
        body: formData,
      });

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
    { id: 1, opponent: 'Rahul Verma', tournament: 'Smash Arena Practice', result: 'WIN', score: '21-18, 21-15', date: 'Yesterday' },
    { id: 2, opponent: 'Vikram Singh', tournament: 'District Qualifiers', result: 'LOSS', score: '19-21, 21-18, 15-21', date: '12 Jul 2024' },
    { id: 3, opponent: 'Amit Sharma', tournament: 'Corporate League', result: 'WIN', score: '21-12, 21-10', date: '08 Jul 2024' },
    { id: 4, opponent: 'Karthik N.', tournament: 'Friendly Match', result: 'WIN', score: '21-19, 21-17', date: '05 Jul 2024' },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#1B9C56] selection:text-black">

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/home" className="p-2 -ml-2 text-foreground hover:text-[#1B9C56] transition-colors">
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
                <button onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5">
                  <Edit3 className="w-4 h-4 text-foreground/70" /> Edit Profile
                </button>
                <button onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5">
                  <Wallet className="w-4 h-4 text-[#FF7722]" /> My Wallet
                </button>
                <button onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground hover:bg-foreground/5 transition-colors text-left border-b border-foreground/5">
                  <Settings className="w-4 h-4 text-foreground/70" /> Settings
                </button>
                <button onClick={() => { setIsSettingsOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left">
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
            <div className="absolute inset-0 bg-[#1B9C56] rounded-full blur-xl opacity-30 animate-pulse" />
            <div
              className="relative w-24 h-24 rounded-full bg-[#1B9C56] p-[3px] cursor-pointer group"
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
                <img
                  src={profile?.photo ? `http://localhost:5050/player/photo/${profile.photo}` : "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                  alt="User Avatar"
                  className="w-full h-full object-cover relative z-0"
                />
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

          <h2 className="text-2xl font-black text-foreground tracking-wide mt-2">
            {profile ? `${profile.firstName} ${profile.lastName}` : 'Dinesh Kumar'}
          </h2>

          <div className="flex items-center gap-1.5 text-foreground/50 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{profile?.bio || 'Bangalore, India'}</span>
          </div>


        </section>




        {/* Core Stats Grid */}
        <section className="grid grid-cols-3 gap-3 mt-2">
          <div className="bg-surface border border-foreground/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg">
            <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-xl font-black text-foreground">42</span>
            <span className="text-[9px] uppercase tracking-wider text-foreground/50 font-bold">Matches</span>
          </div>
          <div className="bg-surface border border-[#1B9C56]/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-[0_0_15px_rgba(0,255,102,0.05)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1B9C56]/5 to-transparent pointer-events-none" />
            <Target className="w-5 h-5 text-[#1B9C56] mb-1 relative z-10" />
            <span className="text-xl font-black text-foreground relative z-10">72%</span>
            <span className="text-[9px] uppercase tracking-wider text-[#1B9C56] font-bold relative z-10">Win Rate</span>
          </div>
          <div className="bg-surface border border-foreground/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg">
            <Zap className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-xl font-black text-foreground">6</span>
            <span className="text-[9px] uppercase tracking-wider text-foreground/50 font-bold">RANK</span>
          </div>
        </section>

        {/* CURRENT WORKSPACE */}
        <section className="bg-[#121824] border border-[#1B9C56]/30 p-4 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1B9C56]" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#1B9C56]/10 flex items-center justify-center border border-[#1B9C56]/20">
              <Activity className="w-6 h-6 text-[#1B9C56]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Current Workspace</span>
              <span className="text-2xl font-black text-white">Player</span>
            </div>
          </div>
          <button className="bg-[#1B9C56]/10 text-[#1B9C56] hover:bg-[#1B9C56]/20 border border-[#1B9C56]/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors z-10">
            Switch
          </button>
        </section>

        {/* PERSONAL INFO */}
        <section className="bg-[#121824] border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between border-b border-foreground/5">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#1B9C56]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Personal Info</span>
            </div>
            <ChevronRight className="w-4 h-4 text-foreground/30" />
          </div>
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground/60">Email</span>
            <span className="text-sm font-medium text-white">{profile?.email || userEmail || 'teendinesh2u@gmail.com'}</span>
          </div>
        </section>

        {/* SPORTS PROFILE */}
        <section className="bg-[#121824] border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between border-b border-foreground/5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1B9C56]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Sports Profile</span>
            </div>
            <button className="text-[10px] font-bold text-[#1B9C56] hover:text-white transition-colors flex items-center gap-1 bg-[#1B9C56]/10 px-2 py-1 rounded-md">
              <Plus className="w-3 h-3" /> Add New
            </button>
          </div>

          <div className="px-4 py-3 border-b border-foreground/5 overflow-x-auto hide-scrollbar flex gap-2">
            {sportsProfiles.map(sp => (
              <button
                key={sp.id}
                onClick={() => setSelectedSportId(sp.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedSportId === sp.id
                    ? 'bg-[#1B9C56] text-black'
                    : 'bg-surface border border-foreground/10 text-foreground/70 hover:border-[#1B9C56]/50'
                  }`}
              >
                {sp.sport}
              </button>
            ))}
          </div>

          {sportsProfiles.filter(sp => sp.id === selectedSportId).map(sp => (
            <div key={sp.id}>
              <div className="px-4 py-4 flex items-center justify-between border-b border-foreground/5">
                <span className="text-sm font-medium text-foreground/60">Sport</span>
                <span className="text-sm font-medium text-white">{sp.sport}</span>
              </div>
              <div className="px-4 py-4 flex items-center justify-between border-b border-foreground/5">
                <span className="text-sm font-medium text-foreground/60">Level</span>
                <span className="text-sm font-medium text-white">{sp.level}</span>
              </div>
              <div className="px-4 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/60">Handedness</span>
                <span className="text-sm font-medium text-white">{sp.handedness}</span>
              </div>
            </div>
          ))}
        </section>

        {/* REWARDS */}
        <section className="bg-[#0f171c] border border-[#1B9C56]/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#1B9C56]/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Rewards</span>
          </div>
          <div className="px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#1B9C56]/10 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-[#1B9C56]" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-white truncate">Referrals</span>
                <span className="text-[10px] font-medium text-foreground/40 truncate">Invite players · earn credits</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-[#1B9C56]/20 text-[#1B9C56] border border-[#1B9C56]/30 px-3 py-1 rounded-full text-xs font-bold">0 credits</span>
              <ChevronRight className="w-4 h-4 text-foreground/30" />
            </div>
          </div>
        </section>

        {/* LEGAL */}
        <section className="bg-[#121824] border border-foreground/5 rounded-2xl overflow-hidden shadow-sm mt-4">
          <div className="px-4 py-3 border-b border-foreground/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Legal</span>
          </div>
          <button className="w-full px-4 py-4 flex items-center justify-between border-b border-foreground/5 hover:bg-foreground/5 transition-colors text-left">
            <span className="text-sm font-medium text-white">Terms & Conditions</span>
            <ChevronRight className="w-4 h-4 text-foreground/30" />
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left">
            <span className="text-sm font-medium text-white">Privacy Policy</span>
            <ChevronRight className="w-4 h-4 text-foreground/30" />
          </button>
        </section>

        {/* SUPPORT & HELP */}
        <section className="bg-[#121824] border border-foreground/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-foreground/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Support & Help</span>
          </div>
          <button className="w-full px-4 py-4 flex items-center justify-between border-b border-foreground/5 hover:bg-foreground/5 transition-colors text-left">
            <div className="flex items-center gap-3 text-white">
              <Mail className="w-4 h-4 text-foreground/60" />
              <span className="text-sm font-medium text-white">admin@playstat.ai</span>
            </div>
            <ChevronRight className="w-4 h-4 text-foreground/30" />
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-foreground/5 transition-colors text-left">
            <div className="flex items-center gap-3 text-white">
              <Phone className="w-4 h-4 text-foreground/60" />
              <span className="text-sm font-medium text-white">+91 86600 53550</span>
            </div>
            <ChevronRight className="w-4 h-4 text-foreground/30" />
          </button>
        </section>

        {/* ACCOUNT */}
        <section className="bg-[#121824] border border-red-500/20 rounded-2xl overflow-hidden shadow-sm">
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

          <button onClick={() => handleLogout()} className="w-full px-4 py-4 flex items-center gap-3 border-b border-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/5 transition-colors text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>

          <button className="w-full px-4 py-4 flex items-center gap-3 text-red-400 font-bold text-sm hover:bg-red-500/5 transition-colors text-left">
            <Trash className="w-4 h-4" /> Delete Account
          </button>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
