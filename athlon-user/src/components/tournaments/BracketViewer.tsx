'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Match, Registration } from '@/lib/api/tournaments';
import {
  Trophy,
  CheckCircle2,
  Layers,
  ChevronRight,
  Sparkles,
  Flame,
  Crown,
  Clock,
  Download,
  Loader2,
  FileImage,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as htmlToImage from 'html-to-image';

interface BracketViewerProps {
  matches: Match[];
  registrations: Registration[];
  tournamentType?: string;
  tournamentName?: string;
  onMatchClick?: (match: Match) => void;
}

export const BracketViewer: React.FC<BracketViewerProps> = ({
  matches,
  registrations,
  tournamentType,
  tournamentName = 'tournament',
  onMatchClick,
}) => {
  const router = useRouter();
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null);

  // ── Data Separation ───────────────────────────────────────────────────────
  const { poolMatches, playoffMatches, poolsList } = useMemo(() => {
    const pMatches: Match[] = [];
    const kMatches: Match[] = [];
    const pSet = new Set<string>();

    matches.forEach((m) => {
      if (m.poolName || m.poolId != null) {
        pMatches.push(m);
        if (m.poolName) pSet.add(m.poolName);
      } else {
        kMatches.push(m);
      }
    });

    return {
      poolMatches: pMatches,
      playoffMatches: kMatches,
      poolsList: Array.from(pSet).sort(),
    };
  }, [matches]);

  const hasBothStages = poolMatches.length > 0 && playoffMatches.length > 0;

  // Active view tab: 'all' | 'playoffs' | 'pools'
  const [activeStage, setActiveStage] = useState<'all' | 'playoffs' | 'pools'>(
    hasBothStages ? 'all' : poolMatches.length > 0 ? 'pools' : 'playoffs'
  );

  // ── Adjacency tree for playoff / knockout matches ─────────────────────────
  const { childrenMap, rootMatches } = useMemo(() => {
    const targetMatches = playoffMatches.length > 0 ? playoffMatches : matches;
    const map = new Map(targetMatches.map((m) => [m.uuid, m]));
    const childMap = new Map<string, Match[]>();

    targetMatches.forEach((m) => {
      if (m.nextMatchUuid) {
        if (!childMap.has(m.nextMatchUuid)) childMap.set(m.nextMatchUuid, []);
        childMap.get(m.nextMatchUuid)!.push(m);
      }
    });

    const roots = targetMatches.filter((m) => !m.nextMatchUuid || !map.has(m.nextMatchUuid));
    return { childrenMap: childMap, rootMatches: roots };
  }, [playoffMatches, matches]);

  // Find tournament champion if the final match is completed
  const playoffChampion = useMemo(() => {
    if (rootMatches.length === 0) return null;
    const finalMatch = rootMatches[0];
    if (finalMatch.status !== 'COMPLETED') return null;

    const winnerUuid = finalMatch.winnerRegistrationUuid;
    const winnerId = finalMatch.winnerRegistrationId;

    if (winnerUuid) {
      const reg = registrations.find(
        (r) => r.registrationUuid === winnerUuid || r.uuid === winnerUuid
      );
      if (reg?.teamName) return reg.teamName;
      if (winnerUuid === finalMatch.teamARegistrationUuid) {
        return finalMatch.teamAName || 'Team A';
      }
      if (winnerUuid === finalMatch.teamBRegistrationUuid) {
        return finalMatch.teamBName || 'Team B';
      }
    }

    if (winnerId) {
      const reg = registrations.find(
        (r) => r.registrationId === winnerId || r.id === winnerId
      );
      if (reg?.teamName) return reg.teamName;
      if (winnerId === finalMatch.teamARegistrationId) {
        return finalMatch.teamAName || 'Team A';
      }
      if (winnerId === finalMatch.teamBRegistrationId) {
        return finalMatch.teamBName || 'Team B';
      }
    }

    return null;
  }, [rootMatches, registrations]);

  // Group pool matches by pool name
  const groupedPools = useMemo(() => {
    const map = new Map<string, Match[]>();
    poolMatches.forEach((m) => {
      const pName = m.poolName || 'Pool Matches';
      if (!map.has(pName)) map.set(pName, []);
      map.get(pName)!.push(m);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [poolMatches]);

  if (!matches || matches.length === 0) return null;

  // ── Mobile-Safe Full Element Capture ──────────────────────────────────────
  const captureFullElement = async (el: HTMLElement): Promise<string> => {
    const savedStates: {
      el: HTMLElement;
      overflow: string;
      overflowX: string;
      overflowY: string;
      maxWidth: string;
      width: string;
      position: string;
    }[] = [];

    const allDescendants = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))];
    allDescendants.forEach((item) => {
      const style = window.getComputedStyle(item);
      const isScrollable =
        style.overflowX === 'auto' ||
        style.overflowX === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        item.scrollWidth > item.clientWidth;

      if (isScrollable) {
        savedStates.push({
          el: item,
          overflow: item.style.overflow,
          overflowX: item.style.overflowX,
          overflowY: item.style.overflowY,
          maxWidth: item.style.maxWidth,
          width: item.style.width,
          position: item.style.position,
        });

        item.style.overflow = 'visible';
        item.style.overflowX = 'visible';
        item.style.overflowY = 'visible';
        item.style.maxWidth = 'none';
        if (item.scrollWidth > 0) {
          item.style.width = `${Math.max(item.scrollWidth, item.offsetWidth)}px`;
        }
      }
    });

    const fullWidth = Math.max(el.scrollWidth, el.offsetWidth, 1100);
    const fullHeight = Math.max(el.scrollHeight, el.offsetHeight);

    try {
      const dataUrl = await htmlToImage.toPng(el, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        width: fullWidth,
        height: fullHeight,
        canvasWidth: fullWidth * 2,
        canvasHeight: fullHeight * 2,
        style: {
          padding: '24px',
          width: `${fullWidth}px`,
          height: 'auto',
          maxWidth: 'none',
          transform: 'none',
          boxSizing: 'border-box',
        },
      });
      return dataUrl;
    } finally {
      savedStates.forEach(({ el: item, overflow, overflowX, overflowY, maxWidth, width, position }) => {
        item.style.overflow = overflow;
        item.style.overflowX = overflowX;
        item.style.overflowY = overflowY;
        item.style.maxWidth = maxWidth;
        item.style.width = width;
        item.style.position = position;
      });
    }
  };

  const handleDownloadPng = async (elementId: string, label: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
      setDownloadingSection(`${elementId}-png`);
      const dataUrl = await captureFullElement(el);
      const link = document.createElement('a');
      link.download = `${tournamentName}-${label}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(`Failed to download PNG: ${label}`, err);
    } finally {
      setDownloadingSection(null);
    }
  };

  const handleDownloadPdf = async (elementId: string, label: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    try {
      setDownloadingSection(`${elementId}-pdf`);
      const dataUrl = await captureFullElement(el);

      const { jsPDF } = await import('jspdf');

      const imgEl = new window.Image();
      imgEl.src = dataUrl;
      await new Promise<void>((res) => {
        imgEl.onload = () => res();
      });

      const imgWidthPx = imgEl.width / 2;
      const imgHeightPx = imgEl.height / 2;

      const pxToMm = 0.264583;
      const imgWidthMm = imgWidthPx * pxToMm;
      const imgHeightMm = imgHeightPx * pxToMm;

      const isLandscape = imgWidthMm > imgHeightMm;
      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;

      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const scale = usableWidth / imgWidthMm;
      const finalW = usableWidth;
      const finalH = imgHeightMm * scale;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      if (finalH <= pageHeight - margin * 2) {
        const yOffset = (pageHeight - finalH) / 2;
        pdf.addImage(dataUrl, 'PNG', margin, yOffset, finalW, finalH);
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.width;
        canvas.height = imgEl.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imgEl, 0, 0);

        const usableHeightMm = pageHeight - margin * 2;
        const usableHeightPx = (usableHeightMm / pxToMm / scale) * 2;
        const sliceWidthPx = imgEl.width;
        let sliceTop = 0;
        let pageIndex = 0;

        while (sliceTop < imgEl.height) {
          const sliceH = Math.min(usableHeightPx, imgEl.height - sliceTop);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = sliceWidthPx;
          sliceCanvas.height = sliceH;
          const sliceCtx = sliceCanvas.getContext('2d')!;
          sliceCtx.drawImage(canvas, 0, sliceTop, sliceWidthPx, sliceH, 0, 0, sliceWidthPx, sliceH);

          const sliceDataUrl = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = (sliceH / 2) * pxToMm * scale;

          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(sliceDataUrl, 'PNG', margin, margin, finalW, sliceHeightMm);

          sliceTop += sliceH;
          pageIndex++;
        }
      }

      pdf.save(`${tournamentName}-${label}.pdf`);
    } catch (err) {
      console.error(`Failed to download PDF: ${label}`, err);
    } finally {
      setDownloadingSection(null);
    }
  };

  // ── Download Dropdown Menu Component ──────────────────────────────────────
  const DownloadDropdown = ({ elementId, label }: { elementId: string; label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isPngLoading = downloadingSection === `${elementId}-png`;
    const isPdfLoading = downloadingSection === `${elementId}-pdf`;
    const isLoading = isPngLoading || isPdfLoading;

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:bg-white/5 disabled:opacity-60 shrink-0"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
            color: 'var(--athlon-text-muted)',
          }}
          title={`Download ${label}`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <Download className="w-3.5 h-3.5 text-primary" />
          )}
          <span>Download</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false);
                handleDownloadPng(elementId, label);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-foreground hover:bg-white/5 hover:text-primary transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <FileImage className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span>Download PNG</span>
                <span className="text-[10px] text-foreground/40 font-medium">High Resolution Image</span>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                handleDownloadPdf(elementId, label);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-foreground hover:bg-white/5 hover:text-red-400 transition-all group"
            >
              <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span>Download PDF</span>
                <span className="text-[10px] text-foreground/40 font-medium">Print-Ready Document</span>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── Match Card ────────────────────────────────────────────────────────────
  const MatchCard = ({ match, isPlayoff = false }: { match: Match; isPlayoff?: boolean }) => {
    const teamA = registrations.find(
      (r) =>
        (match.teamARegistrationUuid &&
          (r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid)) ||
        (match.teamARegistrationId &&
          (r.registrationId === match.teamARegistrationId || r.id === match.teamARegistrationId))
    );
    const teamB = registrations.find(
      (r) =>
        (match.teamBRegistrationUuid &&
          (r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid)) ||
        (match.teamBRegistrationId &&
          (r.registrationId === match.teamBRegistrationId || r.id === match.teamBRegistrationId))
    );

    const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
    const isCompleted = match.status === 'COMPLETED';

    const teamAName =
      teamA?.teamName || match.teamAName || (match.teamARegistrationId || match.teamARegistrationUuid ? 'Team A' : 'TBD');
    const teamBName =
      teamB?.teamName || match.teamBName || (match.teamBRegistrationId || match.teamBRegistrationUuid ? 'Team B' : 'TBD');

    const isWinnerA =
      isCompleted &&
      ((match.winnerRegistrationUuid &&
        (match.winnerRegistrationUuid === match.teamARegistrationUuid ||
          (teamA && (match.winnerRegistrationUuid === teamA.registrationUuid || match.winnerRegistrationUuid === teamA.uuid)))) ||
        (match.winnerRegistrationId &&
          (match.winnerRegistrationId === match.teamARegistrationId ||
            (teamA && (match.winnerRegistrationId === teamA.registrationId || match.winnerRegistrationId === teamA.id)))));

    const isWinnerB =
      isCompleted &&
      ((match.winnerRegistrationUuid &&
        (match.winnerRegistrationUuid === match.teamBRegistrationUuid ||
          (teamB && (match.winnerRegistrationUuid === teamB.registrationUuid || match.winnerRegistrationUuid === teamB.uuid)))) ||
        (match.winnerRegistrationId &&
          (match.winnerRegistrationId === match.teamBRegistrationId ||
            (teamB && (match.winnerRegistrationId === teamB.registrationId || match.winnerRegistrationId === teamB.id)))));

    const isFinalMatch = !match.nextMatchUuid && isPlayoff;

    const roundTitle =
      match.roundName ||
      (isPlayoff
        ? isFinalMatch
          ? 'Championship Final'
          : 'Playoff Match'
        : match.poolName || 'Pool Match');

    const scheduledTimeStr = match.scheduledTime
      ? new Date(match.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : match.matchTime || null;

    const TeamRow = ({
      name,
      isWinner,
      isTbd,
    }: {
      name: string;
      isWinner: boolean;
      isTbd: boolean;
    }) => (
      <div
        className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all ${isWinner
          ? isFinalMatch
            ? 'bg-primary/20 border border-primary text-primary shadow-sm'
            : 'bg-primary/10 border border-primary/30 text-primary'
          : ''
          }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${isWinner
              ? 'bg-primary text-primary-foreground font-black shadow-sm'
              : 'bg-foreground/5 border border-foreground/10 text-foreground/70'
              }`}
          >
            {!isTbd ? name.charAt(0).toUpperCase() : '?'}
          </div>
          <span
            className={`text-xs truncate leading-tight ${isTbd
              ? 'italic text-foreground/35 font-medium'
              : isWinner
                ? 'font-black text-primary'
                : 'font-semibold text-foreground/75'
              }`}
          >
            {name}
          </span>
        </div>

        {isWinner && (
          isFinalMatch ? (
            <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm">
              <Crown className="w-3 h-3 fill-current" /> Winner
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5 shrink-0">
              <Trophy className="w-2.5 h-2.5 fill-primary" /> Win
            </span>
          )
        )}
      </div>
    );

    return (
      <div
        onClick={() =>
          onMatchClick
            ? onMatchClick(match)
            : router.push(`/scoring/${match.uuid}?tournamentType=${tournamentType || ''}`)
        }
        className={`group relative rounded-2xl border transition-all duration-200 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer overflow-hidden flex flex-col ${isFinalMatch && isCompleted ? 'border-primary/70 shadow-lg shadow-primary/10' : ''
          }`}
        style={{
          width: isPlayoff ? '260px' : '100%',
          backgroundColor: 'var(--athlon-card)',
          borderColor: isFinalMatch && isCompleted ? undefined : isLive ? 'rgba(239, 68, 68, 0.5)' : 'var(--athlon-border)',
        }}
      >
        {/* Top accent bar */}
        <div
          className={`h-[3px] w-full shrink-0 ${isLive
            ? 'bg-red-500 animate-pulse'
            : isCompleted
              ? 'bg-emerald-500'
              : isPlayoff
                ? 'bg-gradient-to-r from-emerald-500 via-primary to-teal-500'
                : 'bg-primary/40'
            }`}
        />

        <div className="p-3.5 space-y-2.5 flex flex-col flex-1">
          {/* Status header */}
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <span className={`font-black uppercase tracking-wider truncate max-w-[130px] ${isFinalMatch ? 'text-primary' : 'text-foreground/50'
              }`}>
              {roundTitle}
            </span>

            {isLive ? (
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-black tracking-widest flex items-center gap-1 shrink-0 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
              </span>
            ) : isCompleted ? (
              <span className="px-2 py-0.5 rounded-full font-black tracking-wider flex items-center gap-1 shrink-0 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-2.5 h-2.5" /> FINAL
              </span>
            ) : scheduledTimeStr ? (
              <span className="text-foreground/40 font-bold flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5" /> {scheduledTimeStr}
              </span>
            ) : (
              <span className="text-foreground/30 font-bold uppercase tracking-wider shrink-0 text-[9px]">UPCOMING</span>
            )}
          </div>

          {/* Teams box */}
          <div
            className="p-2 rounded-xl border space-y-1.5"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <TeamRow name={teamAName} isWinner={!!isWinnerA} isTbd={teamAName === 'TBD'} />
            <div className="h-px w-full bg-border/40" />
            <TeamRow name={teamBName} isWinner={!!isWinnerB} isTbd={teamBName === 'TBD'} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-0.5 text-[10px] mt-auto">
            <span className="text-foreground/40 font-bold text-[9px] uppercase tracking-wider">
              {isCompleted ? 'Match Result' : isLive ? 'Live Scoring' : 'View Details'}
            </span>
            <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ── Bracket Tree Node ─────────────────────────────────────────────────────
  const BracketNode = ({ match }: { match: Match }) => {
    const children = childrenMap.get(match.uuid) || [];
    children.sort((a, b) => (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0));
    const isRootMatch = !match.nextMatchUuid;

    return (
      <div className="flex items-center">
        {children.length > 0 && (
          <div className="flex flex-col justify-around h-full relative pr-10">
            {children.map((child) => (
              <BracketNode key={child.uuid} match={child} />
            ))}
            {/* Bracket connectors */}
            <div
              className="absolute right-0 top-[25%] bottom-[25%] w-5 border-r-2 border-t-2 border-b-2 rounded-r-xl pointer-events-none"
              style={{ borderColor: 'var(--athlon-border)' }}
            />
            <div
              className="absolute right-[-2.5rem] top-1/2 w-10 border-b-2 pointer-events-none"
              style={{ borderColor: 'var(--athlon-border)' }}
            />
          </div>
        )}

        <div className="pl-10 py-4 flex items-center">
          <MatchCard match={match} isPlayoff />

          {/* Connected Champion Trophy Box next to Final Match */}
          {isRootMatch && playoffChampion && (
            <div className="flex items-center pl-6 shrink-0 animate-in fade-in zoom-in-95 duration-200">
              <div
                className="w-8 border-b-2 relative"
                style={{ borderColor: 'var(--athlon-primary, #54AC68)' }}
              >
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-primary, #54AC68)' }}
                />
              </div>

              <div
                className="p-4 rounded-2xl border-2 shadow-xl flex items-center gap-3.5 w-64 shrink-0"
                style={{
                  borderColor: 'var(--athlon-primary, #54AC68)',
                  background: 'linear-gradient(135deg, var(--athlon-primary-glow, rgba(84,172,104,0.18)) 0%, var(--athlon-primary-soft, rgba(84,172,104,0.08)) 100%), var(--athlon-card)',
                  boxShadow: '0 10px 25px -5px var(--athlon-primary-glow, rgba(84,172,104,0.18))',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-lg shadow-primary/30 shrink-0">
                  <Trophy className="w-6 h-6 fill-current" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-current" /> Tournament Winner
                  </span>
                  <h4 className="text-sm font-black text-foreground truncate mt-0.5">
                    {playoffChampion}
                  </h4>
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
                    Champion 🏆
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Stage Toggle Bar ── */}
      {hasBothStages && (
        <div
          className="p-1.5 rounded-2xl border flex items-center gap-1.5 shadow-sm max-w-sm"
          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
        >
          {(
            [
              { key: 'all', icon: <Sparkles className="w-3.5 h-3.5" />, label: 'All Stages' },
              {
                key: 'playoffs',
                icon: <Trophy className="w-3.5 h-3.5 text-primary" />,
                label: `Playoffs (${playoffMatches.length})`,
              },
              {
                key: 'pools',
                icon: <Layers className="w-3.5 h-3.5" />,
                label: `Pools (${poolMatches.length})`,
              },
            ] as const
          ).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveStage(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeStage === key
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Playoff Championship Bracket ── */}
      {(activeStage === 'all' || activeStage === 'playoffs') && playoffMatches.length > 0 && (
        <div className="space-y-4">
          {/* Section header */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-black text-foreground">Playoff Championship Bracket</h4>
                <p className="text-[11px] text-foreground/50 font-medium">
                  Knockout fixtures for qualified pool qualifiers advancing to the title.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3" /> Knockout
              </span>
              <DownloadDropdown elementId="bracket-playoffs-area" label="playoffs" />
            </div>
          </div>

          {/* Champion Banner when final match is completed */}
          {playoffChampion && (
            <div
              className="p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-in fade-in duration-200"
              style={{
                borderColor: 'var(--athlon-primary, #54AC68)',
                background: 'linear-gradient(90deg, var(--athlon-primary-glow, rgba(84,172,104,0.18)) 0%, var(--athlon-primary-soft, rgba(84,172,104,0.08)) 50%, var(--athlon-surface) 100%)',
                boxShadow: '0 10px 30px -5px var(--athlon-primary-glow, rgba(84,172,104,0.18))',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-lg shadow-primary/30 shrink-0">
                  <Trophy className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-current" /> Tournament Champion
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground">{playoffChampion}</h3>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 fill-current" /> 1st Place Champion
                </span>
              </div> */}
            </div>
          )}

          {/* Capture zone */}
          <div
            id="bracket-playoffs-area"
            className="w-full rounded-2xl border p-6 overflow-x-auto shadow-inner custom-scrollbar"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex flex-col min-w-max p-2">
              {rootMatches.map((root) => (
                <div key={root.uuid} className="flex justify-start py-2">
                  <BracketNode match={root} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Round Robin Pool Fixtures ── */}
      {(activeStage === 'all' || activeStage === 'pools') && poolMatches.length > 0 && (
        <div className="space-y-4">
          {/* Section header */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-black text-foreground">Round Robin Pool Fixtures</h4>
                <p className="text-[11px] text-foreground/50 font-medium">
                  All pool matches — {poolsList.length} pool{poolsList.length !== 1 ? 's' : ''},{' '}
                  {poolMatches.length} matches total.
                </p>
              </div>
            </div>

            <DownloadDropdown elementId="bracket-pools-area" label="pool-fixtures" />
          </div>

          {/* Horizontal pool scroll — each pool is a vertical card column */}
          <div
            id="bracket-pools-area"
            className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {groupedPools.map(([poolName, pMatches]) => {
              const completedCount = pMatches.filter((m) => m.status === 'COMPLETED').length;
              const liveCount = pMatches.filter((m) => m.status === 'LIVE' || m.status === 'IN_PROGRESS').length;

              return (
                <div
                  key={poolName}
                  className="flex flex-col rounded-2xl border shadow-md shrink-0"
                  style={{
                    width: '300px',
                    scrollSnapAlign: 'start',
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Pool Header */}
                  <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: 'var(--athlon-border-subtle)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary font-black text-sm">
                          {poolName.replace(/[^A-Za-z0-9]/g, '').charAt(poolName.replace(/[^A-Za-z0-9]/g, '').length - 1) || poolName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-foreground">{poolName}</h5>
                        <p className="text-[10px] text-foreground/50 font-medium">
                          {pMatches.length} matches
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase">
                        {completedCount}/{pMatches.length} Done
                      </span>
                      {liveCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase animate-pulse">
                          {liveCount} LIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match list */}
                  <div className="flex flex-col gap-3 p-4">
                    {pMatches.map((match) => (
                      <MatchCard key={match.uuid || match.id} match={match} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pure Knockout Fallback ── */}
      {poolMatches.length === 0 && playoffMatches.length === 0 && (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between border-b pb-3"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-black text-foreground">Tournament Bracket</h4>
                <p className="text-[11px] text-foreground/50 font-medium">Knockout bracket — {matches.length} matches.</p>
              </div>
            </div>
            <DownloadDropdown elementId="bracket-capture-area" label="bracket" />
          </div>

          {/* Champion Banner for knockout tournament */}
          {playoffChampion && (
            <div
              className="p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-in fade-in duration-200"
              style={{
                borderColor: 'var(--athlon-primary, #54AC68)',
                background: 'linear-gradient(90deg, var(--athlon-primary-glow, rgba(84,172,104,0.18)) 0%, var(--athlon-primary-soft, rgba(84,172,104,0.08)) 50%, var(--athlon-surface) 100%)',
                boxShadow: '0 10px 30px -5px var(--athlon-primary-glow, rgba(84,172,104,0.18))',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-lg shadow-primary/30 shrink-0">
                  <Trophy className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-current" /> Official Tournament Champion
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground">{playoffChampion}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 fill-current" /> 1st Place Champion
                </span>
              </div>
            </div>
          )}

          <div
            id="bracket-capture-area"
            className="w-full rounded-2xl border p-6 overflow-x-auto shadow-inner custom-scrollbar"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex flex-col min-w-max p-2">
              {rootMatches.map((root) => (
                <div key={root.uuid} className="flex justify-start py-2">
                  <BracketNode match={root} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
