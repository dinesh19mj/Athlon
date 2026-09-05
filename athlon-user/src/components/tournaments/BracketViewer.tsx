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
  Swords,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as htmlToImage from 'html-to-image';
import { UserService } from '@/lib/api/user';
import { RegistrationPlayer } from '@/lib/api/tournaments';

interface BracketViewerProps {
  matches: Match[];
  registrations: Registration[];
  tournamentType?: string;
  tournamentName?: string;
  onMatchClick?: (match: Match) => void;
  playerPhotos?: Record<string, string>;
}

export const BracketViewer: React.FC<BracketViewerProps> = ({
  matches,
  registrations,
  tournamentType,
  tournamentName = 'tournament',
  onMatchClick,
  playerPhotos = {},
}) => {
  const router = useRouter();
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null);
  const [internalPhotos, setInternalPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const phonesToFetch: string[] = [];
      registrations.forEach((reg) => {
        reg.players?.forEach((p) => {
          if (p.phoneNumber && !playerPhotos?.[p.phoneNumber] && !internalPhotos[p.phoneNumber]) {
            phonesToFetch.push(p.phoneNumber);
          }
        });
      });

      if (phonesToFetch.length === 0) return;

      const newPhotos: Record<string, string> = {};
      await Promise.all(
        phonesToFetch.map(async (phone) => {
          try {
            const res = await UserService.getUserByPhone(phone);
            if (res?.data?.photo) {
              newPhotos[phone] = UserService.getPhotoUrl(res.data.photo);
            }
          } catch {
            // ignore
          }
        })
      );

      if (Object.keys(newPhotos).length > 0) {
        setInternalPhotos((prev) => ({ ...prev, ...newPhotos }));
      }
    };

    if (registrations.length > 0) {
      fetchPhotos();
    }
  }, [registrations, playerPhotos]);

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

  // Pool-wise active filter for Round Robin section
  const [selectedPoolFilter, setSelectedPoolFilter] = useState<string>('ALL');

  const getSafePoolId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  };

  const getPoolBadgeLabel = (name: string) => {
    const poolMatch = name.match(/Pool\s+([A-Za-z0-9]+)/i);
    if (poolMatch) return poolMatch[1].toUpperCase();
    const clean = name.trim();
    if (clean.length <= 4) return clean;
    const words = clean.split(/\s+/);
    if (words.length > 1) {
      return words.map((w) => w[0]).join('').substring(0, 3).toUpperCase();
    }
    return clean.substring(0, 3).toUpperCase();
  };

  const getPoolChampion = useCallback((rootMatch?: Match | null) => {
    if (!rootMatch || rootMatch.status !== 'COMPLETED') return null;
    const winnerUuid = rootMatch.winnerRegistrationUuid;
    const winnerId = rootMatch.winnerRegistrationId;

    if (winnerUuid) {
      const reg = registrations.find(
        (r) => r.registrationUuid === winnerUuid || r.uuid === winnerUuid
      );
      if (reg?.teamName) return reg.teamName;
      if (winnerUuid === rootMatch.teamARegistrationUuid) return rootMatch.teamAName || 'Team A';
      if (winnerUuid === rootMatch.teamBRegistrationUuid) return rootMatch.teamBName || 'Team B';
    }
    if (winnerId) {
      const reg = registrations.find(
        (r) => r.registrationId === winnerId || r.id === winnerId
      );
      if (reg?.teamName) return reg.teamName;
      if (winnerId === rootMatch.teamARegistrationId) return rootMatch.teamAName || 'Team A';
      if (winnerId === rootMatch.teamBRegistrationId) return rootMatch.teamBName || 'Team B';
    }
    return null;
  }, [registrations]);

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

  // State to force-render all pools during 'Download All' capture
  const [isCapturingAll, setIsCapturingAll] = useState(false);

  // ── Mobile-Safe Full Element Capture ──────────────────────────────────────
  const captureFullElement = async (el: HTMLElement): Promise<string> => {
    const savedStates: {
      el: HTMLElement;
      overflow: string;
      overflowX: string;
      overflowY: string;
      maxWidth: string;
      width: string;
      minWidth: string;
      position: string;
    }[] = [];

    const allDescendants = [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))];

    // Find the true maximum content width across all descendants to avoid clipping wide trees
    let maxContentWidth = Math.max(el.scrollWidth, el.offsetWidth, el.clientWidth);
    allDescendants.forEach((item) => {
      if (item.scrollWidth > maxContentWidth) {
        maxContentWidth = item.scrollWidth;
      }
      if (item.offsetWidth > maxContentWidth) {
        maxContentWidth = item.offsetWidth;
      }
    });

    const targetWidth = Math.max(maxContentWidth, 680);

    // Expand all scrollable containers so horizontal tree lines & cards are fully visible
    allDescendants.forEach((item) => {
      const style = window.getComputedStyle(item);
      const isScrollable =
        style.overflowX === 'auto' ||
        style.overflowX === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowX === 'hidden' ||
        item.scrollWidth > item.clientWidth;

      if (isScrollable) {
        savedStates.push({
          el: item,
          overflow: item.style.overflow,
          overflowX: item.style.overflowX,
          overflowY: item.style.overflowY,
          maxWidth: item.style.maxWidth,
          width: item.style.width,
          minWidth: item.style.minWidth,
          position: item.style.position,
        });

        item.style.overflow = 'visible';
        item.style.overflowX = 'visible';
        item.style.overflowY = 'visible';
        item.style.maxWidth = 'none';
      }
    });

    // Save and expand the root captured element
    savedStates.push({
      el,
      overflow: el.style.overflow,
      overflowX: el.style.overflowX,
      overflowY: el.style.overflowY,
      maxWidth: el.style.maxWidth,
      width: el.style.width,
      minWidth: el.style.minWidth,
      position: el.style.position,
    });

    el.style.width = `${targetWidth}px`;
    el.style.minWidth = `${targetWidth}px`;
    el.style.maxWidth = 'none';
    el.style.overflow = 'visible';

    // Allow DOM to reflow before capturing canvas
    await new Promise((r) => setTimeout(r, 80));

    try {
      const dataUrl = await htmlToImage.toPng(el, {
        backgroundColor: '#0c0f17',
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.getAttribute('data-no-export') === 'true') return false;
            if (node.classList?.contains('z-50')) return false;
            // Filter out download buttons during image capture
            if (node.dataset?.downloadBtn === 'true' || node.closest('[data-download-btn="true"]')) {
              return false;
            }
          }
          return true;
        },
        style: {
          width: `${targetWidth}px`,
          minWidth: `${targetWidth}px`,
          maxWidth: 'none',
          height: 'auto',
          boxSizing: 'border-box',
          margin: '0',
        },
      });
      return dataUrl;
    } finally {
      // Restore all original styles in reverse order
      savedStates.reverse().forEach(({ el: item, overflow, overflowX, overflowY, maxWidth, width, minWidth, position }) => {
        item.style.overflow = overflow;
        item.style.overflowX = overflowX;
        item.style.overflowY = overflowY;
        item.style.maxWidth = maxWidth;
        item.style.width = width;
        item.style.minWidth = minWidth;
        item.style.position = position;
      });
    }
  };

  const handleDownloadPng = async (elementId: string, label: string) => {
    try {
      setDownloadingSection(`${elementId}-png`);
      if (elementId === 'bracket-pools-area') {
        setIsCapturingAll(true);
        await new Promise((r) => setTimeout(r, 120));
      }

      const el = document.getElementById(elementId);
      if (!el) return;

      const dataUrl = await captureFullElement(el);
      const link = document.createElement('a');
      link.download = `${tournamentName}-${label}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(`Failed to download PNG: ${label}`, err);
    } finally {
      setIsCapturingAll(false);
      setDownloadingSection(null);
    }
  };

  const handleDownloadPdf = async (elementId: string, label: string) => {
    try {
      setDownloadingSection(`${elementId}-pdf`);
      if (elementId === 'bracket-pools-area') {
        setIsCapturingAll(true);
        await new Promise((r) => setTimeout(r, 120));
      }

      const el = document.getElementById(elementId);
      if (!el) return;

      const dataUrl = await captureFullElement(el);
      const { jsPDF } = await import('jspdf');

      const imgEl = new window.Image();
      imgEl.src = dataUrl;
      await new Promise<void>((res) => {
        imgEl.onload = () => res();
      });

      const pxToMm = 0.264583;
      // Dimensions at 1x resolution (image is captured at 2x)
      const imgWidthMm = (imgEl.width / 2) * pxToMm;
      const imgHeightMm = (imgEl.height / 2) * pxToMm;

      const isLandscape = imgWidthMm >= imgHeightMm;
      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;

      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const scaleW = usableWidth / imgWidthMm;

      // If card/bracket fits nicely on a single page by width scaling
      if (imgHeightMm * scaleW <= usableHeight) {
        const finalW = usableWidth;
        const finalH = imgHeightMm * scaleW;
        const yOffset = margin + (usableHeight - finalH) / 2;
        pdf.addImage(dataUrl, 'PNG', margin, yOffset, finalW, finalH);
      } else if (imgHeightMm * scaleW <= usableHeight * 1.2) {
        // Slightly taller than 1 page: scale down slightly to fit on 1 complete page
        const fitScale = usableHeight / imgHeightMm;
        const finalW = imgWidthMm * fitScale;
        const finalH = usableHeight;
        const xOffset = margin + (usableWidth - finalW) / 2;
        pdf.addImage(dataUrl, 'PNG', xOffset, margin, finalW, finalH);
      } else {
        // Multi-page slicing for large multi-pool collections
        const finalW = usableWidth;
        const usableHeightPx = (usableHeight / pxToMm / scaleW) * 2;

        const canvas = document.createElement('canvas');
        canvas.width = imgEl.width;
        canvas.height = imgEl.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(imgEl, 0, 0);

        let sliceTop = 0;
        let pageIndex = 0;

        while (sliceTop < imgEl.height) {
          const sliceH = Math.min(usableHeightPx, imgEl.height - sliceTop);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = imgEl.width;
          sliceCanvas.height = sliceH;
          const sliceCtx = sliceCanvas.getContext('2d')!;
          sliceCtx.drawImage(canvas, 0, sliceTop, imgEl.width, sliceH, 0, 0, imgEl.width, sliceH);

          const sliceDataUrl = sliceCanvas.toDataURL('image/png');
          const sliceHeightMm = (sliceH / 2) * pxToMm * scaleW;

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
      setIsCapturingAll(false);
      setDownloadingSection(null);
    }
  };

  // ── Download Dropdown Menu Component ──────────────────────────────────────
  const DownloadDropdown = ({
    elementId,
    label,
    size = 'default',
    title = 'Download',
  }: {
    elementId: string;
    label: string;
    size?: 'default' | 'sm';
    title?: string;
  }) => {
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

    const isSmall = size === 'sm';

    return (
      <div className="relative inline-block" ref={dropdownRef} data-download-btn="true" data-no-export="true">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isLoading}
          data-download-btn="true"
          className={`flex items-center gap-1.5 font-bold transition-all hover:bg-white/5 disabled:opacity-60 shrink-0 ${
            isSmall
              ? 'px-2.5 py-1 text-[11px] rounded-lg border'
              : 'px-3 py-1.5 text-xs rounded-xl border'
          }`}
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
            color: 'var(--athlon-text-muted)',
          }}
          title={`Download ${label}`}
        >
          {isLoading ? (
            <Loader2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} animate-spin text-primary`} />
          ) : (
            <Download className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-primary`} />
          )}
          <span>{title}</span>
          <ChevronDown className={`${isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'} opacity-60`} />
        </button>

        {isOpen && (
          <div
            data-no-export="true"
            className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <button
              type="button"
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
              type="button"
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
      ? new Date(match.scheduledTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : match.matchTime || null;

    const TeamAvatar = ({
      team,
      fallbackName,
      isWinner,
      isTbd,
    }: {
      team?: Registration;
      fallbackName: string;
      isWinner: boolean;
      isTbd: boolean;
    }) => {
      if (isTbd) {
        return (
          <div className="w-6 h-6 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center font-bold text-[10px] text-foreground/40 shrink-0">
            ?
          </div>
        );
      }

      const allPhotos = { ...internalPhotos, ...(playerPhotos || {}) };

      const getPlayerPhoto = (p?: RegistrationPlayer): string | null => {
        if (!p) return null;
        const direct = p.photo || p.photoUrl || p.avatar || p.profilePic || p.userPhoto || (p as any).image;
        if (direct) {
          return direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/')
            ? direct
            : UserService.getPhotoUrl(direct);
        }
        if (p.phoneNumber && allPhotos[p.phoneNumber]) {
          return allPhotos[p.phoneNumber];
        }
        return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName || fallbackName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
      };

      const players = team?.players || [];

      // Check for dual photos if doubles (2 players)
      if (players.length >= 2) {
        const p1Url = getPlayerPhoto(players[0]);
        const p2Url = getPlayerPhoto(players[1]);

        return (
          <div className="relative w-8 h-6 flex items-center shrink-0">
            {p1Url ? (
              <img
                src={p1Url}
                alt={players[0]?.playerName || 'Player 1'}
                className="w-5 h-5 rounded-full object-cover border-2 border-[var(--athlon-card)] shadow-sm shrink-0 z-10"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[8.5px] font-black shrink-0 z-10">
                {players[0]?.playerName?.charAt(0).toUpperCase() || fallbackName.charAt(0).toUpperCase()}
              </div>
            )}
            {p2Url ? (
              <img
                src={p2Url}
                alt={players[1]?.playerName || 'Player 2'}
                className="w-5 h-5 rounded-full object-cover border-2 border-[var(--athlon-card)] shadow-sm shrink-0 -ml-2"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[8.5px] font-black shrink-0 -ml-2">
                {players[1]?.playerName?.charAt(0).toUpperCase() || 'P'}
              </div>
            )}
          </div>
        );
      }

      // Single player
      if (players.length === 1) {
        const pUrl = getPlayerPhoto(players[0]);
        if (pUrl) {
          return (
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/20 shadow-sm">
              <img
                src={pUrl}
                alt={players[0]?.playerName || fallbackName}
                className="w-full h-full object-cover"
              />
            </div>
          );
        }
      }

      // Single player photo or team photo
      const directTeamPhoto = (team as any)?.photo || (team as any)?.teamLogo || (team as any)?.logo;
      const teamPhotoUrl = directTeamPhoto
        ? directTeamPhoto.startsWith('http') || directTeamPhoto.startsWith('data:') || directTeamPhoto.startsWith('/')
          ? directTeamPhoto
          : UserService.getPhotoUrl(directTeamPhoto)
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;

      return (
        <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/20 shadow-sm">
          <img
            src={teamPhotoUrl}
            alt={fallbackName}
            className="w-full h-full object-cover"
          />
        </div>
      );
    };

    const TeamRow = ({
      name,
      team,
      isWinner,
      isTbd,
    }: {
      name: string;
      team?: Registration;
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
          <TeamAvatar
            team={team}
            fallbackName={name}
            isWinner={isWinner}
            isTbd={isTbd}
          />
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
            <TeamRow name={teamAName} team={teamA} isWinner={!!isWinnerA} isTbd={teamAName === 'TBD'} />
            <div className="h-px w-full bg-border/40" />
            <TeamRow name={teamBName} team={teamB} isWinner={!!isWinnerB} isTbd={teamBName === 'TBD'} />
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
  const BracketNode = ({
    match,
    customChildrenMap,
    poolChampion,
  }: {
    match: Match;
    customChildrenMap?: Map<string, Match[]>;
    poolChampion?: string | null;
  }) => {
    const mapToUse = customChildrenMap || childrenMap;
    const children = mapToUse.get(match.uuid) || [];
    children.sort((a, b) => (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0));
    const isRootMatch = !match.nextMatchUuid || (customChildrenMap && !Array.from(customChildrenMap.values()).flat().some((m) => m.uuid === match.uuid && m.nextMatchUuid));

    const champToShow = poolChampion || (isRootMatch ? playoffChampion : null);

    return (
      <div className="flex items-center">
        {children.length > 0 && (
          <div className="flex flex-col justify-around h-full relative pr-10">
            {children.map((child) => (
              <BracketNode
                key={child.uuid}
                match={child}
                customChildrenMap={customChildrenMap}
                poolChampion={poolChampion}
              />
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
          {isRootMatch && champToShow && (
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
                    <Crown className="w-3.5 h-3.5 fill-current" /> Winner
                  </span>
                  <h4 className="text-sm font-black text-foreground truncate mt-0.5">
                    {champToShow}
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

      {/* ── Round Robin & Category Bracket Fixtures ── */}
      {(activeStage === 'all' || activeStage === 'pools') && poolMatches.length > 0 && (
        <div className="space-y-4">
          {/* Section header */}
          <div
            className="flex items-center justify-between gap-3 border-b pb-3"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-black text-foreground truncate">Category Pool & Draw Fixtures</h4>
                <p className="text-[11px] text-foreground/50 font-medium">
                  {poolsList.length} category pool{poolsList.length !== 1 ? 's' : ''},{' '}
                  {poolMatches.length} matches total.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <DownloadDropdown elementId="bracket-pools-area" label="all-pools-fixtures" title="Download All" />
            </div>
          </div>

          {/* Pool Selection Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            <button
              type="button"
              onClick={() => setSelectedPoolFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 ${
                selectedPoolFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20 ring-1 ring-primary/40'
                  : 'bg-surface border border-border text-foreground/70 hover:text-foreground'
              }`}
            >
              All Categories ({groupedPools.length})
            </button>
            {groupedPools.map(([poolName, pMatches]) => {
              const isSelected = selectedPoolFilter === poolName;
              const completedCount = pMatches.filter((m) => m.status === 'COMPLETED').length;
              return (
                <button
                  key={poolName}
                  type="button"
                  onClick={() => setSelectedPoolFilter(poolName)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20 ring-1 ring-primary/40'
                      : 'bg-surface border border-border text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <span>{poolName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-foreground/10 text-foreground/60'
                    }`}
                  >
                    {completedCount}/{pMatches.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category / Pool Fixture Cards */}
          <div
            id="bracket-pools-area"
            className="space-y-6"
          >
            {groupedPools
              .filter(([poolName]) => isCapturingAll || selectedPoolFilter === 'ALL' || selectedPoolFilter === poolName)
              .map(([poolName, pMatches]) => {
                const completedCount = pMatches.filter((m) => m.status === 'COMPLETED').length;
                const liveCount = pMatches.filter((m) => m.status === 'LIVE' || m.status === 'IN_PROGRESS').length;
                const safePoolId = getSafePoolId(poolName);

                // Build category-specific adjacency tree
                const poolMap = new Map(pMatches.map((m) => [m.uuid, m]));
                const poolChildMap = new Map<string, Match[]>();
                pMatches.forEach((m) => {
                  if (m.nextMatchUuid && poolMap.has(m.nextMatchUuid)) {
                    if (!poolChildMap.has(m.nextMatchUuid)) poolChildMap.set(m.nextMatchUuid, []);
                    poolChildMap.get(m.nextMatchUuid)!.push(m);
                  }
                });
                const poolRoots = pMatches.filter((m) => !m.nextMatchUuid || !poolMap.has(m.nextMatchUuid));
                const hasTree = poolChildMap.size > 0;
                const poolChampion = poolRoots.length === 1 ? getPoolChampion(poolRoots[0]) : null;

                return (
                  <div
                    key={poolName}
                    id={`bracket-pool-${safePoolId}`}
                    className="flex flex-col rounded-2xl border shadow-sm transition-all overflow-hidden"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* Pool Header */}
                    <div
                      className="flex items-center justify-between p-4 border-b gap-3"
                      style={{
                        borderColor: 'var(--athlon-border-subtle)',
                        backgroundColor: 'var(--athlon-surface-elevated, var(--athlon-surface))',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-primary font-black text-xs">
                            {getPoolBadgeLabel(poolName)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-black text-foreground truncate">{poolName}</h5>
                            {hasTree && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9.5px] font-mono font-bold">
                                Draw Bracket
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-foreground/50 font-medium">
                            {pMatches.length} matches • {completedCount}/{pMatches.length} completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-auto">
                        {liveCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[9.5px] font-black uppercase animate-pulse">
                            {liveCount} LIVE
                          </span>
                        )}
                        <DownloadDropdown
                          elementId={`bracket-pool-${safePoolId}`}
                          label={`${safePoolId}-bracket`}
                          size="sm"
                          title="Download"
                        />
                      </div>
                    </div>

                    {/* Bracket Tree (Default) or Match List */}
                    {hasTree ? (
                      <div className="p-4 sm:p-6 overflow-x-auto custom-scrollbar bg-background/50 border-t border-border/40">
                        <div className="flex flex-col min-w-max p-2">
                          {poolRoots.map((root) => (
                            <div key={root.uuid} className="flex justify-start py-2">
                              <BracketNode
                                match={root}
                                customChildrenMap={poolChildMap}
                                poolChampion={poolChampion}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 p-4">
                        {pMatches.map((match, idx) => (
                          <div key={match.uuid || match.id} className="space-y-1">
                            <div className="flex items-center justify-between px-1 text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                              <span>Match #{idx + 1}</span>
                              {match.scheduledTime && (
                                <span className="font-mono text-primary/70">
                                  {new Date(match.scheduledTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                              )}
                            </div>
                            <MatchCard match={match} />
                          </div>
                        ))}
                      </div>
                    )}
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
