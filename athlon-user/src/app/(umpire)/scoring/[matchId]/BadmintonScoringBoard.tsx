'use client';

import { useMatchStore, Team } from '@/lib/store/useMatchStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { Undo2, Redo2, MessageSquare, VolumeX, Volume2, Cast, Menu, RefreshCcw, ArrowLeftRight, ArrowUpDown, Smartphone, Trophy, Camera } from 'lucide-react';
import Link from 'next/link';
import { MatchService } from '@/lib/api/matches';
import { ScoreService } from '@/lib/api/scores';

export default function UmpireScoringPage({ params }: { params: Promise<{ matchId: string }> }) {
  const router = useRouter();
  const store = useMatchStore();
  const { matchId } = use(params);
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const isOfficial = matchId !== 'live';

  const { config, currentGameIndex, games, matchWinner, teamsFlipped } = store;

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
        className={`flex-1 flex items-center justify-center relative transition-colors ${isActive ? (isFirstHalf ? 'border border-[#1B9C56] bg-[#1B9C56]/[0.02]' : 'border border-[#3B82F6] bg-[#3B82F6]/[0.02]') : 'border border-transparent'} ${isZeroZero ? 'cursor-pointer hover:bg-foreground/5' : ''}`}
      >
        {playerName ? (
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </div>
            <span className="text-lg font-medium text-foreground/90 tracking-wide">{playerName}</span>
          </div>
        ) : null}

        {isActive && (
          <div className={`absolute 
            ${isPortrait ? (isFirstHalf ? 'bottom-4 left-1/2 -translate-x-1/2' : 'top-4 left-1/2 -translate-x-1/2')
              : (isFirstHalf ? 'right-4 top-1/2 -translate-y-1/2' : 'left-4 top-1/2 -translate-y-1/2')} 
            w-8 h-8 rounded-full ${isFirstHalf ? 'bg-[#1B9C56]/10 border border-[#1B9C56]/40' : 'bg-[#3B82F6]/10 border border-[#3B82F6]/40'} flex items-center justify-center z-10`}
          >
            <div className={`w-3.5 h-3.5 rounded-full ${isFirstHalf ? 'bg-[#1B9C56] shadow-[0_0_10px_#1B9C56]' : 'bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]'}`} />
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
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#1A2235] rounded-xl flex items-center justify-center hover:bg-[#454b57] transition-colors shadow-lg border border-foreground/5 z-20 text-[#a0a5b1]"
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
      {/* Stream Camera Button */}
      <button onClick={() => window.open(`/stream/${matchId}`, '_blank')} title="Stream Match via Camera" className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm text-red-500">
        <Camera className="w-5 h-5" />
      </button>

      {/* OBS Copy Button */}
      <button onClick={handleCopyOBSUrl} title="Copy OBS Overlay URL" className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm">
        <Cast className="w-5 h-5 text-foreground/70 hover:text-[#1B9C56] transition-colors" />
      </button>
      <button
        onClick={() => setShowUmpireCall(!showUmpireCall)}
        className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm"
      >
        <MessageSquare className={`w-5 h-5 ${showUmpireCall ? 'text-[#1B9C56]' : 'text-foreground/70'}`} />
      </button>
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-foreground/70" /> : <Volume2 className="w-5 h-5 text-[#1B9C56]" />}
      </button>
    </>
  );

  const TopBarRightActions = () => (
    <>
      <button onClick={store.undoPoint} disabled={store.history.length === 0 || !!matchWinner || currentGame.isGameOver} className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors disabled:opacity-50 shadow-sm">
        <Undo2 className="w-5 h-5 text-foreground/70" />
      </button>
      <button className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors opacity-50 cursor-not-allowed shadow-sm">
        <Redo2 className="w-5 h-5 text-foreground/70" />
      </button>
      <button
        onClick={() => setOrientationOverride(prev => {
          if (prev === 'auto') return isWindowPortrait ? 'landscape' : 'portrait';
          return prev === 'portrait' ? 'landscape' : 'portrait';
        })}
        className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm"
      >
        <Smartphone className={`w-5 h-5 ${isPortrait ? 'text-foreground/70' : 'text-foreground/70 rotate-90'}`} />
      </button>
      <button onClick={() => router.push('/')} className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-foreground/10 transition-colors shadow-sm">
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

  const teamAThemeClass = !teamsFlipped ? 'text-[#1B9C56]' : 'text-[#3B82F6]';
  const teamADotClass = !teamsFlipped ? 'bg-[#1B9C56] shadow-[0_0_8px_#1B9C56]' : 'bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]';

  const teamBThemeClass = teamsFlipped ? 'text-[#1B9C56]' : 'text-[#3B82F6]';
  const teamBDotClass = teamsFlipped ? 'bg-[#1B9C56] shadow-[0_0_8px_#1B9C56]' : 'bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]';

  const teamABgClass = !teamsFlipped ? 'bg-[#1B9C56]' : 'bg-[#3B82F6]';
  const teamBBgClass = teamsFlipped ? 'bg-[#1B9C56]' : 'bg-[#3B82F6]';
  const umpireBubbleBg = isServeB ? teamBBgClass : teamABgClass;

  const teamABorderBClass = !teamsFlipped ? 'border-b-[#1B9C56]' : 'border-b-[#3B82F6]';
  const teamBBorderBClass = teamsFlipped ? 'border-b-[#1B9C56]' : 'border-b-[#3B82F6]';
  const umpireBubbleBorderB = isServeB ? teamBBorderBClass : teamABorderBClass;

  const teamABorderTClass = !teamsFlipped ? 'border-t-[#1B9C56]' : 'border-t-[#3B82F6]';
  const teamBBorderTClass = teamsFlipped ? 'border-t-[#1B9C56]' : 'border-t-[#3B82F6]';
  const umpireBubbleBorderT = isServeB ? teamBBorderTClass : teamABorderTClass;

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <div style={containerStyle} className="flex flex-col text-foreground selection:bg-transparent overflow-hidden">

        {/* HEADER AREA */}
        <div className={`flex items-start justify-between ${isPortrait ? 'p-2 lg:p-4' : 'px-4 pt-4 pb-2'} shrink-0 relative z-40`}>

          {/* Landscape Left Actions */}
          <div className={`${!isPortrait ? 'flex' : 'hidden'} gap-2`}>
            <TopBarActions />
          </div>

          {/* CENTER SCOREBOARD PILL */}
          <div className="flex-1 flex flex-col items-center relative mt-2">

            <div className="bg-[#1A2235] border border-foreground/10 text-foreground/70 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md -mb-3 relative z-30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {formatTime(elapsedSeconds)}
            </div>

            <div className={`w-full max-w-[440px] bg-surface rounded-2xl ${!isPortrait ? 'py-1 shadow-lg' : 'p-3 shadow-xl'} border border-foreground/5 relative overflow-hidden flex flex-col gap-1`}>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-[#8B5CF6] to-[#3B82F6] opacity-80" />

              <div className={`flex items-center justify-between relative pl-10 pr-4 ${!isPortrait ? 'py-1' : 'py-0'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-foreground/40 font-mono text-xs absolute left-3">-</span>
                  <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                    <div className="w-full h-1/3 bg-[#FF9933]" />
                    <div className="w-full h-1/3 bg-white" />
                    <div className="w-full h-1/3 bg-[#138808]" />
                    <div className="absolute w-1.5 h-1.5 rounded-full border border-[#000080]" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground/90 truncate">{config.teamA.join(' / ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  {isServeA ? <div className={`w-2.5 h-2.5 rounded-full ${teamADotClass}`} /> : <div className="w-2.5 h-2.5" />}
                  <div className="flex items-center gap-3">
                    {Array.from({ length: config.bestOfSets }).map((_, i) => {
                      const g = games[i];
                      if (!g && i > currentGameIndex) return <span key={i} className="text-lg font-medium w-6 text-right text-foreground/20">-</span>;
                      return (
                        <span key={i} className={`text-lg font-medium w-6 text-right ${i === currentGameIndex ? teamAThemeClass : 'text-foreground/80'}`}>
                          {g ? g.scoreA : 0}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="h-[1px] w-full bg-foreground/5 pl-10" />

              <div className={`flex items-center justify-between relative pl-10 pr-4 ${!isPortrait ? 'py-1' : 'py-0'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-foreground/40 font-mono text-xs absolute left-3">-</span>
                  <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                    <div className="w-full h-1/3 bg-[#FF9933]" />
                    <div className="w-full h-1/3 bg-white" />
                    <div className="w-full h-1/3 bg-[#138808]" />
                    <div className="absolute w-1.5 h-1.5 rounded-full border border-[#000080]" />
                  </div>
                  <span className="text-[15px] font-medium text-foreground/90 truncate">{config.teamB.join(' / ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  {isServeB ? <div className={`w-2.5 h-2.5 rounded-full ${teamBDotClass}`} /> : <div className="w-2.5 h-2.5" />}
                  <div className="flex items-center gap-3">
                    {Array.from({ length: config.bestOfSets }).map((_, i) => {
                      const g = games[i];
                      if (!g && i > currentGameIndex) return <span key={i} className="text-lg font-medium w-6 text-right text-foreground/20">-</span>;
                      return (
                        <span key={i} className={`text-lg font-medium w-6 text-right ${i === currentGameIndex ? teamBThemeClass : 'text-foreground/80'}`}>
                          {g ? g.scoreB : 0}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {showUmpireCall && (
              <div className={`${!isPortrait ? 'absolute top-full mt-1.5 z-50' : 'hidden'} ${umpireBubbleBg} text-[#1a1d24] text-[13px] font-semibold px-4 py-1.5 rounded-lg shadow-md whitespace-nowrap`}>
                <div className={`absolute left-8 -top-[6px] w-0 h-0 border-b-[6px] ${umpireBubbleBorderB} border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent`} />
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
            <div className={`${umpireBubbleBg} text-[#1a1d24] text-[13px] font-semibold px-4 py-2 rounded-xl rounded-tl-none relative shadow-md self-start inline-block`}>
              <div className={`absolute -left-2 top-0 w-0 h-0 border-t-[10px] ${umpireBubbleBorderT} border-l-[10px] border-l-transparent`} />
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
            className={`${isPortrait ? 'w-full py-3' : 'h-full w-16'} rounded-2xl bg-surface flex items-center justify-center hover:bg-[#1A2235] active:bg-foreground/10 transition-colors shadow-lg border border-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group`}
          >
            {!isPortrait && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1B9C56] shadow-[0_0_20px_4px_rgba(27,156,86,0.5)]" />}
            <span className="text-foreground/60 font-medium text-lg relative z-10">+1</span>
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
                  className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} w-10 h-10 bg-[#1A2235] rounded-xl flex items-center justify-center hover:bg-[#454b57] transition-colors shadow-xl border border-foreground/10 text-foreground z-30`}
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
                  className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} px-6 py-2.5 bg-[#1B9C56] rounded-full flex gap-2 items-center justify-center hover:bg-[#15803d] active:scale-95 transition-all shadow-[0_8px_30px_rgba(27,156,86,0.4)] border border-[#1B9C56]/40 text-black font-black uppercase tracking-widest text-xs z-30 whitespace-nowrap`}
                >
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Start Rally
                </button>
              )}
              {isMatchStarted && isRallyActive && (
                <div
                  className={`absolute ${isPortrait ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} px-6 py-2.5 bg-[#1A2235] rounded-full flex gap-2 items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-foreground/10 text-[#1B9C56] font-black uppercase tracking-widest text-xs z-30 whitespace-nowrap`}
                >
                  <div className="w-2 h-2 rounded-full bg-[#1B9C56] animate-pulse" />
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
            className={`${isPortrait ? 'w-full py-3' : 'h-full w-16'} rounded-2xl bg-surface flex items-center justify-center hover:bg-[#1A2235] active:bg-foreground/10 transition-colors shadow-lg border border-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group`}
          >
            {!isPortrait && <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#3B82F6] shadow-[0_0_20px_4px_rgba(59,130,246,0.5)]" />}
            <span className="text-foreground/60 font-medium text-lg relative z-10">+1</span>
          </button>
        </div>

        {/* PORTRAIT BOTTOM ACTION BAR */}
        <div className={`${isPortrait ? 'flex' : 'hidden'} shrink-0 p-3 bg-[#1a1d24] justify-between pb-[max(1rem,env(safe-area-inset-bottom))] gap-2 z-20 relative shadow-[0_-10px_20px_rgba(0,0,0,0.2)]`}>
          <TopBarActions />
          <TopBarRightActions />
        </div>

        {/* Match Over & Interval Modals */}
        {(currentGame.isGameOver || matchWinner || currentGame.isIntervalBreak) && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-surface/90 border border-white/10 p-6 rounded-2xl w-full max-w-sm text-center shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {matchWinner ? (
                <>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1 shadow-lg shadow-emerald-500/20">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Match Over</h2>
                    <p className="text-sm font-extrabold text-[#1B9C56]">
                      {matchWinner === 'A' ? (config.teamAName || config.teamA.join(' & ')) : (config.teamBName || config.teamB.join(' & '))} Wins!
                    </p>
                  </div>

                  {/* Match Analytics Breakdown */}
                  <div className="bg-background/80 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Duration</span>
                      <span className="text-xs font-bold text-white font-mono">{formatTime(elapsedSeconds)}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">Set Scores</span>
                      {games.map((g, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-bold py-1.5 px-2.5 rounded bg-white/5">
                          <span className="text-white/70">Set {idx + 1}</span>
                          <span className="text-white font-mono">
                            <span className={g.winner === 'A' ? 'text-emerald-400 font-black' : 'text-white/80'}>{g.scoreA}</span>
                            <span className="text-white/30 mx-1.5">-</span>
                            <span className={g.winner === 'B' ? 'text-emerald-400 font-black' : 'text-white/80'}>{g.scoreB}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => router.push('/home')}
                      className="w-full bg-gradient-to-r from-[#1B9C56] to-[#15803d] text-black font-black py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Back to Home Page
                    </button>
                    <button
                      onClick={() => router.push('/home/matches')}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl active:scale-95 transition-all text-xs uppercase tracking-wider"
                    >
                      Return to Matches List
                    </button>
                  </div>
                </>
              ) : currentGame.isGameOver ? (
                <>
                  <h2 className="text-2xl font-black mb-1 text-white uppercase tracking-widest">Set Over</h2>
                  <p className="text-lg font-bold text-white/80 mb-4">
                    {currentGame.winner === 'A' ? config.teamA.join(' / ') : config.teamB.join(' / ')} wins Set {currentGameIndex + 1}
                  </p>
                  <div className="mb-5">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Break Time</p>
                    <p className="text-3xl font-black text-[#1B9C56] font-mono">
                      {Math.floor(intervalSeconds / 60).toString().padStart(2, '0')}:{(intervalSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={store.undoPoint}
                      className="flex-1 bg-white/5 text-white/70 font-bold py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => store.nextGame()}
                      className="flex-[2] bg-gradient-to-r from-[#1B9C56] to-[#15803d] text-white font-black py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : currentGame.isIntervalBreak ? (
                <>
                  <h2 className="text-2xl font-black mb-1 text-white uppercase tracking-widest">Interval</h2>
                  <p className="text-sm font-bold text-white/60 mb-4">
                    Players may wipe down & drink
                  </p>
                  <div className="mb-5">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Break Time</p>
                    <p className="text-3xl font-black text-[#3B82F6] font-mono">
                      {Math.floor(intervalSeconds / 60).toString().padStart(2, '0')}:{(intervalSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={store.undoPoint}
                      className="flex-1 bg-white/5 text-white/70 font-bold py-3 rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                    >
                      Undo
                    </button>
                    <button
                      onClick={() => store.continueFromInterval()}
                      className="flex-[2] bg-gradient-to-r from-[#3B82F6] to-[#2563eb] text-white font-black py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
                    >
                      Continue
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
