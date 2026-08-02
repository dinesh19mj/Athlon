'use client';

import { useState, useEffect } from 'react';
import { Swords, Plus, Calendar, X, Users, User } from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState([
    { id: 1, type: 'Singles', teamA: ['Arjun P.'], teamB: ['Raj K.'], score: '21 - 18', status: 'Completed', winner: 'Team A' },
    { id: 2, type: 'Doubles', teamA: ['Neha G.', 'Priya S.'], teamB: ['Aditi M.', 'Riya K.'], score: '15 - 21', status: 'Completed', winner: 'Team B' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [matchType, setMatchType] = useState<'Singles' | 'Doubles'>('Singles');

  // Form State
  const [teamA1, setTeamA1] = useState('');
  const [teamA2, setTeamA2] = useState('');
  const [teamAScore, setTeamAScore] = useState('');

  const [teamB1, setTeamB1] = useState('');
  const [teamB2, setTeamB2] = useState('');
  const [teamBScore, setTeamBScore] = useState('');

  const [finalScore, setFinalScore] = useState('');

  // Auto-generate the final score string when team scores change
  useEffect(() => {
    if (teamAScore && teamBScore) {
      setFinalScore(`${teamAScore} - ${teamBScore}`);
    } else if (teamAScore) {
      setFinalScore(`${teamAScore} - `);
    } else if (teamBScore) {
      setFinalScore(` - ${teamBScore}`);
    } else {
      setFinalScore('');
    }
  }, [teamAScore, teamBScore]);

  const membersList = ['Arjun Patel', 'Raj Kumar', 'Neha Gupta', 'Vikram Singh', 'Pooja Sharma', 'Kabir Das', 'Aditi M.', 'Riya K.', 'Priya S.'];

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalScore) return;

    let teamA = [];
    let teamB = [];

    if (matchType === 'Singles') {
      if (!teamA1 || !teamB1) return;
      teamA = [teamA1];
      teamB = [teamB1];
    } else {
      if (!teamA1 || !teamA2 || !teamB1 || !teamB2) return;
      teamA = [teamA1, teamA2];
      teamB = [teamB1, teamB2];
    }

    // Determine winner based on score strings (very naive comparison for UI mockup)
    const scoreAInt = parseInt(teamAScore) || 0;
    const scoreBInt = parseInt(teamBScore) || 0;
    const winner = scoreAInt >= scoreBInt ? 'Team A' : 'Team B';

    const newMatch = {
      id: Date.now(),
      type: matchType,
      teamA,
      teamB,
      score: finalScore,
      status: 'Completed',
      winner
    };

    setMatches(prev => [newMatch, ...prev]);
    setIsAdding(false);

    // Reset
    setTeamA1(''); setTeamA2(''); setTeamAScore('');
    setTeamB1(''); setTeamB2(''); setTeamBScore('');
    setFinalScore('');
  };

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0 relative z-0">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Practice Matches</h1>
          <p className="text-foreground/50 text-xs font-bold mt-1">Log daily match updates</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 rounded-full bg-[#06B6D4] text-[#0A0F1A] shadow-[0_4px_20px_rgba(6,182,212,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar relative z-0">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-[#06B6D4]" />
          <span className="text-sm font-bold text-foreground">Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
        </div>

        {matches.map((match) => (
          <div key={match.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <Swords className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20">
                {match.type}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${match.status === 'Live' ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : 'bg-foreground/5 text-foreground/50 border border-foreground/10'
                }`}>
                {match.status}
              </span>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1 flex flex-col items-center text-center gap-1">
                {match.teamA.map((p, i) => (
                  <h3 key={i} className={`font-black text-sm md:text-base leading-tight ${match.winner === 'Team A' ? 'text-[#06B6D4]' : 'text-foreground'}`}>
                    {p}
                  </h3>
                ))}
              </div>
              <div className="px-3 shrink-0">
                <span className="text-xs font-black text-foreground/20 uppercase tracking-widest">VS</span>
              </div>
              <div className="flex-1 flex flex-col items-center text-center gap-1">
                {match.teamB.map((p, i) => (
                  <h3 key={i} className={`font-black text-sm md:text-base leading-tight ${match.winner === 'Team B' ? 'text-[#06B6D4]' : 'text-foreground'}`}>
                    {p}
                  </h3>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-foreground/10 text-center relative z-10">
              <span className="text-sm font-black text-foreground tracking-widest bg-background border border-foreground/10 px-4 py-1.5 rounded-full">
                {match.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Match Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-surface w-full h-[90%] rounded-t-[32px] border-t border-foreground/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black uppercase tracking-tight">Log Match</h2>
              <button
                onClick={() => setIsAdding(false)}
                className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">

              {/* Type Switcher */}
              <div className="flex bg-foreground/5 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setMatchType('Singles')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${matchType === 'Singles' ? 'bg-background shadow-md text-[#06B6D4]' : 'text-foreground/50 hover:text-foreground'
                    }`}
                >
                  <User className="w-4 h-4" /> Singles
                </button>
                <button
                  onClick={() => setMatchType('Doubles')}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${matchType === 'Doubles' ? 'bg-background shadow-md text-[#06B6D4]' : 'text-foreground/50 hover:text-foreground'
                    }`}
                >
                  <Users className="w-4 h-4" /> Doubles
                </button>
              </div>

              <form onSubmit={handleAddMatch} className="space-y-6">

                {/* Team A */}
                <div className="bg-[#06B6D4]/5 border border-[#06B6D4]/20 rounded-2xl p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#06B6D4] mb-3">Team A</h3>
                  <div className="space-y-3">
                    <select
                      value={teamA1}
                      onChange={(e) => setTeamA1(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select Player 1</option>
                      {membersList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    {matchType === 'Doubles' && (
                      <select
                        value={teamA2}
                        onChange={(e) => setTeamA2(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors appearance-none"
                      >
                        <option value="" disabled>Select Player 2</option>
                        {membersList.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )}

                    <div className="pt-2 border-t border-[#06B6D4]/20 mt-2 flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">Team A Score</label>
                      <input
                        type="text"
                        value={teamAScore}
                        onChange={(e) => setTeamAScore(e.target.value)}
                        placeholder="e.g. 21"
                        className="w-20 bg-background border border-[#06B6D4]/30 rounded-lg py-1.5 px-3 text-sm font-black text-center text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                  <span className="bg-surface border border-foreground/10 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-foreground/40 shadow-sm">
                    VS
                  </span>
                </div>

                {/* Team B */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-3">Team B</h3>
                  <div className="space-y-3">
                    <select
                      value={teamB1}
                      onChange={(e) => setTeamB1(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                    >
                      <option value="" disabled>Select Player 1</option>
                      {membersList.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    {matchType === 'Doubles' && (
                      <select
                        value={teamB2}
                        onChange={(e) => setTeamB2(e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                      >
                        <option value="" disabled>Select Player 2</option>
                        {membersList.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )}

                    <div className="pt-2 border-t border-orange-500/20 mt-2 flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Team B Score</label>
                      <input
                        type="text"
                        value={teamBScore}
                        onChange={(e) => setTeamBScore(e.target.value)}
                        placeholder="e.g. 18"
                        className="w-20 bg-background border border-orange-500/30 rounded-lg py-1.5 px-3 text-sm font-black text-center text-foreground focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Final Score (Auto-populated but editable) */}
                <div className="bg-surface border border-foreground/10 rounded-2xl p-4 mt-6">
                  <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2 text-center">Final Score</label>
                  <input
                    type="text"
                    value={finalScore}
                    onChange={(e) => setFinalScore(e.target.value)}
                    placeholder="e.g. 21 - 18"
                    className="w-full bg-background border border-foreground/10 rounded-xl py-4 px-4 text-sm font-black tracking-wider text-foreground focus:outline-none focus:border-[#06B6D4] transition-colors text-center"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#06B6D4] text-[#0A0F1A] font-black tracking-wide shadow-[0_5px_20px_rgba(6,182,212,0.3)] hover:bg-[#0891b2] transition-colors uppercase disabled:opacity-50 disabled:shadow-none"
                    disabled={
                      (matchType === 'Singles' && (!teamA1 || !teamB1 || !finalScore)) ||
                      (matchType === 'Doubles' && (!teamA1 || !teamA2 || !teamB1 || !teamB2 || !finalScore))
                    }
                  >
                    Save Match Result
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

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
