'use client';

import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, MonitorSmartphone, Smartphone } from 'lucide-react';



export function Features() {
  const features = [
    {
      title: 'For Organizers',
      desc: 'Create tournaments in minutes, auto-generate fixtures, assign courts, and view real-time revenue reports.',
      icon: Trophy,
      colSpan: 'md:col-span-2 lg:col-span-2',
      glow: 'group-hover:bg-amber-500/30',
      iconGlow: 'group-hover:border-amber-500/60',
      iconText: 'group-hover:text-amber-400',
      iconBg: 'from-amber-500/30',
    },
    {
      title: 'For Players',
      desc: 'Register easily, find doubles partners, view live leaderboards, and download match certificates.',
      icon: CheckCircle2,
      colSpan: 'md:col-span-1 lg:col-span-1',
      glow: 'group-hover:bg-emerald-500/30',
      iconGlow: 'group-hover:border-emerald-500/60',
      iconText: 'group-hover:text-emerald-400',
      iconBg: 'from-emerald-500/30',
    },
    {
      title: 'For Umpires',
      desc: 'Distraction-free scoring mode with huge touch targets, designed for courtside visibility in bright sunlight.',
      icon: Smartphone,
      colSpan: 'md:col-span-1 lg:col-span-1',
      glow: 'group-hover:bg-blue-500/30',
      iconGlow: 'group-hover:border-blue-500/60',
      iconText: 'group-hover:text-blue-400',
      iconBg: 'from-blue-500/30',
    },
    {
      title: 'For Spectators',
      desc: 'Follow any match live from anywhere. No login or app install needed to see live scores and brackets.',
      icon: MonitorSmartphone,
      colSpan: 'md:col-span-2 lg:col-span-2',
      glow: 'group-hover:bg-purple-500/30',
      iconGlow: 'group-hover:border-purple-500/60',
      iconText: 'group-hover:text-purple-400',
      iconBg: 'from-purple-500/30',
    },
  ];

  return (
    <section id="features" className="py-12 md:py-20 bg-[--bg] text-[--text] relative overflow-hidden">
      {/* Radial gradient background matching Hero */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[--primary]/10 via-[--bg] to-[--bg] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-6 mb-16 max-w-3xl mx-auto items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[--primary]/10 border border-[--primary]/30 w-fit shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[--primary]/10 blur-xl group-hover:bg-[--primary]/20 transition-colors" />
            <span className="relative w-2 h-2 rounded-full bg-[--primary] shadow-[0_0_8px_var(--primary)] animate-pulse" />
            <span className="relative text-xs font-bold text-[--primary] uppercase tracking-wider">Unified Experience</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
            One platform. <span className="text-[--primary]">Every role.</span>
          </h2>

          <p className="text-lg md:text-xl text-[--text-muted]">
            Athlon provides dedicated, intuitive interfaces for everyone involved in a tournament, ensuring a seamless experience from registration to the final point.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative rounded-[24px] border border-foreground/10 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 backdrop-blur-2xl hover:border-foreground/20 p-8 sm:p-10 flex flex-col gap-6 transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_0_rgba(var(--primary-rgb),0.2)] ${feature.colSpan}`}
            >
              {/* Hover Glow effect */}
              <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none">
                <div className={`absolute right-0 top-0 w-72 h-72 rounded-full blur-[90px] translate-x-1/3 -translate-y-1/3 transition-all duration-700 opacity-0 group-hover:opacity-100 ${feature.glow}`} />
              </div>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-foreground/30 backdrop-blur-xl flex items-center justify-center shrink-0 shadow-[0_4px_15px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-all duration-500 relative ${feature.iconGlow}`}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${feature.iconBg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <feature.icon className={`h-7 w-7 text-foreground transition-colors drop-shadow-md relative z-10 ${feature.iconText}`} />
              </div>

              <div className="mt-2 relative z-10">
                <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80 mb-3 drop-shadow-sm">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed text-lg max-w-lg font-medium">
                  {feature.desc}
                </p>
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

export function HowItWorks() {
  const steps = [
    { num: '01', title: 'Organizer creates tournament', desc: 'Set up categories, entry fees, and registration windows in minutes.', shadow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]', text: 'group-hover:text-amber-400', border: 'group-hover:border-amber-500/60', bg: 'from-amber-500/20' },
    { num: '02', title: 'Players register & get seeded', desc: 'Secure payments and automated bracket generation based on skill.', shadow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]', text: 'group-hover:text-emerald-400', border: 'group-hover:border-emerald-500/60', bg: 'from-emerald-500/20' },
    { num: '03', title: 'Umpires score live', desc: 'Courtside officials use the distraction-free mobile-optimized UI.', shadow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]', text: 'group-hover:text-blue-400', border: 'group-hover:border-blue-500/60', bg: 'from-blue-500/20' },
    { num: '04', title: 'Everyone follows along', desc: 'Live results, instant rankings, and downloadable match certificates.', shadow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]', text: 'group-hover:text-purple-400', border: 'group-hover:border-purple-500/60', bg: 'from-purple-500/20' },
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-[--bg] text-[--text] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[--primary]/10 via-[--bg] to-[--bg] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-6 mb-16 max-w-2xl mx-auto text-center items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[--primary]/10 border border-[--primary]/30 w-fit shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[--primary]/10 blur-xl group-hover:bg-[--primary]/20 transition-colors" />
            <span className="relative w-2 h-2 rounded-full bg-[--primary] shadow-[0_0_8px_var(--primary)] animate-pulse" />
            <span className="relative text-xs font-bold text-[--primary] uppercase tracking-wider">End to end flow</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
            How Athlon works
          </h2>

          <p className="text-lg md:text-xl text-[--text-muted]">
            From the first serve to the final trophy, everything happens in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-12 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[--border] to-transparent -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative text-center group"
            >
              <div className={`w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-foreground/20 backdrop-blur-2xl flex items-center justify-center text-4xl font-black text-foreground/50 mb-8 shadow-xl transition-all duration-500 group-hover:-translate-y-3 relative ${step.border} ${step.shadow}`}>
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${step.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
                <span className={`relative z-10 transition-colors duration-500 ${step.text}`}>{step.num}</span>
              </div>

              <h3 className="text-2xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80 drop-shadow-sm">{step.title}</h3>
              <p className="text-foreground/70 leading-relaxed text-sm max-w-[250px] mx-auto font-medium">
                {step.desc}
              </p>
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
