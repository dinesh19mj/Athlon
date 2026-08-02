'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { LiveMatchWidget } from '../organizer/LiveMatchWidget';

export function Hero() {
  return (
    <section className="relative pt-32 pb-12 md:pt-48 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-(--primary)/20 via-(--bg) to-(--bg) -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) w-fit">
              <span className="w-2 h-2 rounded-full bg-(--live) animate-pulse" />
              <span className="text-xs font-semibold text-(--text-muted) uppercase tracking-wide">Live Scoring Platform</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
              The tournament experience, <span className="text-(--primary)">elevated.</span>
            </h1>

            <p className="text-lg md:text-xl text-(--text-muted) max-w-lg">
              Real-time scoring and role-based experiences for everyone. Players register, umpires score courtside, and spectators follow live for free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-(--primary) text-[#173404] font-bold px-8 py-4 rounded-(--radius-pill) hover:opacity-90 active:scale-95 transition-all text-lg"
              >
                Get started free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/live-showcase"
                className="inline-flex items-center justify-center gap-2 bg-(--surface-elevated) text-foreground font-semibold px-8 py-4 rounded-(--radius-pill) hover:bg-(--border) transition-all text-lg border border-(--border)"
              >
                <PlayCircle className="w-5 h-5" /> See it live
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:h-full flex items-center justify-center"
          >
            {/* Glow effect behind the card */}
            <div className="absolute inset-0 bg-(--primary)/20 blur-[100px] rounded-full" />

            {/* Using the LiveMatchWidget from Organizer to show a realistic mock card */}
            <div className="w-full max-w-md relative z-10 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-(--surface-elevated) p-2 rounded-[24px] shadow-2xl border border-(--border)/50">
                <LiveMatchWidget
                  matchId="hero-match"
                  courtName="Center Court Finals"
                  teamA="K. Sharma"
                  teamB="A. Patel"
                />

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
