'use client';

import { useMatchStore, Team } from '@/lib/store/useMatchStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Undo2, Redo2, MessageSquare, VolumeX, Volume2, Cast, Menu, RefreshCcw, ArrowLeftRight, ArrowUpDown, Smartphone, Trophy, Camera, Palette } from 'lucide-react';
import Link from 'next/link';
import { MatchService } from '@/lib/api/matches';
import { ScoreService } from '@/lib/api/scores';
import { usePracticeMatchStore } from '@/lib/store/usePracticeMatchStore';
import { ThemeModal } from '@/components/theme/ThemeModal';

export default function UmpireScoringPage({ params }: { params: Promise<{ matchId: string }> }) {
  const router = useRouter();
  const store = useMatchStore();
  const { matchId } = use(params);
  const searchParams = useSearchParams();
  const { config, currentGameIndex, games, matchWinner, teamsFlipped } = store;

  const categoryId = searchParams.get('categoryId');
  const isPracticeParam = searchParams.get('isPractice') === 'true' || searchParams.get('mode') === 'practice';
  const hasTournamentContext = Boolean(searchParams.get('tournamentUuid') || searchParams.get('tournamentId') || (config?.tournamentName && !['Practice Match', 'Quick Match', 'Local Match'].includes(config.tournamentName)));
  const isOfficial = matchId !== 'live' && !matchId.startsWith('practice-') && !matchId.startsWith('match-') && !isPracticeParam && hasTournamentContext;

  useEffect(() => {
    // Fetch match data for official tournament matches if not present in the store
    if (isOfficial && !config) {
      MatchService.getById(matchId)
        .then((res: any) => {
          if (res && res.data) {
            const m = res.data;
            if (m.status === 'COMPLETED') {
              // Match is already finished: redirect to view score and player details
              router.replace(`/live-score/${matchId}`);
              return;
            }

            const teamAParts = m.teamAName ? m.teamAName.split(/\s*&\s*/) : ['Team A'];
            const teamBParts = m.teamBName ? m.teamBName.split(/\s*&\s*/) : ['Team B'];
            const category = (teamAParts.length > 1 || teamBParts.length > 1) ? 'Doubles' : 'Singles';
            
            store.setupMatch({
              id: matchId,
              category: category as any,
              bestOfSets: 3,
              pointBreak: 21,
              teamA: teamAParts,
              teamB: teamBParts,
              teamAName: m.teamAName,
              teamBName: m.teamBName,
              tournamentName: m.tournamentName,
              courtName: m.courtName || (m.courtId ? `Court ${m.courtId}` : 'Court 1'),
              sportType: m.sportType || 'Badminton',
            });

            // Mark match as LIVE
            MatchService.updateStatus(matchId, 'LIVE').catch(err => console.error("Failed to set match status LIVE", err));
          }
        })
        .catch(err => {
          console.error("Failed to load match details for scoring:", err);
          store.setupMatch({
            id: matchId,
            category: 'Doubles',
            bestOfSets: 3,
            pointBreak: 21,
            teamA: ['Player 1 (A)', 'Player 2 (A)'],
            teamB: ['Player 1 (B)', 'Player 2 (B)']
          });
        });
    } else if (isOfficial && config) {
      MatchService.getById(matchId).then((res: any) => {
        if (res && res.data && res.data.status === 'COMPLETED') {
          router.replace(`/live-score/${matchId}`);
        } else {
          MatchService.updateStatus(matchId, 'LIVE').catch(() => {});
        }
      }).catch(() => {
        MatchService.updateStatus(matchId, 'LIVE').catch(() => {});
      });
    }
  }, [isOfficial, config, matchId, store]);

  const [orientationOverride, setOrientationOverride] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [isWindowPortrait, setIsWindowPortrait] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [showUmpireCall, setShowUmpireCall] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const [intervalSeconds, setIntervalSeconds] = useState(120);
  const [isRallyActive, setIsRallyActive] = useState(false);
  const [rallyStartTime, setRallyStartTime] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (games[currentGameIndex]?.isGameOver && !matchWinner && intervalSeconds > 0) {
      timer = setInterval(() => {
        setIntervalSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [games, currentGameIndex, matchWinner, intervalSeconds]);

  useEffect(() => {
    if (!games[currentGameIndex]?.isGameOver) {
      setIntervalSeconds(120);
    }
  }, [games, currentGameIndex]);

  useEffect(() => {
    if (!config || matchWinner || games[currentGameIndex]?.isGameOver) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [config, matchWinner, games, currentGameIndex]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleResize = () => setIsWindowPortrait(window.innerHeight > window.innerWidth);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPortrait = orientationOverride === 'auto' ? isWindowPortrait : orientationOverride === 'portrait';

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!matchWinner) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [matchWinner]);

  // Submit category score if this is a Team Event Category Match and it just finished
  useEffect(() => {
    if (matchWinner && categoryId && isOfficial && config) {
      const winnerTeam = matchWinner === 'A' ? 'TEAM_A' : 'TEAM_B';
      const setsTeamA = games.filter(g => g.winner === 'A').length;
      const setsTeamB = games.filter(g => g.winner === 'B').length;
      
      const scoreSummary = `${setsTeamA}-${setsTeamB}`;
      
      const teamARegIdStr = searchParams.get('teamARegId');
      const teamBRegIdStr = searchParams.get('teamBRegId');
      
      const winnerRegistrationId = matchWinner === 'A' && teamARegIdStr 
        ? parseInt(teamARegIdStr) 
        : (matchWinner === 'B' && teamBRegIdStr ? parseInt(teamBRegIdStr) : null);

      import('@/lib/api/teamEvents').then(({ TeamEventService }) => {
        TeamEventService.submitCategoryScore(parseInt(categoryId), winnerRegistrationId, scoreSummary)
          .catch(err => console.error("Failed to submit category match score", err));
      });
    }
  }, [matchWinner, categoryId, isOfficial, config, games, searchParams]);

  // Sync live score state to scores table whenever score changes
  useEffect(() => {
    if (isOfficial && config && games.length > 0) {
      const currentGame = games[currentGameIndex];
      const stateToSync = {
        config,
        games,
        currentGameIndex,
        matchWinner,
        teamAScore: currentGame ? String(currentGame.scoreA) : '0',
        teamBScore: currentGame ? String(currentGame.scoreB) : '0',
        isFinal: !!matchWinner
      };

      ScoreService.sync(matchId, stateToSync).catch(err => console.error("Failed to sync score state:", err));
    }
  }, [isOfficial, config, games, currentGameIndex, matchWinner, matchId]);

  // Update local offline vault for quick/practice matches
  useEffect(() => {
    if (!isOfficial && config && games.length > 0) {
      const currentGame = games[currentGameIndex];
      const targetId = store.config?.id || matchId;
      usePracticeMatchStore.getState().updateRecord(targetId, {
        scoreA: currentGame ? String(currentGame.scoreA) : '0',
        scoreB: currentGame ? String(currentGame.scoreB) : '0',
        winner: matchWinner || undefined,
        status: matchWinner ? 'completed' : 'live',
      });
    }
  }, [isOfficial, config, games, currentGameIndex, matchWinner, matchId, store.config?.id]);

  // Handle regular tournament match completion (set status COMPLETED & winnerRegistrationId)
  useEffect(() => {
    if (matchWinner && isOfficial && !categoryId) {
      MatchService.getById(matchId).then((res: any) => {
        const m = res.data;
        const winnerRegId = matchWinner === 'A' ? m?.teamARegistrationId : m?.teamBRegistrationId;
        MatchService.updateStatus(matchId, 'COMPLETED', winnerRegId)
          .catch(err => console.error("Failed to set match status COMPLETED", err));
      }).catch(() => {
        MatchService.updateStatus(matchId, 'COMPLETED').catch(() => {});
      });
    }
  }, [matchWinner, isOfficial, categoryId, matchId]);

  const currentGame = games[currentGameIndex];

  const handleScore = (team: Team) => {
    const rallyTimeMs = rallyStartTime ? Date.now() - rallyStartTime : 0;
    store.addPoint(team, rallyTimeMs);
    setIsRallyActive(false);
    setRallyStartTime(null);
  };

  const isServeA = currentGame?.currentServer === 'A';
  const isServeB = currentGame?.currentServer === 'B';
  const serveFromRightA = isServeA && ((currentGame?.scoreA || 0) % 2 === 0);
  const serveFromLeftA = isServeA && ((currentGame?.scoreA || 0) % 2 !== 0);
  const serveFromRightB = isServeB && ((currentGame?.scoreB || 0) % 2 === 0);
  const serveFromLeftB = isServeB && ((currentGame?.scoreB || 0) % 2 !== 0);

  let serverFullName = '';
  let receiverFullName = '';

  if (config && currentGame) {
    if (isServeA) {
      if (currentGame.scoreA % 2 === 0) {
        serverFullName = currentGame.posA.right !== null ? config.teamA[currentGame.posA.right] : config.teamA[0];
        receiverFullName = currentGame.posB.right !== null ? config.teamB[currentGame.posB.right] : config.teamB[0];
      } else {
        serverFullName = currentGame.posA.left !== null ? config.teamA[currentGame.posA.left] : config.teamA[0];
        receiverFullName = currentGame.posB.left !== null ? config.teamB[currentGame.posB.left] : config.teamB[0];
      }
    } else {
      if (currentGame.scoreB % 2 === 0) {
        serverFullName = currentGame.posB.right !== null ? config.teamB[currentGame.posB.right] : config.teamB[0];
        receiverFullName = currentGame.posA.right !== null ? config.teamA[currentGame.posA.right] : config.teamA[0];
      } else {
        serverFullName = currentGame.posB.left !== null ? config.teamB[currentGame.posB.left] : config.teamB[0];
        receiverFullName = currentGame.posA.left !== null ? config.teamA[currentGame.posA.left] : config.teamA[0];
      }
    }
  }

  const generateUmpireCall = () => {
    if (!config || !currentGame) return '';
    if (currentGame.scoreA === 0 && currentGame.scoreB === 0) {
      return `${serverFullName} to serve ${receiverFullName}. Love all. Play.`;
    }

    const serverScore = isServeA ? currentGame.scoreA : currentGame.scoreB;
    const receiverScore = isServeA ? currentGame.scoreB : currentGame.scoreA;

    let call = `${serverFullName} to ${receiverFullName}. `;

    const lastGame = store.history.length > 0 ? store.history[store.history.length - 1] : null;
    const isServiceOver = lastGame && lastGame.currentServer !== currentGame.currentServer;

    if (isServiceOver) {
      call += 'Service over. ';
    }

    const ptBreak = config.pointBreak;
    const isGamePointServer = serverScore >= (ptBreak - 1) && serverScore > receiverScore;
    const isGamePointReceiver = receiverScore >= (ptBreak - 1) && receiverScore > serverScore;
    const cap = ptBreak === 21 ? 30 : ptBreak === 15 ? 21 : 30;
    const isCapPoint = serverScore === cap - 1 && receiverScore === cap - 1;

    const hasGamePoint = isGamePointServer || isGamePointReceiver || isCapPoint;

    if (hasGamePoint) {
      const winningTeam = isGamePointServer ? currentGame.currentServer : (isGamePointReceiver ? (currentGame.currentServer === 'A' ? 'B' : 'A') : null);

      let isMatchPoint = false;
      if (winningTeam) {
        const winsWinningTeam = games.filter(g => g.winner === winningTeam).length;
        const requiredWins = Math.ceil(config.bestOfSets / 2);
        if (winsWinningTeam + 1 >= requiredWins) {
          isMatchPoint = true;
        }
      } else if (isCapPoint) {
        const winsA = games.filter(g => g.winner === 'A').length;
        const winsB = games.filter(g => g.winner === 'B').length;
        const requiredWins = Math.ceil(config.bestOfSets / 2);
        if (winsA + 1 >= requiredWins || winsB + 1 >= requiredWins) {
          isMatchPoint = true;
        }
      }

      call += isMatchPoint ? 'Match point. ' : 'Game point. ';
    }

    if (serverScore === receiverScore) {
      call += `${serverScore} all`;
    } else {
      call += `${serverScore} - ${receiverScore}`;
    }

    return call;
  };

  const umpireCall = generateUmpireCall();

  useEffect(() => {
    if (!isMuted && umpireCall) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(umpireCall);
      window.speechSynthesis.speak(utterance);
    }
  }, [umpireCall, isMuted]);

  if (!config || !currentGame) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-foreground p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">No Match Active</h1>
        <p className="text-foreground/60 mb-8">Please configure a match first.</p>
        <Link href="/match-setup" className="bg-red-500 text-black font-bold py-3 px-8 rounded-xl hover:opacity-90 active:scale-95 transition-transform">
          Setup Match
        </Link>
      </div>
    );
  }

  const leftTeam: Team = teamsFlipped ? 'B' : 'A';
  const rightTeam: Team = teamsFlipped ? 'A' : 'B';

  const isMatchStarted = store.history.length > 0 || currentGame.scoreA > 0 || currentGame.scoreB > 0 || currentGameIndex > 0;

  const renderPlayerBox = (
    playerName: string,
    isServing: boolean,
    team: Team,
    boxIndex: number,
    isFirstHalf: boolean
  ) => {
    const isActive = isServing;
    const isZeroZero = currentGame.scoreA === 0 && currentGame.scoreB === 0;

    return (
      <div
        onClick={() => {
          if (isZeroZero) store.setInitialServer(team);
        }}
        className={`flex-1 flex items-center justify-center relative transition-colors ${isActive ? (isFirstHalf ? 'border border-primary bg-primary/[0.02]' : 'border border-[#3B82F6] bg-[#3B82F6]/[0.02]') : 'border border-transparent'} ${isZeroZero ? 'cursor-pointer hover:bg-foreground/5' : ''}`}
      >
        {playerName ? (
          <div className="flex items-center gap-2 relative z-10 px-1">
            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/50 shrink-0">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </div>
            <span className="text-xs font-bold text-foreground/90 tracking-tight truncate max-w-[85px] sm:max-w-[120px]">{playerName}</span>
          </div>
        ) : null}

        {isActive && (
          <div className={`absolute 
            ${isPortrait ? (isFirstHalf ? 'bottom-4 left-1/2 -translate-x-1/2' : 'top-4 left-1/2 -translate-x-1/2')
              : (isFirstHalf ? 'right-4 top-1/2 -translate-y-1/2' : 'left-4 top-1/2 -translate-y-1/2')} 
            w-8 h-8 rounded-full ${isFirstHalf ? 'bg-primary/10 border border-primary/40' : 'bg-[#3B82F6]/10 border border-[#3B82F6]/40'} flex items-center justify-center z-10`}
          >
            <div className={`w-3.5 h-3.5 rounded-full ${isFirstHalf ? 'bg-primary shadow-[0_0_10px_var(--athlon-primary)]' : 'bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]'}`} />
          </div>
        )}
      </div>
    );
  };

  const renderTeamHalf = (team: Team, isFirstHalf: boolean) => {
    const isTeamA = team === 'A';

    const names = isTeamA ? config.teamA : config.teamB;

    const posLeft = isTeamA ? currentGame.posA.left : currentGame.posB.left;
    const posRight = isTeamA ? currentGame.posA.right : currentGame.posB.right;

    const serveL = isTeamA ? serveFromLeftA : serveFromLeftB;
    const serveR = isTeamA ? serveFromRightA : serveFromRightB;

    let pos1, pos2;
    let serve1, serve2;

    if (isPortrait) {
      if (isFirstHalf) {
        pos1 = posRight;
        pos2 = posLeft;
        serve1 = serveR;
        serve2 = serveL;
      } else {
        pos1 = posLeft;
        pos2 = posRight;
        serve1 = serveL;
        serve2 = serveR;
      }
    } else {
      if (isFirstHalf) {
        pos1 = posLeft;
        pos2 = posRight;
        serve1 = serveL;
        serve2 = serveR;
      } else {
        pos1 = posRight;
        pos2 = posLeft;
        serve1 = serveR;
        serve2 = serveL;
      }
    }

    const player1 = {
      name: pos1 !== null ? names[pos1] : '',
      isServing: serve1
    };

    const player2 = {
      name: pos2 !== null ? names[pos2] : '',
      isServing: serve2
    };

    const isSingles = config.category === 'Singles';

    const renderCourtMarkings = (isFirst: boolean) => {
      const lineStyle = "absolute bg-foreground/20";
      if (isPortrait) {
        return (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className={`${lineStyle} w-[1px] top-0 bottom-0 left-[8%]`} />
            <div className={`${lineStyle} w-[1px] top-0 bottom-0 right-[8%]`} />
            <div className={`${lineStyle} h-[1px] left-0 right-0 ${isFirst ? 'top-[8%]' : 'bottom-[8%]'}`} />
            <div className={`${lineStyle} h-[1px] left-0 right-0 ${isFirst ? 'bottom-[25%]' : 'top-[25%]'}`} />
            <div className={`${lineStyle} w-[1px] left-1/2 ${isFirst ? 'top-0 bottom-[25%]' : 'top-[25%] bottom-0'}`} />
          </div>
        );
      } else {
        return (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className={`${lineStyle} h-[1px] left-0 right-0 top-[8%]`} />
            <div className={`${lineStyle} h-[1px] left-0 right-0 bottom-[8%]`} />
            <div className={`${lineStyle} w-[1px] top-0 bottom-0 ${isFirst ? 'left-[8%]' : 'right-[8%]'}`} />
            <div className={`${lineStyle} w-[1px] top-0 bottom-0 ${isFirst ? 'right-[25%]' : 'left-[25%]'}`} />
            <div className={`${lineStyle} h-[1px] top-1/2 ${isFirst ? 'left-0 right-[25%]' : 'left-[25%] right-0'}`} />
          </div>
        );
      }
    };

    return (
      <div className={`flex-1 flex ${isPortrait ? 'flex-row' : 'flex-col'} relative`}>
        {renderCourtMarkings(isFirstHalf)}
        {renderPlayerBox(player1.name, player1.isServing, team, 0, isFirstHalf)}
        {renderPlayerBox(player2.name, player2.isServing, team, 1, isFirstHalf)}

        {!isSingles && !isMatchStarted && (
          <button
            onClick={() => store.swapPlayers(team)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-lg border border-foreground/15 z-20 text-foreground/80 active:scale-95"
            title="Swap positions"
          >
            <ArrowLeftRight className={`w-5 h-5 ${isPortrait ? 'block' : 'hidden'}`} />
            <ArrowUpDown className={`w-5 h-5 ${!isPortrait ? 'block' : 'hidden'}`} />
          </button>
        )}
      </div>
    );
  };

  const handleCopyOBSUrl = () => {
    if (!config) return;
    const url = `${window.location.origin}/overlay/${config.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('OBS Overlay URL copied to clipboard!\n\nPaste this into a Browser Source in OBS:\n' + url);
    }).catch(err => {
      alert('Failed to copy: ' + url);
    });
  };

  const TopBarActions = () => (
    <>
      <button
        onClick={() => setIsThemeModalOpen(true)}
        title="Change Theme & Appearance"
        className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm active:scale-95 text-primary"
      >
        <Palette className="w-5 h-5" />
      </button>
      <button
        onClick={() => setShowUmpireCall(!showUmpireCall)}
        className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm active:scale-95"
      >
        <MessageSquare className={`w-5 h-5 ${showUmpireCall ? 'text-primary' : 'text-foreground/70'}`} />
      </button>
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm active:scale-95"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-foreground/70" /> : <Volume2 className="w-5 h-5 text-primary" />}
      </button>
    </>
  );

  const TopBarRightActions = () => (
    <>
      <button onClick={store.undoPoint} disabled={store.history.length === 0 || !!matchWinner || currentGame.isGameOver} className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors disabled:opacity-30 shadow-sm active:scale-95">
        <Undo2 className="w-5 h-5 text-foreground/70" />
      </button>
      <button className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors opacity-30 cursor-not-allowed shadow-sm">
        <Redo2 className="w-5 h-5 text-foreground/70" />
      </button>
      <button
        onClick={() => setOrientationOverride(prev => {
          if (prev === 'auto') return isWindowPortrait ? 'landscape' : 'portrait';
          return prev === 'portrait' ? 'landscape' : 'portrait';
        })}
        className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm active:scale-95"
      >
        <Smartphone className={`w-5 h-5 ${isPortrait ? 'text-foreground/70' : 'text-foreground/70 rotate-90'}`} />
      </button>
      <button onClick={() => router.push('/')} className="w-10 h-10 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm active:scale-95">
        <Menu className="w-5 h-5 text-foreground/70" />
      </button>
    </>
  );

  const isForcedLandscape = orientationOverride === 'landscape' && isWindowPortrait;
  const isForcedPortrait = orientationOverride === 'portrait' && !isWindowPortrait;

  const containerStyle = isForcedLandscape ? {
    width: '100dvh',
    height: '100vw',
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(90deg)',
    transformOrigin: 'center center'
  } : isForcedPortrait ? {
    width: '100dvh',
    height: '100vw',
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-90deg)',
    transformOrigin: 'center center'
  } : {
    width: '100%',
    height: '100dvh',
    position: 'relative' as const
  };

  const teamAThemeClass = 'text-primary font-black';
  const teamADotClass = 'bg-primary shadow-[0_0_10px_var(--athlon-primary)]';

  const teamBThemeClass = 'text-primary font-black';
  const teamBDotClass = 'bg-primary shadow-[0_0_10px_var(--athlon-primary)]';

  const umpireBubbleBg = 'bg-primary';
  const umpireBubbleBorderB = 'border-b-[var(--athlon-primary)]';
  const umpireBubbleBorderT = 'border-t-[var(--athlon-primary)]';

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <div style={containerStyle} className="flex flex-col text-foreground selection:bg-transparent overflow-hidden">

        {/* HEADER AREA */}
        <div className={`flex items-start justify-between ${isPortrait ? 'p-2 lg:p-4' : 'px-4 pt-4 pb-2'} shrink-0 relative z-40`}>

          {/* Landscape Left Actions */}
          <div className={`${!isPortrait ? 'flex' : 'hidden'} gap-2`}>
            <TopBarActions />
          </div>

          {/* CENTER SCOREBOARD PILL (High Contrast & Vibrant Theme Redesign) */}
          <div className="flex-1 flex flex-col items-center relative mt-1">

            {/* Timer HUD Pill */}
            <div className="bg-white dark:bg-[#1a1f2c] border border-foreground/20 dark:border-foreground/15 text-foreground text-xs font-mono font-black px-3.5 py-1 rounded-full flex items-center gap-2 shadow-lg -mb-3 relative z-30">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--athlon-primary)]" />
              <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="tracking-wider text-foreground font-black">{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Main Scoreboard Card */}
            <div className={`w-full max-w-[460px] bg-white dark:bg-[#141824] rounded-2xl ${!isPortrait ? 'py-1.5' : 'p-3.5'} border-2 border-foreground/15 dark:border-primary/30 shadow-[0_12px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col gap-2 ring-1 ring-primary/20`}>
              {/* Dynamic Theme Left Accent Strip */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary shadow-[0_0_14px_var(--athlon-primary)]" />

              {/* Team A Row */}
              <div className={`flex items-center justify-between relative pl-4 pr-3 ${!isPortrait ? 'py-1' : 'py-0.5'}`}>
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  {isServeA ? (
                    <span className="flex h-3 w-3 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_10px_var(--athlon-primary)]" />
                    </span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-foreground/15 shrink-0" />
                  )}
                  <span className="text-sm sm:text-base font-medium truncate text-foreground">
                    {config.teamA.join(' / ')}
                  </span>
                </div>

                {/* Team A Set Scores */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {Array.from({ length: config.bestOfSets }).map((_, i) => {
                    const g = games[i];
                    const isCurrent = i === currentGameIndex;
                    if (!g && i > currentGameIndex) {
                      return (
                        <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-foreground/30 bg-foreground/5 border border-foreground/5">
                          -
                        </div>
                      );
                    }
                    return (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-mono font-black transition-all ${
                          isCurrent
                            ? 'bg-primary text-black dark:text-black shadow-[0_0_12px_var(--athlon-primary)] border border-primary'
                            : 'bg-foreground/10 text-foreground font-black border border-foreground/10'
                        }`}
                      >
                        {g ? g.scoreA : 0}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] w-full bg-foreground/15 ml-4 pr-4" />

              {/* Team B Row */}
              <div className={`flex items-center justify-between relative pl-4 pr-3 ${!isPortrait ? 'py-1' : 'py-0.5'}`}>
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  {isServeB ? (
                    <span className="flex h-3 w-3 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_10px_var(--athlon-primary)]" />
                    </span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-foreground/15 shrink-0" />
                  )}
                  <span className="text-sm sm:text-base font-medium truncate text-foreground">
                    {config.teamB.join(' / ')}
                  </span>
                </div>

                {/* Team B Set Scores */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {Array.from({ length: config.bestOfSets }).map((_, i) => {
                    const g = games[i];
                    const isCurrent = i === currentGameIndex;
                    if (!g && i > currentGameIndex) {
                      return (
                        <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-foreground/30 bg-foreground/5 border border-foreground/5">
                          -
                        </div>
                      );
                    }
                    return (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-mono font-black transition-all ${
                          isCurrent
                            ? 'bg-primary text-black dark:text-black shadow-[0_0_12px_var(--athlon-primary)] border border-primary'
                            : 'bg-foreground/10 text-foreground font-black border border-foreground/10'
                        }`}
                      >
                        {g ? g.scoreB : 0}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {showUmpireCall && (
              <div className={`${!isPortrait ? 'absolute top-full mt-2 z-50' : 'hidden'} bg-primary text-black font-medium text-xs px-4 py-2 rounded-xl shadow-lg whitespace-nowrap`}>
                <div className="absolute left-8 -top-[6px] w-0 h-0 border-b-[6px] border-b-[var(--athlon-primary)] border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent" />
                {umpireCall}
              </div>
            )}
          </div>

          {/* Landscape Right Actions */}
          <div className={`${!isPortrait ? 'flex' : 'hidden'} gap-2`}>
            <TopBarRightActions />
          </div>
        </div>

        {/* PORTRAIT SPEECH BUBBLE */}
        {showUmpireCall && (
          <div className={`${isPortrait ? 'block' : 'hidden'} px-4 mb-2 relative z-30`}>
            <div className="bg-primary text-black font-medium text-xs px-4 py-2 rounded-2xl rounded-tl-none relative shadow-lg self-start inline-block">
              <div className="absolute -left-2 top-0 w-0 h-0 border-t-[10px] border-t-[var(--athlon-primary)] border-l-[10px] border-l-transparent" />
              {umpireCall}
            </div>
          </div>
        )}

        {/* MAIN PLAY AREA (Court + Scoring buttons) */}
        <div className={`flex-1 flex ${isPortrait ? 'flex-col' : 'flex-row'} min-h-0 ${isPortrait ? 'p-3' : 'px-4 pb-4 pt-1'} gap-3 lg:gap-6 z-10 relative`}>

          {/* +1 BUTTON LEFT/TOP */}
          <button
            onClick={() => handleScore(leftTeam)}
            disabled={currentGame.isGameOver || !!matchWinner || (isMatchStarted && !isRallyActive)}
            className={`${isPortrait ? 'w-full py-3' : 'h-full w-16'} rounded-2xl bg-surface flex items-center justify-center hover:bg-foreground/5 active:bg-foreground/10 transition-colors shadow-lg border border-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group`}
          >
            {!isPortrait && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary shadow-[0_0_20px_4px_rgba(27,156,86,0.5)]" />}
            <span className="text-foreground/80 font-bold text-lg relative z-10">+1</span>
          </button>

          {/* COURT */}
          <div className={`flex-1 bg-surface border border-foreground/10 overflow-hidden flex ${isPortrait ? 'flex-col' : 'flex-row'} relative shadow-2xl`}>

            {/* Left/Top Team Half */}
            {renderTeamHalf(leftTeam, true)}

            {/* Center Net Line & Controls */}
            <div className={`${isPortrait ? 'w-full h-[1px]' : 'h-full w-[1px]'} bg-foreground/20 relative z-20 flex items-center justify-center`}>

              {/* Swap Courts Button (Center) */}
              {!isMatchStarted && (
                <button
                  onClick={store.flipCourts}
                  className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-xl border border-foreground/15 text-foreground z-30 active:scale-95`}
                  title="Swap Court Sides"
                >
                  <ArrowUpDown className={`w-5 h-5 ${isPortrait ? 'block' : 'hidden'}`} />
                  <ArrowLeftRight className={`w-5 h-5 ${!isPortrait ? 'block' : 'hidden'}`} />
                </button>
              )}

              {/* Start Rally Button */}
              {isMatchStarted && !isRallyActive && !currentGame.isGameOver && !matchWinner && !currentGame.isIntervalBreak && (
                <button
                  onClick={() => {
                    setIsRallyActive(true);
                    setRallyStartTime(Date.now());
                  }}
                  className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} px-6 py-2.5 bg-primary rounded-full flex gap-2 items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(27,156,86,0.4)] border border-primary/40 text-black font-black uppercase tracking-widest text-xs z-30 whitespace-nowrap`}
                >
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Start Rally
                </button>
              )}
              {isMatchStarted && isRallyActive && (
                <div
                  className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} px-6 py-2.5 bg-surface rounded-full flex gap-2 items-center justify-center shadow-lg border border-primary/40 text-primary font-black uppercase tracking-widest text-xs z-30 whitespace-nowrap`}
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Rally Active
                </div>
              )}

            </div>

            {/* Right/Bottom Team Half */}
            {renderTeamHalf(rightTeam, false)}

          </div>

          {/* +1 BUTTON RIGHT/BOTTOM */}
          <button
            onClick={() => handleScore(rightTeam)}
            disabled={currentGame.isGameOver || !!matchWinner || (isMatchStarted && !isRallyActive)}
            className={`${isPortrait ? 'w-full py-3' : 'h-full w-16'} rounded-2xl bg-surface flex items-center justify-center hover:bg-foreground/5 active:bg-foreground/10 transition-colors shadow-lg border border-foreground/10 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group`}
          >
            {!isPortrait && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#3B82F6] shadow-[0_0_20px_4px_rgba(59,130,246,0.5)]" />}
            <span className="text-foreground/80 font-bold text-lg relative z-10">+1</span>
          </button>
        </div>

        {/* PORTRAIT BOTTOM ACTION BAR (Theme Adaptive) */}
        <div 
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          className={`${isPortrait ? 'flex' : 'hidden'} shrink-0 p-3 bg-surface/95 border-t border-foreground/10 justify-between gap-2 z-20 relative shadow-lg backdrop-blur-md`}
        >
          <TopBarActions />
          <TopBarRightActions />
        </div>

        {/* Match Over & Interval Modals */}
        {(currentGame.isGameOver || matchWinner || currentGame.isIntervalBreak) && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-surface border border-foreground/15 p-6 rounded-3xl w-full max-w-sm text-center shadow-2xl text-foreground">
              {matchWinner ? (
                <>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1 shadow-lg shadow-emerald-500/20">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Match Over</h2>
                    <p className="text-sm font-extrabold text-primary">
                      {matchWinner === 'A' ? (config.teamAName || config.teamA.join(' & ')) : (config.teamBName || config.teamB.join(' & '))} Wins!
                    </p>
                  </div>

                  {/* Match Analytics Breakdown */}
                  <div className="bg-background border border-foreground/10 rounded-2xl p-4 mb-6 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                      <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Duration</span>
                      <span className="text-xs font-bold text-foreground font-mono">{formatTime(elapsedSeconds)}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest block mb-1">Set Scores</span>
                      {games.map((g, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-bold py-1.5 px-2.5 rounded-xl bg-foreground/5 border border-foreground/5">
                          <span className="text-foreground/70">Set {idx + 1}</span>
                          <span className="text-foreground font-mono">
                            <span className={g.winner === 'A' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-foreground/80'}>{g.scoreA}</span>
                            <span className="text-foreground/30 mx-1.5">-</span>
                            <span className={g.winner === 'B' ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-foreground/80'}>{g.scoreB}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => router.push('/home')}
                      className="w-full bg-primary text-black font-black py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Back to Home Page
                    </button>
                    <button
                      onClick={() => router.push('/practice')}
                      className="w-full bg-surface hover:bg-foreground/5 border border-foreground/10 text-foreground font-bold py-3 rounded-xl active:scale-95 transition-all text-xs uppercase tracking-wider"
                    >
                      Return to Practice Vault
                    </button>
                  </div>
                </>
              ) : currentGame.isGameOver ? (
                <>
                  <h2 className="text-2xl font-black mb-1 text-foreground uppercase tracking-widest">Set Over</h2>
                  <p className="text-lg font-bold text-foreground/80 mb-4">
                    {currentGame.winner === 'A' ? config.teamA.join(' / ') : config.teamB.join(' / ')} wins Set {currentGameIndex + 1}
                  </p>
                  <div className="mb-5">
                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-1">Break Time</p>
                    <p className="text-3xl font-black text-primary font-mono">
                      {Math.floor(intervalSeconds / 60).toString().padStart(2, '0')}:{(intervalSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={store.undoPoint}
                      className="flex-1 bg-surface border border-foreground/10 text-foreground/70 font-bold py-3 rounded-xl hover:bg-foreground/5 active:scale-95 transition-all"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => store.nextGame()}
                      className="flex-[2] bg-primary text-black font-black py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg text-xs uppercase tracking-wider"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : currentGame.isIntervalBreak ? (
                <>
                  <h2 className="text-2xl font-black mb-1 text-foreground uppercase tracking-widest">Interval</h2>
                  <p className="text-sm font-bold text-foreground/60 mb-4">
                    Players may wipe down & drink
                  </p>
                  <div className="mb-5">
                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-1">Break Time</p>
                    <p className="text-3xl font-black text-[#3B82F6] font-mono">
                      {Math.floor(intervalSeconds / 60).toString().padStart(2, '0')}:{(intervalSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={store.undoPoint}
                      className="flex-1 bg-surface border border-foreground/10 text-foreground/70 font-bold py-3 rounded-xl hover:bg-foreground/5 active:scale-95 transition-all"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => store.continueFromInterval()}
                      className="flex-[2] bg-[#3B82F6] text-white font-black py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg text-xs uppercase tracking-wider"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Theme Picker Modal */}
        <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
      </div>
    </div>
  );
}
