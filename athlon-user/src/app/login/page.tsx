'use client';

import { useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { AuthService } from '@/lib/api/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Trophy, 
  Home, 
  Building, 
  User 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

function LoginForm() {
  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(justRegistered);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!identifier.trim() || !password.trim()) {
      setApiError('Please enter your email/phone and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.login(identifier.trim(), password);
      const token = response.data.accessToken;

      // Base64 decode to parse token payload
      const payloadBase64 = token.split('.')[1];
      const payloadString = atob(payloadBase64);
      const payload = JSON.parse(payloadString);

      const responseData = response.data as any;
      const userIdStr = responseData.userId?.toString() || payload.userId;
      const userUuidStr = responseData.userUuid;

      // Update auth store
      login(identifier.trim(), token, userIdStr, userUuidStr);

      // Fetch user profile from IDENTITYSERVICE
      if (userUuidStr) {
        try {
          const userProfileResp = await AuthService.getUserProfile(userUuidStr, token);
          if (userProfileResp && userProfileResp.data) {
            const user = userProfileResp.data;
            useWorkspaceStore.getState().setPersonalProfile({
              id: user.uuid,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || identifier,
              athlonId: `ATH-${user.uuid.substring(0, 6).toUpperCase()}`,
              avatar: '/umpire.png'
            });
          }
        } catch (e) {
          console.error('Failed to fetch user profile', e);
        }
      }

      router.push('/home');
    } catch (err: any) {
      setApiError(err.message || 'Invalid credentials. Please check your email/phone and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white/[0.025] border border-white/[0.08] rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-2xl relative"
      >
        {/* Header section */}
        <div className="mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Welcome Back
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Sign in to Athlon
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Access your tournaments, teams, and live matches.
          </p>
        </div>

        {/* Registration Success Notification Banner */}
        <AnimatePresence>
          {showSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center justify-between gap-2 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Account created! Please sign in.</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSuccessBanner(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
          {/* Email or Phone */}
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Email or Phone Number
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or 9876543210"
                autoComplete="username"
                className="w-full bg-[#121826]/80 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-[#121826]/80 border border-white/10 rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{apiError}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-emerald-500 text-black font-black text-sm py-3.5 px-6 rounded-xl hover:shadow-[0_0_25px_rgba(27,156,86,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Link to Register */}
          <div className="pt-2 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline ml-1 inline-flex items-center gap-1 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col lg:flex-row bg-[#080C14] text-foreground selection:bg-primary/30 selection:text-white relative">
      
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[340px] h-[340px] md:w-[500px] md:h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px]" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Left side: Branding/Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 h-full relative bg-[#0B101D] flex-col justify-between p-10 overflow-hidden border-r border-white/10 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(27,156,86,0.25)_0%,_transparent_60%)]" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(27,156,86,0.4)]">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
            <Link href="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              ATHLON <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">SPORTS</span>
            </Link>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-md space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--athlon-primary)] animate-ping" />
            <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">Live Scoring Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            The tournament experience, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-primary to-teal-300">elevated.</span>
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Join thousands of players and organizers running seamless tournaments, tracking real-time scores, and managing brackets on Athlon.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="text-emerald-400 font-bold text-base mb-0.5">Real-time</div>
              <div className="text-xs text-zinc-400">Match & Umpire Scoring</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="text-emerald-400 font-bold text-base mb-0.5">Dynamic</div>
              <div className="text-xs text-zinc-400">Brackets & Leaderboards</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <span>© 2026 Athlon Sports Platform</span>
          <span className="flex items-center gap-1.5 text-zinc-400"><ShieldCheck className="w-4 h-4 text-primary" /> Official Engine</span>
        </div>
      </div>

      {/* Right side: Login Form Container (Fixed in place, no scrolling) */}
      <div className="w-full lg:w-7/12 h-full flex items-center justify-center px-4 py-4 sm:px-8 pb-20 lg:pb-0 relative z-10 overflow-hidden">
        <Suspense fallback={
          <div className="w-full max-w-[420px] flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Floating Bottom Navigation Bar (Consistent with Mobile Experience) */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto lg:hidden"
        style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
      >
        <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="home" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Home
          </span>
        </Link>

        <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="tournaments" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Tournaments
          </span>
        </Link>

        {/* 3D Circular Elevated Umpire Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            href="/match-setup"
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
            }}
          >
            {/* 3D Glass Specular Reflection Arc */}
            <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

            <img
              src="/umpire.png"
              alt="Umpire"
              className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
            />
          </Link>
        </div>

        <Link href="/academies" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="academies" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Academy
          </span>
        </Link>

        <Link href="/login" className="flex flex-col items-center gap-0.5 w-16 group">
          <Athlon3DIcon type="profile" size={32} active={true} />
          <span className="text-[9.5px] font-bold text-primary leading-tight">
            Account
          </span>
        </Link>
      </nav>
    </div>
  );
}
