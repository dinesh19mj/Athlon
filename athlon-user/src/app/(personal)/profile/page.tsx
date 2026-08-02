'use client';

import { ArrowLeft, Settings, MapPin, Edit3, Wallet, Trophy, Target, Zap, Activity, UserPlus, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { PlayerService } from '@/lib/api/player';


export default function ProfilePage() {
  const { playerId, token, logout } = useAuthStore();
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
          <Link href="/player" className="p-2 -ml-2 text-foreground hover:text-[#1B9C56] transition-colors">
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
            <div className="absolute right-0 top-12 w-48 bg-surface border border-foreground/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col">
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

        {/* Roles Management Section */}
        <section className="bg-surface border border-foreground/5 p-4 rounded-2xl flex flex-col gap-4 shadow-lg mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF7722]" /> My Roles
            </h3>
          </div>
          
          {/* Assigned Roles List */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            {roles.filter(role => role !== 'UMPIRE').map((role, idx) => (
              <button 
                key={idx}
                onClick={() => router.push(`/${role.toLowerCase()}`)}
                className="flex flex-col items-center justify-center gap-2 bg-background border border-foreground/10 hover:border-[#1B9C56] hover:bg-[#1B9C56]/5 p-4 rounded-xl transition-all shadow-sm group"
              >
                <div className="p-2 bg-surface rounded-full group-hover:bg-[#1B9C56]/20 transition-colors">
                   {role.toUpperCase() === 'PLAYER' && <Zap className="w-5 h-5 text-foreground group-hover:text-[#1B9C56] transition-colors" />}
                   {role.toUpperCase() === 'ORGANIZER' && <Trophy className="w-5 h-5 text-foreground group-hover:text-[#1B9C56] transition-colors" />}
                   {role.toUpperCase() === 'UMPIRE' && <Target className="w-5 h-5 text-foreground group-hover:text-[#1B9C56] transition-colors" />}
                   {!['PLAYER', 'ORGANIZER', 'UMPIRE'].includes(role.toUpperCase()) && <Activity className="w-5 h-5 text-foreground group-hover:text-[#1B9C56] transition-colors" />}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-foreground/80 group-hover:text-[#1B9C56] transition-colors">{role}</span>
              </button>
            ))}
          </div>
        </section>



        {/* Core Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
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
            <span className="text-[9px] uppercase tracking-wider text-foreground/50 font-bold">Best Streak</span>
          </div>
        </section>

        {/* Recent Match History */}
        <section className="mt-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase">Recent Matches</h3>
            <span className="text-[10px] font-bold text-[#FF7722] cursor-pointer hover:text-foreground transition-colors">View All</span>
          </div>

          <div className="flex flex-col gap-3">
            {matchHistory.map((match) => (
              <div key={match.id} className="flex items-center justify-between bg-surface border border-foreground/5 p-3.5 rounded-xl hover:border-foreground/20 transition-colors shadow-sm cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center overflow-hidden">
                    {/* Random Avatar Placeholder for Opponents */}
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${match.opponent}&backgroundColor=121824&textColor=ffffff`} alt={match.opponent} className="w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground group-hover:text-[#FF7722] transition-colors">{match.opponent}</span>
                    <span className="text-[10px] text-foreground/50 mt-0.5">{match.tournament} • {match.date}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${match.result === 'WIN'
                      ? 'bg-red-500/10 text-[#1B9C56] border border-red-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {match.result}
                  </div>
                  <span className="text-xs font-bold text-foreground/80">{match.score}</span>
                </div>
              </div>
            ))}
          </div>
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
