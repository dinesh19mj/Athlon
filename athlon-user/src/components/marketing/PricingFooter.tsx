'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Pricing() {
  const tiers = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      desc: 'Perfect for small local matches.',
      features: ['Up to 1 tournament/month', 'Max 16 players', 'Basic live scoring', 'Community support'],
      highlighted: false,
      colorTheme: {
        glow: 'group-hover:bg-emerald-500/30',
        bg: 'from-emerald-500/10 to-white/5 hover:from-emerald-500/20 hover:to-white/10',
        border: 'border-foreground/10 hover:border-emerald-500/50',
        shadow: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.2)]',
        text: 'text-emerald-400',
        button: 'bg-transparent border border-foreground/20 text-foreground hover:bg-emerald-500/20 hover:border-emerald-500/50',
        check: 'text-emerald-400 bg-emerald-500/20',
      }
    },
    {
      name: 'Club',
      price: '₹1,999',
      period: 'per month',
      desc: 'Everything a sports club needs.',
      features: ['Unlimited tournaments', 'Up to 256 players', 'Umpire assignments', 'Revenue reports', 'Priority support'],
      highlighted: true,
      colorTheme: {
        glow: 'bg-(--primary)/30 group-hover:bg-(--primary)/40',
        bg: 'from-(--primary)/20 to-white/10',
        border: 'border-(--primary)/50 hover:border-(--primary)',
        shadow: 'shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)]',
        text: 'text-(--primary)',
        button: 'bg-(--primary) text-[#173404] hover:bg-(--primary)/90 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]',
        check: 'text-[#173404] bg-(--primary)',
      }
    },
    {
      name: 'Association',
      price: '₹4,999',
      period: 'per month',
      desc: 'For large leagues and federations.',
      features: ['Multi-venue support', 'Custom branding', 'API access', 'Dedicated account manager'],
      highlighted: false,
      colorTheme: {
        glow: 'group-hover:bg-blue-500/30',
        bg: 'from-blue-500/10 to-white/5 hover:from-blue-500/20 hover:to-white/10',
        border: 'border-foreground/10 hover:border-blue-500/50',
        shadow: 'shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]',
        text: 'text-blue-400',
        button: 'bg-transparent border border-foreground/20 text-foreground hover:bg-blue-500/20 hover:border-blue-500/50',
        check: 'text-blue-400 bg-blue-500/20',
      }
    },
  ];

  return (
    <section id="pricing" className="py-12 md:py-20 bg-[--bg] text-[--text] relative overflow-hidden">
      {/* Radial gradient background matching Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[--primary]/10 via-[--bg] to-[--bg] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--primary)/10 border border-(--primary)/30 w-fit shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] relative overflow-hidden group mb-6">
            <div className="absolute inset-0 bg-(--primary)/10 blur-xl group-hover:bg-(--primary)/20 transition-colors" />
            <span className="relative w-2 h-2 rounded-full bg-(--primary) shadow-[0_0_8px_var(--primary)] animate-pulse" />
            <span className="relative text-xs font-bold text-(--primary) uppercase tracking-wider">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6">Simple, transparent pricing</h2>
          <p className="text-lg md:text-xl text-[--text-muted]">Start for free, upgrade when you need more power.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative flex flex-col rounded-[24px] p-8 border backdrop-blur-2xl transition-all duration-500 bg-gradient-to-br ${tier.colorTheme.border} ${tier.colorTheme.bg} ${tier.colorTheme.shadow} ${tier.highlighted ? 'md:-translate-y-4' : ''}`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
                <div className={`absolute right-0 top-0 w-72 h-72 rounded-full blur-[90px] translate-x-1/3 -translate-y-1/3 transition-all duration-700 ${tier.highlighted ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 ${tier.colorTheme.glow}`} />
              </div>

              <div className="flex-1 relative z-10">
                <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-foreground' : 'text-foreground drop-shadow-sm'}`}>{tier.name}</h3>
                <p className="text-foreground/70 text-sm mb-8 font-medium">{tier.desc}</p>
                <div className="mb-8">
                  <span className="text-5xl font-black tracking-tight text-foreground drop-shadow-md">{tier.price}</span>
                  <span className={`ml-1 font-bold ${tier.colorTheme.text}`}>/{tier.period}</span>
                </div>

                <button className={`w-full py-4 rounded-xl font-bold transition-all mb-10 text-sm tracking-wide ${tier.colorTheme.button}`}>
                  {tier.price === '₹0' ? 'Get Started Free' : 'Start Free Trial'}
                </button>

                <ul className="space-y-5">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-medium">
                      <div className={`mt-0.5 rounded-full p-1 shrink-0 shadow-sm ${tier.colorTheme.check}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-foreground/80">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Glassmorphism Section End Highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-[--primary]/40 to-transparent blur-[2px]" />
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-12 md:py-20 bg-[--bg] text-[--text] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[--primary]/5 via-[--bg] to-[--bg] -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-20 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--surface-elevated] border border-[--border] w-fit shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[--primary] animate-pulse" />
            <span className="text-xs font-semibold text-[--text-muted] uppercase tracking-wide">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">Trusted by organizers</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[--surface] p-8 sm:p-10 rounded-[24px] border border-[--border] shadow-lg relative group hover:border-[--primary]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[--primary]/5 blur-[40px] rounded-full group-hover:bg-[--primary]/10 transition-colors pointer-events-none" />
            <p className="text-lg sm:text-xl italic text-[--text-muted] mb-8 leading-relaxed relative z-10">
              "Athlon completely changed how we run our weekend tournaments. The live scoring feature means players are never asking when their next match is."
            </p>
            <div className="relative z-10">
              <h4 className="font-bold text-foreground text-lg">Rajesh Kumar</h4>
              <p className="text-sm text-[--primary]">Tournament Director, Mumbai Tennis Club</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[--surface] p-8 sm:p-10 rounded-[24px] border border-[--border] shadow-lg relative group hover:border-[--primary]/30 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[--primary]/5 blur-[40px] rounded-full group-hover:bg-[--primary]/10 transition-colors pointer-events-none" />
            <p className="text-lg sm:text-xl italic text-[--text-muted] mb-8 leading-relaxed relative z-10">
              "The umpire mode is brilliant. It's so easy to use courtside, even in bright sunlight. Highly recommended for any serious sports club."
            </p>
            <div className="relative z-10">
              <h4 className="font-bold text-foreground text-lg">Priya Sharma</h4>
              <p className="text-sm text-[--primary]">Head Coach, Bangalore Badminton Academy</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Glassmorphism Section End Highlight */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-[--primary]/40 to-transparent blur-[2px]" />
    </section>
  );
}

export function CTAAndFooter() {
  return (
    <>
      <section className="py-12 md:py-20 bg-[--bg] text-[--text] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[--primary]/20 via-[--bg] to-[--bg] -z-10" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6">Ready to elevate your game?</h2>
          <p className="text-lg md:text-xl text-[--text-muted] mb-10">
            Join thousands of organizers and players using Athlon today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-(--primary) text-[#173404] font-extrabold px-12 py-6 rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 text-xl shadow-[0_0_40px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.6)]"
          >
            Create your first tournament
          </Link>
        </div>
      </section>

      <footer className="relative bg-foreground/5 backdrop-blur-2xl border-t border-foreground/10 text-foreground/70 py-16 mt-20 overflow-hidden">
        {/* Subtle glow behind the footer content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-[--primary]/5 blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-12 gap-12 relative z-10">
          <div className="col-span-2 md:col-span-5 pr-8">
            <Link href="/" className="mb-4 block">
              <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={120} height={32} className="object-contain w-auto h-10" />
            </Link>
            <p className="text-sm font-medium leading-relaxed max-w-xs">The tournament experience, elevated. Beautifully designed for organizers, players, and umpires.</p>
          </div>

          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#features" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Pricing</Link></li>
              <li><Link href="/live-showcase" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Live Showcase</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">About</Link></li>
              <li><Link href="#" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Contact</Link></li>
              <li><Link href="#" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Blog</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-foreground/10 text-sm flex flex-col md:flex-row justify-between items-center relative z-10 font-medium">
          <p>© 2026 Athlon Sports. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 items-center">
            <Link href="#" className="text-foreground/50 hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] hover:scale-110 transition-all" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </Link>
            <Link href="#" className="text-foreground/50 hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] hover:scale-110 transition-all" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </Link>
            <Link href="#" className="text-foreground/50 hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] hover:scale-110 transition-all" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
