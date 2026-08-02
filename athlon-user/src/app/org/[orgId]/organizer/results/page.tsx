'use client';

import Link from 'next/link';
import { List, Download, Trophy, ArrowLeft } from 'lucide-react';

const mockResults = [
  { id: 1, tournament: 'Summer Slam 2026', category: "Men's Singles", winner: 'Arjun', score: '21-18, 21-19', date: 'Jul 25, 2026' },
  { id: 2, tournament: 'Spring Open', category: "Mixed Doubles", winner: 'Sarah / John', score: '19-21, 21-15, 21-18', date: 'Mar 05, 2026' },
  { id: 3, tournament: 'City Finals', category: "Women's Singles", winner: 'Priya', score: '21-10, 21-12', date: 'Feb 12, 2026' },
];

export default function OrganizerResultsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pb-32">
      
      {/* Header */}
      <header className="mb-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/organizer" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <List className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide">
            Match Results
          </h1>
        </div>
        
        <button className="hidden md:flex bg-foreground/5 border border-foreground/10 text-foreground font-bold py-2 px-4 rounded-xl items-center justify-center gap-2 hover:bg-foreground/10 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      {/* Results List */}
      <div className="space-y-4">
        {mockResults.map((result) => (
          <div key={result.id} className="bg-surface border border-foreground/5 rounded-2xl p-4 shadow-xl hover:border-foreground/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start md:items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1B9C56]/10 flex items-center justify-center border border-[#1B9C56]/20 shrink-0">
                <Trophy className="w-5 h-5 text-[#1B9C56]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">{result.winner}</h3>
                <p className="text-xs text-foreground/50 font-medium mt-1">{result.tournament} • {result.category}</p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between bg-background md:bg-transparent p-3 md:p-0 rounded-xl border border-foreground/5 md:border-none">
              <span className="text-xs text-foreground/40 font-bold uppercase tracking-widest mb-1">{result.date}</span>
              <span className="text-sm font-bold text-foreground tracking-wide">{result.score}</span>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}
