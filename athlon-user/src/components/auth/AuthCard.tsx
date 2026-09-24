'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Trophy,
  ShieldCheck,
  Zap,
  Building2,
  Users,
} from 'lucide-react';
import { AuthService } from '@/lib/api/auth';
import { PlayerService } from '@/lib/api/player';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export interface AuthCardProps {
  defaultMode?: 'login' | 'signup';
  onClose?: () => void;
  onSuccess?: () => void;
  redirectUrl?: string;
  showCloseButton?: boolean;
  isModal?: boolean;
  className?: string;
}

export function AuthCard({
  defaultMode = 'login',
  onClose,
  onSuccess,
  redirectUrl,
  showCloseButton = true,
  isModal = false,
  className = '',
}: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  // Sync mode with defaultMode prop when it changes
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Read URL params for redirect or registration banner
  const paramRedirect = searchParams?.get('redirect');
  const targetRedirect = redirectUrl || paramRedirect || '/home';
  const justRegistered = searchParams?.get('registered') === 'true';

  // ─── LOGIN STATE ───────────────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ─── SIGNUP STATE ──────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccessMsg, setSignupSuccessMsg] = useState(
    justRegistered ? 'Account created successfully! Please sign in.' : ''
  );

  // Indian 10-digit mobile number validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSignupPhone(rawVal);

    if (rawVal.length > 0 && !/^[6789]\d{9}$/.test(rawVal)) {
      if (rawVal.length < 10) {
        setPhoneError('Enter complete 10-digit mobile number');
      } else {
        setPhoneError('Must start with 6, 7, 8, or 9');
      }
    } else {
      setPhoneError('');
    }
  };

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!signupPassword) return { score: 0, label: '', color: '' };
    let score = 0;
    if (signupPassword.length >= 6) score += 1;
    if (signupPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(signupPassword) && /[a-z]/.test(signupPassword)) score += 1;
    if (/\d/.test(signupPassword) || /[^A-Za-z0-9]/.test(signupPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: '' };
    }
  }, [signupPassword]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // ─── LOGIN HANDLER ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim() || !password.trim()) {
      setLoginError('Please enter your email/phone and password');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await AuthService.login(identifier.trim(), password);
      const token = response.data.accessToken;

      const payloadBase64 = token.split('.')[1];
      const payloadString = atob(payloadBase64);
      const payload = JSON.parse(payloadString);

      const responseData = response.data as any;
      const userIdStr = responseData.userId?.toString() || payload.userId;
      const userUuidStr = responseData.userUuid;

      await login(identifier.trim(), token, userIdStr, userUuidStr);

      if (userUuidStr) {
        try {
          const userProfileResp = await AuthService.getUserProfile(userUuidStr, token);
          if (userProfileResp && userProfileResp.data) {
            const user = userProfileResp.data;
            useWorkspaceStore.getState().setPersonalProfile({
              id: user.uuid,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || identifier,
              athlonId: `ATH-${user.uuid.substring(0, 6).toUpperCase()}`,
              avatar: '/umpire.png',
            });
          }
        } catch (err) {
          console.error('Failed to fetch user profile', err);
        }
      }

      if (onClose) onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(targetRedirect);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please verify your details.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ─── SIGNUP HANDLER ────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!firstName.trim()) {
      setSignupError('First name is required');
      return;
    }

    if (!signupPhone.trim()) {
      setSignupError('Phone number is required');
      return;
    }

    if (!/^[6789]\d{9}$/.test(signupPhone)) {
      setSignupError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
      return;
    }

    if (!signupEmail.trim()) {
      setSignupError('Email address is required');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    setIsSigningUp(true);

    try {
      await AuthService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: signupEmail.trim(),
        phoneNumber: signupPhone.trim(),
        password: signupPassword,
        roles: ['ROLE_USER'],
      });

      // Attempt auto-login after successful registration
      try {
        const loginResp = await AuthService.login(signupEmail.trim(), signupPassword);
        const token = loginResp.data.accessToken;

        const payloadBase64 = token.split('.')[1];
        const payloadString = atob(payloadBase64);
        const payload = JSON.parse(payloadString);

        const responseData = loginResp.data as any;
        const userIdStr = responseData.userId?.toString() || payload.userId;
        const userUuidStr = responseData.userUuid;

        await login(signupEmail.trim(), token, userIdStr, userUuidStr);

        // Auto-create initial athlete profile in PLAYER service if supported
        if (userUuidStr) {
          try {
            if (typeof (PlayerService as any).createProfile === 'function') {
              await (PlayerService as any).createProfile({
                userUuid: userUuidStr,
                primarySport: 'BADMINTON',
                skillLevel: 'INTERMEDIATE',
                gender: 'PREFER_NOT_TO_SAY',
              });
            }
          } catch {}
        }

        if (userUuidStr) {
          try {
            const userProfileResp = await AuthService.getUserProfile(userUuidStr, token);
            if (userProfileResp?.data) {
              const user = userProfileResp.data;
              useWorkspaceStore.getState().setPersonalProfile({
                id: user.uuid,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || signupEmail,
                athlonId: `ATH-${user.uuid.substring(0, 6).toUpperCase()}`,
                avatar: '/umpire.png',
              });
            }
          } catch {}
        }

        if (onClose) onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(targetRedirect);
        }
      } catch {
        // If auto-login didn't complete, switch to Login tab with prefilled credentials
        setIdentifier(signupEmail.trim());
        setSignupSuccessMsg('Account created successfully! Please sign in.');
        setMode('login');
      }
    } catch (err: any) {
      setSignupError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 16 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`relative w-full max-w-[440px] my-auto rounded-[28px] border overflow-hidden shadow-2xl backdrop-blur-2xl z-10 transition-all ${className}`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        borderColor: 'var(--athlon-border)',
        boxShadow:
          '0 24px 60px -12px var(--athlon-shadow, rgba(0, 0, 0, 0.45)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      }}
      onClick={(e) => e.stopPropagation()}
      role="region"
      aria-labelledby="auth-card-title"
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
          <linearGradient id="cardAuthHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--athlon-primary)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--athlon-primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cardAuthBeamGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--athlon-primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--athlon-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Stadium Floodlight Cones */}
        <polygon points="340,-20 200,240 250,240 370,-20" fill="url(#cardAuthBeamGradient)" opacity="0.32" />

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
          <line x1="295" y1="55" x2="245" y2="-10" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="345" y2="-10" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="390" y2="15" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="415" y2="55" strokeWidth="0.75" opacity="0.4" />
          <line x1="295" y1="55" x2="385" y2="95" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="335" y2="120" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="255" y2="120" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="205" y2="95" strokeWidth="0.75" opacity="0.5" />

          {/* Field Floodlight Towers with Beam Emitting Crossheads */}
          <g transform="translate(190, 8)">
            <line x1="0" y1="24" x2="0" y2="0" strokeWidth="1.5" />
            <line x1="-6" y1="0" x2="6" y2="0" strokeWidth="1.2" />
            <circle cx="-5" cy="-2" r="1.2" fill="var(--athlon-primary)" />
            <circle cx="0" cy="-2" r="1.2" fill="var(--athlon-primary)" />
            <circle cx="5" cy="-2" r="1.2" fill="var(--athlon-primary)" />
          </g>
          <g transform="translate(380, 10)">
            <line x1="0" y1="24" x2="0" y2="0" strokeWidth="1.5" />
            <line x1="-6" y1="0" x2="6" y2="0" strokeWidth="1.2" />
            <circle cx="-5" cy="-2" r="1.2" fill="var(--athlon-primary)" />
            <circle cx="0" cy="-2" r="1.2" fill="var(--athlon-primary)" />
            <circle cx="5" cy="-2" r="1.2" fill="var(--athlon-primary)" />
          </g>
        </g>

        {/* ─── ISOMETRIC ATHLETIC PITCH & COURT GEOMETRIES ─── */}
        {/* 1. Isometric Football / Turf Pitch */}
        <g transform="translate(230, 108)" opacity="0.28" stroke="var(--athlon-primary)">
          {/* Pitch Outer Perimeter */}
          <polygon points="0,25 90,-20 180,25 90,70" fill="none" strokeWidth="1.2" />
          {/* Halfway Line */}
          <line x1="45" y1="2" x2="135" y2="48" strokeWidth="0.9" />
          {/* Center Circle & Spot */}
          <ellipse cx="90" cy="25" rx="18" ry="9" fill="none" strokeWidth="0.8" />
          <circle cx="90" cy="25" r="1.5" fill="var(--athlon-primary)" stroke="none" />
          {/* Left Goal Area & Penalty Box */}
          <polygon points="12,19 32,9 42,14 22,24" fill="none" strokeWidth="0.75" />
          {/* Right Goal Area & Penalty Box */}
          <polygon points="158,36 138,46 148,51 168,41" fill="none" strokeWidth="0.75" />
          {/* Corner Arcs */}
          <path d="M 6 22 Q 10 23 11 26" fill="none" strokeWidth="0.6" />
          <path d="M 169 28 Q 170 31 174 32" fill="none" strokeWidth="0.6" />
        </g>

        {/* 2. Technical Badminton Court Wireframe & Shuttlecock Radar */}
        <g transform="translate(8, 28)" opacity="0.32" stroke="var(--athlon-primary)">
          {/* Badminton Court Boundary */}
          <polygon points="0,55 75,18 150,55 75,92" fill="none" strokeWidth="1.2" />
          {/* Center Net Line & Posts */}
          <line x1="75" y1="18" x2="75" y2="92" strokeWidth="1.4" />
          <line x1="75" y1="14" x2="75" y2="18" strokeWidth="2" />
          <line x1="75" y1="92" x2="75" y2="96" strokeWidth="2" />
          {/* Short Service Lines */}
          <line x1="55" y1="28" x2="55" y2="82" strokeWidth="0.75" strokeDasharray="3 2" />
          <line x1="95" y1="28" x2="95" y2="82" strokeWidth="0.75" strokeDasharray="3 2" />
          {/* Doubles Long Service Lines */}
          <line x1="12" y1="49" x2="138" y2="49" strokeWidth="0.65" opacity="0.6" />
          <line x1="12" y1="61" x2="138" y2="61" strokeWidth="0.65" opacity="0.6" />

          {/* Badminton Shuttlecock Blueprint Wireframe */}
          <g transform="translate(42, 60) rotate(-22)" opacity="0.85">
            {/* Shuttlecock Cork / Base */}
            <path d="M 0 10 A 5 5 0 0 1 10 10 L 10 13 A 5 3 0 0 1 0 13 Z" fill="none" strokeWidth="1" />
            <circle cx="5" cy="14" r="1.5" fill="var(--athlon-primary)" opacity="0.6" />
            {/* 16 Feather Rib Conical Skirt */}
            <line x1="0" y1="10" x2="-8" y2="-12" strokeWidth="0.9" />
            <line x1="2" y1="10" x2="-3" y2="-13" strokeWidth="0.7" />
            <line x1="5" y1="10" x2="5" y2="-14" strokeWidth="0.8" />
            <line x1="8" y1="10" x2="13" y2="-13" strokeWidth="0.7" />
            <line x1="10" y1="10" x2="18" y2="-12" strokeWidth="0.9" />
            {/* Feather Skirt Retaining Thread Ribbons */}
            <path d="M -4 -2 Q 5 -4 14 -2" fill="none" strokeWidth="0.8" />
            <path d="M -7 -8 Q 5 -10 17 -8" fill="none" strokeWidth="0.8" />
            {/* Feathers Overlapping Top Border Arc */}
            <path d="M -8 -12 Q 5 -15 18 -12" fill="none" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        </g>

        {/* 3. Basketball Half-Court Keyhole & Arc */}
        <g transform="translate(14, 160)" opacity="0.25" stroke="var(--athlon-primary)">
          {/* Free Throw Lane Key */}
          <rect x="0" y="0" width="36" height="48" fill="none" strokeWidth="0.9" />
          {/* Free Throw Top Circle */}
          <circle cx="18" cy="48" r="12" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
          {/* 3-Point Arc Arcuate Curve */}
          <path d="M -8 10 L -4 10 A 34 34 0 0 0 40 10 L 44 10" fill="none" strokeWidth="1" />
          {/* Backboard & Ring */}
          <line x1="10" y1="6" x2="26" y2="6" strokeWidth="1.6" />
          <circle cx="18" cy="9" r="3" fill="none" strokeWidth="1" />
        </g>

        {/* Tennis / Cricket Ball Seam Wireframe Orbit */}
        <g transform="translate(325, 205)" opacity="0.3" stroke="var(--athlon-primary)">
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

      {/* 6. Tiny Pulsing Starlight / Stadium Spark Particles */}
      <div className="absolute top-8 right-24 w-1.5 h-1.5 rounded-full bg-primary/70 blur-[0.5px] animate-ping duration-1000 pointer-events-none z-0" />
      <div className="absolute top-28 right-8 w-1.5 h-1.5 rounded-full bg-primary/50 blur-[0.5px] pointer-events-none z-0" />

      {/* 7. Top Specular Arc Light */}
      <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

      {/* Close Button (X) */}
      {showCloseButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/10 active:scale-95 transition-all z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="p-5 sm:p-7 relative z-10">
        {/* Header: Brand & Tagline */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md border"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <Trophy className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest uppercase text-foreground">
                ATHLON
              </span>
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--athlon-primary-soft)',
                  color: 'var(--athlon-primary)',
                }}
              >
                LIVE ACCESS
              </span>
            </div>
            <h2
              id="auth-card-title"
              className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-none mt-0.5"
            >
              {mode === 'login' ? 'Sign in to Athlon' : 'Create Athlete Profile'}
            </h2>
          </div>
        </div>

        {/* User Features Highlights Strip */}
        <div
          className="grid grid-cols-3 gap-1.5 p-2 rounded-xl border mb-4 text-[10px] font-bold"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-1 text-foreground/80">
            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">Live Scores</span>
          </div>
          <div className="flex items-center gap-1 text-foreground/80">
            <Building2 className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">Book Courts</span>
          </div>
          <div className="flex items-center gap-1 text-foreground/80">
            <Users className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">Tournaments</span>
          </div>
        </div>

        {/* Mode Switcher Tabs (Sign In / Create Account) */}
        <div
          className="grid grid-cols-2 p-1 rounded-2xl border mb-4 relative"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login' ? 'text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="authCardTabHighlight"
                className="absolute inset-0 rounded-xl"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                  boxShadow: '0 2px 10px var(--athlon-primary-glow)',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 uppercase tracking-wider">Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignupError('');
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all relative z-10 flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup' ? 'text-primary-foreground' : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="authCardTabHighlight"
                className="absolute inset-0 rounded-xl"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                  boxShadow: '0 2px 10px var(--athlon-primary-glow)',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              />
            )}
            <span className="relative z-10 uppercase tracking-wider">Create Account</span>
          </button>
        </div>

        {/* Success Alert Banner (e.g. from registration redirect) */}
        <AnimatePresence>
          {signupSuccessMsg && mode === 'login' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-semibold flex items-center justify-between gap-2 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{signupSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSignupSuccessMsg('')}
                className="text-foreground/50 hover:text-foreground text-xs font-bold px-1"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── TAB 1: SIGN IN FORM ─── */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Email or Phone Field */}
            <div className="space-y-1">
              <label
                htmlFor="auth-identifier"
                className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
              >
                Email or Phone Number
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  id="auth-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 9876543210"
                  autoComplete="username"
                  className="w-full border rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--athlon-input)',
                    borderColor: 'var(--athlon-border)',
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border rounded-xl py-2.5 pl-9 pr-10 text-xs sm:text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--athlon-input)',
                    borderColor: 'var(--athlon-border)',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-semibold flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{loginError}</span>
              </motion.div>
            )}

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full relative group overflow-hidden font-black text-xs sm:text-sm py-3 px-5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider mt-1"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground)',
                boxShadow: '0 4px 20px var(--athlon-primary-glow)',
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
              {isLoggingIn ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ─── TAB 2: CREATE ACCOUNT FORM ─── */
          <form onSubmit={handleSignup} className="space-y-2.5">
            {/* First Name & Last Name (Side by side) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label
                  htmlFor="signup-first-name"
                  className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
                >
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input
                    id="signup-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full border rounded-xl py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                    style={{
                      backgroundColor: 'var(--athlon-input)',
                      borderColor: 'var(--athlon-border)',
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="signup-last-name"
                  className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
                >
                  Last Name
                </label>
                <input
                  id="signup-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full border rounded-xl py-2 px-3 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--athlon-input)',
                    borderColor: 'var(--athlon-border)',
                  }}
                />
              </div>
            </div>

            {/* Phone Number (with +91 Indian prefix) */}
            <div className="space-y-1">
              <label
                htmlFor="signup-phone"
                className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
              >
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-foreground/60 text-xs font-bold pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-foreground/40" />
                  <span>+91</span>
                  <span className="text-foreground/20">|</span>
                </div>
                <input
                  id="signup-phone"
                  type="tel"
                  value={signupPhone}
                  onChange={handlePhoneChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="w-full border rounded-xl py-2 pl-16 pr-3 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium tracking-wide"
                  style={{
                    backgroundColor: 'var(--athlon-input)',
                    borderColor: phoneError ? 'var(--color-rose-500, #f43f5e)' : 'var(--athlon-border)',
                  }}
                  required
                />
              </div>
              {phoneError && (
                <p className="text-[10px] text-rose-500 font-semibold pl-1">{phoneError}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label
                htmlFor="signup-email"
                className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full border rounded-xl py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--athlon-input)',
                    borderColor: 'var(--athlon-border)',
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="signup-password"
                className="block text-[10.5px] font-bold text-foreground/80 uppercase tracking-wider"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                <input
                  id="signup-password"
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border rounded-xl py-2 pl-8 pr-9 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  style={{
                    backgroundColor: 'var(--athlon-input)',
                    borderColor: 'var(--athlon-border)',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {signupPassword && (
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= level ? passwordStrength.color : 'bg-foreground/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-foreground/60">
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Error Notification */}
            {signupError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-semibold flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-[11px] leading-tight">{signupError}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full relative group overflow-hidden font-black text-xs py-3 px-5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider mt-1"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground)',
                boxShadow: '0 4px 18px var(--athlon-primary-glow)',
              }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
              {isSigningUp ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account &amp; Unlock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Dismissal / Guest Exploration Action */}
        <div className="mt-4 pt-3 border-t text-center" style={{ borderColor: 'var(--athlon-border)' }}>
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-bold text-foreground/60 hover:text-foreground transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-foreground/5 cursor-pointer"
          >
            <span>Continue exploring marketplace as guest</span>
            <ArrowRight className="w-3 h-3 text-primary" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
