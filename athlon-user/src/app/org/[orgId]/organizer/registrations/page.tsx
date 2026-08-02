'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Search, Filter, ArrowLeft } from 'lucide-react';

export default function RegistrationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pb-32">
      
      {/* Header */}
      <header className="mb-6 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/organizer" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide">
            Registrations
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-foreground/5 border border-foreground/10 text-foreground font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-foreground/10 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </header>

      {/* Main List Container */}
      <div className="bg-surface border border-foreground/5 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-foreground/5 flex gap-4 bg-background/50">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search players..." 
              className="w-full bg-background border border-foreground/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#1B9C56] text-foreground placeholder-white/30 font-medium transition-colors"
            />
          </div>
        </div>
        
        {/* List items */}
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 sm:p-5 flex items-center justify-between hover:bg-foreground/5 transition-colors group cursor-pointer">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-background border border-foreground/10 flex items-center justify-center font-black text-[#1B9C56] text-lg group-hover:scale-110 transition-transform">
                  {`P${i}`}
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-wide">Player {i}</h4>
                  <p className="text-xs text-foreground/50 font-medium mt-0.5">Summer Slam • Men's Singles</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-sm">$50.00</p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-0.5">Entry Fee</p>
                </div>
                <span className="px-3 py-1.5 bg-[#1B9C56]/20 text-[#1B9C56] text-[9px] uppercase font-black rounded-lg border border-[#1B9C56]/30">
                  Paid
                </span>
              </div>
              
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
