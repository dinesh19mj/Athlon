import { useState } from 'react';
import { X, ArrowLeftRight, Users, LayoutList, Map } from 'lucide-react';
import { Player, Team } from '@/lib/store/useMatchStore';
import FieldView from './FieldView';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: string;
  teamAName: string;
  teamBName: string;
  playersA: Player[];
  playersB: Player[];
  onSubstitute: (team: Team, playerOutId: string, playerInId: string) => void;
}

export default function RosterModal({ 
  isOpen, 
  onClose, 
  sport,
  teamAName, 
  teamBName, 
  playersA, 
  playersB, 
  onSubstitute 
}: RosterModalProps) {
  const [activeTab, setActiveTab] = useState<Team>('A');
  const [viewMode, setViewMode] = useState<'list' | 'field'>('field');
  
  const [selectedOutId, setSelectedOutId] = useState<string | null>(null);
  const [selectedInId, setSelectedInId] = useState<string | null>(null);

  const [quickSubOut, setQuickSubOut] = useState('');
  const [quickSubIn, setQuickSubIn] = useState('');

  if (!isOpen) return null;

  const activePlayers = activeTab === 'A' ? playersA : playersB;
  const onFieldPlayers = activePlayers.filter(p => p.onField);
  const benchedPlayers = activePlayers.filter(p => !p.onField);

  const handlePlayerClick = (player: Player) => {
    if (player.onField) {
      // Toggle selection for player going OUT
      setSelectedOutId(selectedOutId === player.id ? null : player.id);
    } else {
      // Toggle selection for player coming IN
      setSelectedInId(selectedInId === player.id ? null : player.id);
    }
  };

  const handleConfirmSub = () => {
    if (selectedOutId && selectedInId) {
      onSubstitute(activeTab, selectedOutId, selectedInId);
      setSelectedOutId(null);
      setSelectedInId(null);
    }
  };

  const handleQuickSub = (e: React.FormEvent) => {
    e.preventDefault();
    const pOut = onFieldPlayers.find(p => p.jerseyNumber === quickSubOut);
    const pIn = benchedPlayers.find(p => p.jerseyNumber === quickSubIn);
    
    if (pOut && pIn) {
      onSubstitute(activeTab, pOut.id, pIn.id);
      setQuickSubOut('');
      setQuickSubIn('');
    } else {
      alert('Could not find players with those jersey numbers.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-foreground/5 bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg uppercase tracking-widest">Roster & Subs</h2>
            <p className="text-xs text-foreground/50 font-bold tracking-wider">Manage on-field players</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex justify-center p-3 bg-background border-b border-foreground/5">
        <div className="flex bg-surface p-1 rounded-xl shadow-inner border border-foreground/5 gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/80'}`}
          >
            <LayoutList className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('field')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'field' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/80'}`}
          >
            <Map className="w-4 h-4" />
            Field
          </button>
        </div>
      </div>

      {/* TEAM SELECTOR */}
      <div className="p-4 bg-surface border-b border-foreground/5">
        <div className="flex p-1 bg-background border border-foreground/5 rounded-2xl shadow-inner mb-4">
          <button 
            onClick={() => { setActiveTab('A'); setSelectedOutId(null); setSelectedInId(null); setQuickSubOut(''); setQuickSubIn(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'A' ? 'bg-red-500 text-foreground shadow-lg' : 'text-foreground/40 hover:text-foreground/80'}`}
          >
            {teamAName}
          </button>
          <button 
            onClick={() => { setActiveTab('B'); setSelectedOutId(null); setSelectedInId(null); setQuickSubOut(''); setQuickSubIn(''); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'B' ? 'bg-red-500 text-foreground shadow-lg' : 'text-foreground/40 hover:text-foreground/80'}`}
          >
            {teamBName}
          </button>
        </div>

        {/* QUICK SUB PANEL */}
        <form onSubmit={handleQuickSub} className="flex items-center gap-2 bg-background p-3 rounded-2xl border border-foreground/5">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Out #" 
              value={quickSubOut}
              onChange={e => setQuickSubOut(e.target.value)}
              className="w-full bg-surface border border-red-500/20 rounded-xl px-3 py-2 text-center text-sm font-bold focus:outline-none focus:border-red-500 placeholder-foreground/30"
            />
          </div>
          <ArrowLeftRight className="w-4 h-4 text-foreground/40 shrink-0" />
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="In #" 
              value={quickSubIn}
              onChange={e => setQuickSubIn(e.target.value)}
              className="w-full bg-surface border border-green-500/20 rounded-xl px-3 py-2 text-center text-sm font-bold focus:outline-none focus:border-green-500 placeholder-foreground/30"
            />
          </div>
          <button 
            type="submit"
            disabled={!quickSubOut || !quickSubIn}
            className="bg-foreground text-background px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Swap
          </button>
        </form>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar pb-32">
        
        {/* ON FIELD SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">On Field ({onFieldPlayers.length})</h3>
          </div>
          
          {viewMode === 'field' ? (
            <FieldView 
              sport={sport}
              players={onFieldPlayers}
              selectedOutId={selectedOutId}
              onPlayerClick={handlePlayerClick}
            />
          ) : (
            <div className="space-y-2">
              {onFieldPlayers.length === 0 && <p className="text-xs text-foreground/40 px-2 font-bold italic">No players on field.</p>}
              {onFieldPlayers.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handlePlayerClick(p)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedOutId === p.id ? 'bg-red-500/10 border-red-500/50 shadow-inner' : 'bg-surface border-foreground/5 hover:bg-foreground/5'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-xs font-black mr-3 shrink-0">
                      {p.jerseyNumber || '#'}
                    </div>
                    <div>
                      <div className="font-bold">{p.name || 'Unnamed Player'}</div>
                      <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-bold mt-0.5">{p.position || 'No Position'}</div>
                    </div>
                  </div>
                  {selectedOutId === p.id && <div className="text-[10px] bg-red-500 text-foreground px-2 py-1 rounded-lg font-black uppercase tracking-widest animate-pulse">Sub Out</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BENCH SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">Bench ({benchedPlayers.length})</h3>
          </div>
          <div className="space-y-2">
            {benchedPlayers.length === 0 && <p className="text-xs text-foreground/40 px-2 font-bold italic">Bench is empty.</p>}
            {benchedPlayers.map(p => (
              <button 
                key={p.id}
                onClick={() => handlePlayerClick(p)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left opacity-80 ${selectedInId === p.id ? 'bg-green-500/10 border-green-500/50 shadow-inner opacity-100' : 'bg-surface border-foreground/5 hover:bg-foreground/5'}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-xs font-black mr-3 shrink-0">
                    {p.jerseyNumber || '#'}
                  </div>
                  <div>
                    <div className="font-bold">{p.name || 'Unnamed Player'}</div>
                    <div className="text-[10px] text-foreground/50 uppercase tracking-wider font-bold mt-0.5">{p.position || 'No Position'}</div>
                  </div>
                </div>
                {selectedInId === p.id && <div className="text-[10px] bg-green-500 text-background px-2 py-1 rounded-lg font-black uppercase tracking-widest animate-pulse">Sub In</div>}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER ACTION */}
      {selectedOutId && selectedInId && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-12 z-10 animate-in slide-in-from-bottom-8">
          <button 
            onClick={handleConfirmSub}
            className="w-full bg-red-500 text-foreground font-black uppercase tracking-widest py-4 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-red-400 active:scale-[0.98] transition-all shadow-[0_10px_40px_rgba(239,68,68,0.3)] border border-red-400/50"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Confirm Substitution
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
