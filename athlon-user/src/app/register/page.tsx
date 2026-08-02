'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Mail, User, Phone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayerService } from '@/lib/api/player';

export default function RegisterPage() {
  const { register } = useAuthStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6789]\d{9}$/;
    if (phone && !phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'phoneNumber') {
      validatePhone(value);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!formData.email.trim() || !validatePhone(formData.phoneNumber)) return;

    setIsLoading(true);

    try {
      await PlayerService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phoneNumber, // IdentityService expects 'phone' instead of 'phoneNumber'
        password: formData.password
      });

      // Show success animation
      setIsSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 3000);
    } catch (err: any) {
      setApiError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F172A] text-(--text)">
      {/* Left side: Branding/Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0A0E17] flex-col justify-between p-12 overflow-hidden border-r border-(--border)">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-(--primary)/20 via-transparent to-transparent opacity-50" />
        
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-extrabold tracking-tighter text-foreground">ATHLON</Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-(--live) animate-pulse" />
            <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Join the Community</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Start your journey today.
          </h1>
          <p className="text-lg text-foreground/60">
            Create an account to participate in tournaments, track your scores, or organize events.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-foreground/40">
          © 2026 Athlon Sports.
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-3xl font-extrabold tracking-tighter text-(--text)">ATHLON</Link>
          </div>
          
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center space-y-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 
                }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-3">Registration Successful!</h2>
                <p className="text-(--text-muted) mb-8">
                  Welcome to Athlon! You can now log in with your credentials.
                </p>
                <div className="w-8 h-8 mx-auto border-2 border-(--primary)/30 border-t-(--primary) rounded-full animate-spin" />
                <p className="text-xs text-(--text-muted) mt-4">Redirecting to login...</p>
              </motion.div>
            </motion.div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold mb-2">Create an account</h2>
                <p className="text-(--text-muted)">Join Athlon to start your tournament experience.</p>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                  <input 
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full bg-(--surface) border border-(--border) rounded-xl py-4 pl-12 pr-4 text-(--text) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                  <input 
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full bg-(--surface) border border-(--border) rounded-xl py-4 pl-12 pr-4 text-(--text) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                <input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-(--surface) border border-(--border) rounded-xl py-4 pl-12 pr-4 text-(--text) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted) z-10" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-(--text-muted) font-medium z-10">+91</span>
                <input 
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`w-full bg-(--surface) border rounded-xl py-4 pl-20 pr-4 text-(--text) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all ${
                    phoneError ? 'border-red-500' : 'border-(--border)'
                  }`}
                  required
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-(--surface) border border-(--border) rounded-xl py-4 px-4 text-(--text) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary) transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {apiError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {apiError}
              </div>
            )}

            <button 
              type="submit"
              disabled={!!phoneError || isLoading}
              className="w-full bg-[#1B9C56] text-foreground font-bold py-4 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all mt-6 shadow-[0_0_20px_rgba(27,156,86,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>

              <div className="mt-8 text-center text-sm text-(--text-muted)">
                Already have an account?{' '}
                <Link href="/login" className="text-(--primary) hover:underline font-semibold">
                  Sign in
                </Link>
              </div>
            </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
