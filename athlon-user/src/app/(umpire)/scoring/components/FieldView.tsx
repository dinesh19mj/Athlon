import React from 'react';
import { Player } from '@/lib/store/useMatchStore';

interface FieldViewProps {
  sport: 'Cricket' | 'Football' | 'Volleyball' | string;
  players: Player[];
  selectedOutId: string | null;
  onPlayerClick: (player: Player) => void;
}

export default function FieldView({ sport, players, selectedOutId, onPlayerClick }: FieldViewProps) {
  
  // Calculate relative coordinates (0-100% for top/left) based on position string
  const getCoordinates = (positionStr: string, index: number, total: number) => {
    const pos = (positionStr || '').toLowerCase();
    let x = 50; // default center x
    let y = 50; // default center y

    if (sport === 'Football') {
      if (pos.includes('gk') || pos.includes('goal')) { y = 90; x = 50; }
      else if (pos.includes('cb') || pos.includes('def') || pos.includes('back')) { y = 75; x = 20 + ((index % 4) * 20); }
      else if (pos.includes('mid') || pos.includes('cm')) { y = 50; x = 20 + ((index % 4) * 20); }
      else if (pos.includes('st') || pos.includes('fw') || pos.includes('forward') || pos.includes('attack')) { y = 25; x = 30 + ((index % 2) * 40); }
      else {
        // Unknown distribute along sides
        y = 10 + (index * 15) % 80;
        x = index % 2 === 0 ? 10 : 90;
      }
    } 
    else if (sport === 'Cricket') {
      if (pos.includes('wk') || pos.includes('keeper')) { y = 90; x = 50; }
      else if (pos.includes('bowl')) { y = 10; x = 50; }
      else if (pos.includes('bat')) { y = 50; x = 45 + ((index % 2) * 10); }
      else {
        // Oval distribution for fielders
        const angle = (index / (total || 1)) * Math.PI * 2;
        x = 50 + 40 * Math.cos(angle);
        y = 50 + 40 * Math.sin(angle);
      }
    }
    else if (sport === 'Volleyball') {
      // 3 front, 3 back (simple approximation)
      if (pos.includes('set') || pos.includes('middle') || pos.includes('block') || pos.includes('outside')) {
        y = 30;
        x = 20 + ((index % 3) * 30);
      } else if (pos.includes('libero') || pos.includes('def') || pos.includes('opp')) {
        y = 70;
        x = 20 + ((index % 3) * 30);
      } else {
        // Default 2 rows of 3
        y = index < 3 ? 30 : 70;
        x = 20 + ((index % 3) * 30);
      }
    }

    // Ensure within bounds (10% to 90%)
    x = Math.max(10, Math.min(90, x));
    y = Math.max(10, Math.min(90, y));

    return { top: `${y}%`, left: `${x}%` };
  };

  const renderFieldBackground = () => {
    switch(sport) {
      case 'Football':
        return (
          <div className="absolute inset-0 bg-[#2e8b57] border-4 border-white/40 rounded-lg overflow-hidden">
            {/* Center Line & Circle */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Penalty Boxes */}
            <div className="absolute top-0 left-1/2 w-40 h-16 border-2 border-t-0 border-white/40 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-40 h-16 border-2 border-b-0 border-white/40 -translate-x-1/2"></div>
            
            {/* Goal Areas */}
            <div className="absolute top-0 left-1/2 w-16 h-6 border-2 border-t-0 border-white/40 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-16 h-6 border-2 border-b-0 border-white/40 -translate-x-1/2"></div>
          </div>
        );
      case 'Cricket':
        return (
          <div className="absolute inset-2 bg-[#4c9a2a] rounded-[100%] border-4 border-white/30 flex items-center justify-center">
            {/* Inner Circle (30 yard) */}
            <div className="absolute w-[60%] h-[70%] border-2 border-white/20 rounded-[100%] border-dashed"></div>
            {/* The Pitch */}
            <div className="w-10 h-32 bg-[#e6c280] border border-white/20 rounded relative shadow-inner">
              {/* Crease lines */}
              <div className="absolute top-4 left-0 right-0 h-px bg-white/60"></div>
              <div className="absolute bottom-4 left-0 right-0 h-px bg-white/60"></div>
            </div>
          </div>
        );
      case 'Volleyball':
        return (
          <div className="absolute inset-0 bg-[#d98246] border-4 border-white/60 rounded-sm">
            {/* Center Net */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/80 -translate-y-1/2 shadow-sm"></div>
            {/* Attack Lines (3m lines) */}
            <div className="absolute top-[33%] left-0 right-0 h-px bg-white/40"></div>
            <div className="absolute top-[67%] left-0 right-0 h-px bg-white/40"></div>
          </div>
        );
      default:
        return <div className="absolute inset-0 bg-surface border-4 border-foreground/10 rounded-xl"></div>;
    }
  };

  return (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto my-4 shadow-2xl overflow-hidden rounded-xl">
      {/* Background Graphic */}
      {renderFieldBackground()}
      
      {/* Players */}
      {players.map((player, idx) => {
        const coords = getCoordinates(player.position, idx, players.length);
        const isSelected = selectedOutId === player.id;
        
        return (
          <button
            key={player.id}
            onClick={() => onPlayerClick(player)}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center group z-10"
            style={{ top: coords.top, left: coords.left }}
          >
            {/* Avatar Circle */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 transition-all duration-300
              ${isSelected 
                ? 'bg-red-500 border-white text-white scale-125 animate-pulse z-20' 
                : 'bg-white text-black border-foreground/20 hover:scale-110'}`}
            >
              {player.jerseyNumber || (player.name ? player.name.substring(0, 2).toUpperCase() : '?')}
            </div>
            
            {/* Player Name Badge */}
            <div className={`mt-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider whitespace-nowrap shadow-md transition-all
              ${isSelected ? 'bg-red-500 text-white z-20' : 'bg-background/90 text-foreground/80'}`}
            >
              {player.name || `Player ${idx + 1}`}
            </div>
            
            {/* Sub Out indicator */}
            {isSelected && (
              <div className="absolute -top-6 bg-red-500 text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded shadow-lg animate-bounce">
                Sub Out
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
