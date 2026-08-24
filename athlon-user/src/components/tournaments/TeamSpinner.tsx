import React, { useState, useEffect, useRef } from 'react';
import { Registration } from '@/lib/api/tournaments';
import { DicesIcon, XIcon } from 'lucide-react';

interface TeamSpinnerProps {
  unassignedTeams: Registration[];
  onSelect: (team: Registration) => void;
  disabled?: boolean;
}

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
];

export function TeamSpinner({ unassignedTeams, onSelect, disabled }: TeamSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Registration | null>(null);
  const [tickingName, setTickingName] = useState<string>('');
  const [shuffledTeams, setShuffledTeams] = useState<Registration[]>([]);
  
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const updateTicker = () => {
      if (isSpinning && wheelRef.current && shuffledTeams.length > 0) {
        const st = window.getComputedStyle(wheelRef.current);
        const tr = st.getPropertyValue("-webkit-transform") || st.getPropertyValue("transform");
        let currentR = 0;
        if(tr !== "none") {
          const values = tr.split('(')[1].split(')')[0].split(',');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          const angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
          currentR = angle < 0 ? angle + 360 : angle;
        }
        
        const numTeams = shuffledTeams.length;
        const sliceAngle = 360 / numTeams;
        
        // The pointer is at 0 degrees (right side). 
        // Relative to the wheel, the pointer is at 360 - currentR.
        const pointerAngle = 360 - (currentR % 360);
        
        // Find which slice contains the pointerAngle
        const sliceIndex = Math.floor(pointerAngle / sliceAngle) % numTeams;
        
        const currentTeam = shuffledTeams[sliceIndex];
        if (currentTeam) {
          setTickingName(currentTeam.teamName);
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
  }, [isSpinning, shuffledTeams]);

  const startSpin = () => {
    if (unassignedTeams.length === 0) return;
    
    // If there is only one team left, just select it instantly
    if (unassignedTeams.length === 1) {
      onSelect(unassignedTeams[0]);
      return;
    }
    
    // Shuffle the unassigned teams to make the wheel random every time
    const shuffled = [...unassignedTeams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledTeams(shuffled);
    
    setShowModal(true);
    setIsSpinning(true);
    setWinner(null);
    setTickingName('');

    const numTeams = shuffled.length;
    // Pick a truly random winning index from the shuffled array
    const winningIndex = Math.floor(Math.random() * numTeams);
    const sliceAngle = 360 / numTeams;
    
    // Center of the winning slice
    const sliceCenter = (winningIndex * sliceAngle) + (sliceAngle / 2);
    // Add a random offset so it doesn't stop perfectly in the middle every time (-40% to +40% of slice width)
    const randomOffset = (Math.random() * 0.8 - 0.4) * sliceAngle;
    const winningSliceTarget = sliceCenter + randomOffset;
    
    const spins = 3 + Math.floor(Math.random() * 2); // Randomize number of spins between 3 and 4
    
    const baseRotation = Math.ceil(rotation / 360) * 360;
    const targetRotation = baseRotation + (spins * 360) + (360 - winningSliceTarget);
    
    setTimeout(() => {
      setRotation(targetRotation);
    }, 50);

    // After animation finishes (6 seconds + 50ms delay)
    setTimeout(() => {
      setIsSpinning(false);
      const selected = shuffled[winningIndex];
      setWinner(selected);
      
      setTimeout(() => {
        onSelect(selected);
        setShowModal(false);
      }, 2000); // Wait a bit longer to show winner
      
    }, 6050);
  };

  const getConicGradient = () => {
    const numTeams = shuffledTeams.length;
    if (numTeams === 0) return '';
    if (numTeams === 1) return COLORS[0];
    
    const parts = shuffledTeams.map((_, i) => {
      const start = (i / numTeams) * 360;
      const end = ((i + 1) / numTeams) * 360;
      return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`;
    });
    return `conic-gradient(from 90deg, ${parts.join(', ')})`;
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); startSpin(); }}
        disabled={disabled || unassignedTeams.length === 0}
        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex shrink-0"
        title="Spin the wheel to select a team"
      >
        <DicesIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-primary/30 rounded-2xl p-8 w-full max-w-lg shadow-[0_0_50px_-12px_rgba(27,156,86,0.3)] relative overflow-hidden flex flex-col items-center min-h-[500px]">
            
            <h3 className="text-2xl font-black text-foreground mb-8 tracking-wide uppercase text-center relative z-10">
              {isSpinning ? "Spinning..." : (winner ? "Selected!" : "Ready to Spin!")}
            </h3>

            {/* The Wheel Container */}
            <div className="relative w-72 h-72 mb-8">
              {/* Pointer (Right side) */}
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[20px] border-t-transparent border-b-transparent border-r-white z-20" style={{ filter: 'drop-shadow(-2px 0px 2px rgba(0,0,0,0.5))' }} />
              
              {/* The spinning wheel */}
              <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-white shadow-2xl relative overflow-hidden"
                style={{ 
                  transition: 'transform 6s cubic-bezier(0.1, 0.7, 0.1, 1)', 
                  transform: `rotate(${rotation}deg)`,
                  background: getConicGradient()
                }}
              >
                {/* Labels */}
                {shuffledTeams.map((team, i) => {
                  const sliceAngle = 360 / shuffledTeams.length;
                  const rotateAngle = (i * sliceAngle) + (sliceAngle / 2);
                  return (
                    <div 
                      key={team.registrationUuid || team.uuid} 
                      className="absolute top-1/2 left-1/2 -translate-y-1/2 origin-left flex justify-end pr-6"
                      style={{
                        transform: `rotate(${rotateAngle}deg)`,
                        width: '50%'
                      }}
                    >
                      <span className="text-white font-bold drop-shadow-md text-xs truncate" style={{ maxWidth: '90px' }}>
                        {team.teamName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ticker / Winner Text display (Slot machine style) */}
            <div className="relative w-full h-24 mt-4 flex items-center justify-center overflow-hidden border-y-2 border-primary/20 bg-background/50 z-10 shadow-inner rounded-xl">
              <div 
                className="absolute w-full flex items-center justify-center text-3xl sm:text-4xl font-bold transition-all duration-75 text-center px-4"
                style={{ 
                  textShadow: isSpinning ? '0 0 10px rgba(27,156,86,0.5)' : '0 0 20px rgba(27,156,86,0.8)',
                  color: isSpinning ? 'rgba(255,255,255,0.8)' : 'var(--athlon-primary)',
                  transform: isSpinning ? 'scale(1.05)' : 'scale(1.15)'
                }}
              >
                {winner ? winner.teamName : (isSpinning ? tickingName : 'Ready to Spin!')}
              </div>
              
              {/* Target indicator */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-primary" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-primary" />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
