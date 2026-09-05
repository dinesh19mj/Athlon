import React, { useState, useEffect, useRef } from 'react';
import { Registration } from '@/lib/api/tournaments';
import { Dices, X, Shield, Trophy } from 'lucide-react';

export type SpinnerSelection = 
  | { type: 'team'; team: Registration }
  | { type: 'bye' };

interface TeamSpinnerProps {
  unassignedTeams: Registration[];
  remainingByes?: number;
  onSelect: (selection: SpinnerSelection) => void;
  disabled?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
}

type SpinnerWheelItem = 
  | { id: string; type: 'team'; team: Registration; label: string; color: string }
  | { id: string; type: 'bye'; label: string; color: string };

const TEAM_COLORS = [
  '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', 
  '#f97316', '#06b6d4', '#14b8a6', '#6366f1',
  '#e11d48', '#10b981', '#f59e0b', '#84cc16'
];

const BYE_COLOR = '#10b981';

const getRandomInt = (max: number): number => {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  }
  return Math.floor(Math.random() * max);
};

const extractTeamLabel = (t: Registration, fallbackIdx: number): string => {
  const raw = t.teamName || t.players?.[0]?.playerName || (t as any).playerName || (t as any).name || `Team ${fallbackIdx + 1}`;
  const clean = String(raw).replace(/\s*\([^)]*\)\s*$/, '').trim();
  return clean || String(raw) || `Team ${fallbackIdx + 1}`;
};

export function TeamSpinner({
  unassignedTeams,
  remainingByes = 0,
  onSelect,
  disabled,
  triggerClassName,
  triggerLabel
}: TeamSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<SpinnerWheelItem | null>(null);
  const [tickingName, setTickingName] = useState<string>('');
  const [wheelItems, setWheelItems] = useState<SpinnerWheelItem[]>([]);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<SpinnerWheelItem[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    const updateTicker = () => {
      if (isSpinning && wheelRef.current && itemsRef.current.length > 0) {
        const st = window.getComputedStyle(wheelRef.current);
        const tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("transform");
        let currentR = 0;
        if (tr !== "none") {
          const values = tr.split('(')[1].split(')')[0].split(',');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
          currentR = angle < 0 ? angle + 360 : angle;
        }
        
        const numItems = itemsRef.current.length;
        const sliceAngle = 360 / numItems;
        // Pointer is at the top (0deg / 360deg)
        const pointerAngle = (360 - (currentR % 360)) % 360;
        const sliceIndex = Math.floor(pointerAngle / sliceAngle) % numItems;
        
        const currentItem = itemsRef.current[sliceIndex];
        if (currentItem) {
          setTickingName(currentItem.label);
        }
      }
      if (isSpinning) {
        animationFrameId = requestAnimationFrame(updateTicker);
      }
    };
    
    if (isSpinning) {
      animationFrameId = requestAnimationFrame(updateTicker);
    }
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isSpinning]);

  const startSpin = () => {
    const totalCount = unassignedTeams.length + remainingByes;
    if (totalCount === 0) return;
    
    // Build items array
    const items: SpinnerWheelItem[] = [];
    
    unassignedTeams.forEach((t, i) => {
      items.push({
        id: t.registrationUuid || t.uuid || `team-${i}`,
        type: 'team',
        team: t,
        label: extractTeamLabel(t, i),
        color: TEAM_COLORS[i % TEAM_COLORS.length]
      });
    });

    for (let b = 0; b < remainingByes; b++) {
      items.push({
        id: `bye-${b}`,
        type: 'bye',
        label: 'BYE 🛡️',
        color: BYE_COLOR
      });
    }
    
    // If only 1 total item, pick immediately
    if (items.length === 1) {
      const single = items[0];
      if (single.type === 'team') onSelect({ type: 'team', team: single.team });
      else onSelect({ type: 'bye' });
      return;
    }
    
    // Fisher-Yates shuffle with crypto randomness
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    itemsRef.current = shuffled;
    setWheelItems(shuffled);
    
    // Pick winning index with crypto randomness
    const numItems = shuffled.length;
    const winningIndex = getRandomInt(numItems);
    const selectedItem = shuffled[winningIndex];

    const sliceAngle = 360 / numItems;
    // Slice center angle from top (0 deg)
    const sliceCenter = (winningIndex * sliceAngle) + (sliceAngle / 2);
    // Slight random offset inside slice (safe margins)
    const randomOffset = (Math.random() * 0.5 - 0.25) * sliceAngle;
    const winningSliceTarget = sliceCenter + randomOffset;
    
    // 5 to 7 full rotations for excitement
    const spins = 5 + getRandomInt(3);
    const targetRotation = (spins * 360) + (360 - winningSliceTarget);

    setRotation(0);
    setWinner(null);
    setTickingName(shuffled[0]?.label || '');
    setShowModal(true);
    setIsSpinning(true);

    // Trigger spin animation on next tick
    setTimeout(() => {
      setRotation(targetRotation);
    }, 60);

    // When spin animation completes (5.5s)
    setTimeout(() => {
      setIsSpinning(false);
      setWinner(selectedItem);
      
      setTimeout(() => {
        if (selectedItem.type === 'team') {
          onSelect({ type: 'team', team: selectedItem.team });
        } else {
          onSelect({ type: 'bye' });
        }
        setShowModal(false);
      }, 1500);
      
    }, 5500);
  };

  const totalAvailable = unassignedTeams.length + remainingByes;

  // Helper to calculate SVG wedge arc
  const getSlicePath = (index: number, total: number, radius = 138, cx = 140, cy = 140) => {
    if (total <= 1) return '';
    const sliceAngle = 360 / total;
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); startSpin(); }}
        disabled={disabled || totalAvailable === 0}
        className={triggerClassName || "p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed group flex items-center gap-1.5 shrink-0 active:scale-95"}
        title={`Spin wheel (${unassignedTeams.length} Teams, ${remainingByes} Byes)`}
      >
        <Dices className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" />
        {triggerLabel && <span className="font-black text-[10.5px] uppercase tracking-wider">{triggerLabel}</span>}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="rounded-3xl border p-6 sm:p-8 w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[480px]"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Top Close Button */}
            {!isSpinning && (
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-foreground/60 hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Header */}
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                {isSpinning ? "Spinning Draw Wheel..." : (winner ? "Winner Selected!" : "Random Draw Spinner")}
              </h3>
              <p className="text-xs text-foreground/50 font-medium">
                {unassignedTeams.length} Teams • {remainingByes} Byes in Category
              </p>
            </div>

            {/* The Wheel Container */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-6">
              {/* Top Pointer (12 o'clock pointing down) */}
              <div 
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white z-30 drop-shadow-xl" 
              />
              
              {/* Rotating Wheel Circle (SVG-Based for Crisp Rendering) */}
              <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-white shadow-2xl relative overflow-hidden bg-slate-900"
                style={{ 
                  transition: isSpinning ? 'transform 5.5s cubic-bezier(0.12, 0.85, 0.2, 1)' : 'none', 
                  transform: `rotate(${rotation}deg)`
                }}
              >
                <svg viewBox="0 0 280 280" className="w-full h-full">
                  {/* Slices */}
                  {wheelItems.length === 1 ? (
                    <circle cx="140" cy="140" r="138" fill={wheelItems[0].color} stroke="#ffffff" strokeWidth="3" />
                  ) : (
                    wheelItems.map((item, i) => (
                      <path
                        key={item.id}
                        d={getSlicePath(i, wheelItems.length, 138, 140, 140)}
                        fill={item.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    ))
                  )}

                  {/* Slice Text Labels */}
                  {wheelItems.map((item, i) => {
                    const numItems = wheelItems.length;
                    const sliceAngle = 360 / numItems;
                    const midAngle = i * sliceAngle + sliceAngle / 2;

                    // Cleanly format text length
                    const displayLabel = item.label.length > 15 ? item.label.slice(0, 14) + '…' : item.label;
                    const fontSize = numItems <= 4 ? 12 : numItems <= 8 ? 10.5 : 9;

                    return (
                      <g key={item.id} transform={`rotate(${midAngle}, 140, 140)`}>
                        {numItems <= 2 ? (
                          <text
                            x="140"
                            y="75"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={fontSize + 2}
                            fontWeight="900"
                            className="select-none font-sans"
                            style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.85))' }}
                          >
                            {displayLabel}
                          </text>
                        ) : (
                          <text
                            x="140"
                            y="70"
                            transform="rotate(90, 140, 70)"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={fontSize}
                            fontWeight="900"
                            letterSpacing="0.02em"
                            className="select-none font-sans"
                            style={{ filter: 'drop-shadow(0px 1.5px 2px rgba(0,0,0,0.9))' }}
                          >
                            {displayLabel}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl border-2 border-primary flex items-center justify-center z-20 pointer-events-none">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Live Ticker / Result Box */}
            <div
              className="w-full py-3.5 px-4 rounded-2xl border flex items-center justify-center text-center shadow-inner relative overflow-hidden"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <div className="flex items-center gap-2 max-w-full">
                {winner?.type === 'bye' && <Shield className="w-5 h-5 text-emerald-400 shrink-0" />}
                <span
                  className={`text-lg sm:text-xl font-black truncate ${
                    winner
                      ? winner.type === 'bye' ? 'text-emerald-400' : 'text-primary'
                      : isSpinning ? 'text-foreground' : 'text-foreground/50'
                  }`}
                >
                  {winner ? winner.label : (isSpinning ? tickingName || 'Spinning...' : 'Spinning Wheel')}
                </span>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
