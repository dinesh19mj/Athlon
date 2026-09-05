'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  User, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Trophy,
  Home,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerService } from '@/lib/api/player';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function RegisterPage() {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Phone validation (Indian 10-digit number - Mandatory)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(rawVal);
    
    if (rawVal.length > 0 && !/^[6789]\d{9}$/.test(rawVal)) {
      if (rawVal.length < 10) {
        setPhoneError('Enter complete 10-digit number');
      } else {
        setPhoneError('Must start with 6, 7, 8, or 9');
      }
    } else {
      setPhoneError('');
    }
  };

  // Password strength assessment
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-zinc-700' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-emerald-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!firstName.trim()) {
      setApiError('First name is required');
      return;
    }

    if (!email.trim() || !password) {
      setApiError('Please fill in all required fields');
      return;
    }

    if (!phoneNumber || !/^[6789]\d{9}$/.test(phoneNumber)) {
      setPhoneError('Valid 10-digit mobile number is required');
      return;
    }

    setIsLoading(true);

    try {
      await PlayerService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(), // Optional field, sent as entered or empty string
        email: email.trim(),
        phone: phoneNumber.trim(), // Mandatory
        password: password
      });

      setIsSuccess(true);
      
      // Auto redirect to login
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2600);
    } catch (err: any) {
      setApiError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#080C14] text-foreground selection:bg-primary/30 selection:text-white relative overflow-x-hidden pb-24 lg:pb-0">
      
      {/* Background Ambient Glows & Sport Grids */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[340px] h-[340px] md:w-[500px] md:h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px]" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Left side: Branding/Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-[#0B101D] flex-col justify-between p-12 overflow-hidden border-r border-white/10 z-10">
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
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--athlon-primary)] animate-ping" />
            <span className="text-xs font-semibold text-white/90 tracking-wider uppercase">Live Tournament Hub</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            The next era of <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-primary to-teal-300">competitive sports</span> is here.
          </h1>

          <p className="text-base text-zinc-400 leading-relaxed">
            Create your athlete profile to register for tournaments, track court-side scores, and build your competitive track record.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="text-emerald-400 font-bold text-lg mb-0.5">Instant</div>
              <div className="text-xs text-zinc-400">Tournament Registrations</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="text-emerald-400 font-bold text-lg mb-0.5">Live</div>
              <div className="text-xs text-zinc-400">Court-side Scoreboards</div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <span>© 2026 Athlon Sports Platform</span>
          <span className="flex items-center gap-1.5 text-zinc-400"><ShieldCheck className="w-4 h-4 text-primary" /> Official Engine</span>
        </div>
      </div>

      {/* Right side: Register Form Container (Mobile First) */}
      <div className="w-full lg:w-7/12 flex items-center justify-center px-4 py-8 sm:px-8 relative z-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-[440px]">

          <AnimatePresence mode="wait">
            {isSuccess ? (
              /* Success Screen */
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 sm:p-10 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 p-[2px] shadow-[0_0_30px_rgba(27,156,86,0.5)]"
                >
                  <div className="w-full h-full bg-[#0B101D] rounded-[14px] flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> Account Ready
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Registration Successful!</h2>
                  <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Welcome to Athlon! Preparing your athlete profile and redirecting to login...
                  </p>

                  <div className="pt-6 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    <span className="text-xs text-zinc-500">Redirecting in a moment...</span>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              /* Registration Form Card */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/[0.025] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative"
              >
                {/* Header title */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3.5 h-3.5" /> Get Started
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Create an account
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Join Athlon to start your tournament experience.
                  </p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  
                  {/* First Name & Last Name (Side by side on all screens) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* First Name (Mandatory) */}
                    <div className="space-y-1.5">
                      <label htmlFor="firstName" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                        First Name <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          autoComplete="given-name"
                          className="w-full bg-[#121826]/80 border border-white/10 rounded-xl py-3.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Last Name (Optional - no validity required) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="lastName" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                          Last Name
                        </label>
                        <span className="text-[10px] text-zinc-500">Optional</span>
                      </div>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Morgan"
                          autoComplete="family-name"
                          className="w-full bg-[#121826]/80 border border-white/10 rounded-xl py-3.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Email Address <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
                      <input 
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        autoComplete="email"
                        className="w-full bg-[#121826]/80 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number (+91 - Mandatory) */}
                  <div className="space-y-1.5">
                    <label htmlFor="phoneNumber" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Phone Number <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative group flex items-center">
                      {/* +91 Country Badge */}
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-zinc-300 font-bold text-xs pr-2 border-r border-white/15">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
                        <span>+91</span>
                      </div>
                      <input 
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        inputMode="numeric"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="98765 43210"
                        maxLength={10}
                        required
                        className={`w-full bg-[#121826]/80 border rounded-xl py-3.5 pl-20 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                          phoneError 
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' 
                            : 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-rose-400 text-xs font-medium pl-1 flex items-center gap-1">
                        • {phoneError}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Password <span className="text-emerald-400">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
                      <input 
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full bg-[#121826]/80 border border-white/10 rounded-xl py-3.5 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
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

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Password strength:</span>
                          <span className={`font-bold ${
                            passwordStrength.score >= 3 ? 'text-emerald-400' : passwordStrength.score === 2 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level} 
                              className={`rounded-full transition-all duration-300 ${
                                level <= passwordStrength.score 
                                  ? passwordStrength.color 
                                  : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Notification */}
                  {apiError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}

                  {/* Submit CTA Button */}
                  <button 
                    type="submit"
                    disabled={!phoneNumber || !!phoneError || isLoading}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-emerald-500 text-black font-black text-sm py-4 px-6 rounded-xl hover:shadow-[0_0_25px_rgba(27,156,86,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                    
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Switch to Login Link */}
                  <div className="pt-4 text-center text-xs text-zinc-400">
                    Already have an account?{' '}
                    <Link 
                      href="/login" 
                      className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline ml-1 inline-flex items-center gap-1 transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar (Consistent with App Navigation) */}
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
            href="/practice"
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
