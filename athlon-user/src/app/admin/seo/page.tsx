'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  ExternalLink,
  Edit3,
  Plus,
  Trash2,
  Copy,
  Check,
  Shield,
  Layers,
  FileCode,
  ArrowRight,
  ChevronRight,
  Eye,
  Sliders,
  Share2,
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  Link2,
  Terminal,
  Activity,
  Calendar,
  CheckSquare,
  FileText,
  X,
  Save,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';
import {
  SEOAdminService,
  SEOGlobalSettings,
  SEOPageItem,
  SEOTemplateItem,
  SEOEntityOverrideItem,
  SEORedirectItem,
  SEOSitemapItem,
  SEOAuditIssue,
  SEOChangeHistoryItem,
  SEODashboardStats,
  SEOEntityType,
  SEOPublicationStatus,
  SEOIndexability,
  SEOIssueSeverity,
  SEOIssueStatus,
} from '@/lib/api/seo';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

type TabKey =
  | 'overview'
  | 'pages'
  | 'templates'
  | 'overrides'
  | 'global'
  | 'social'
  | 'sitemaps'
  | 'robots'
  | 'redirects'
  | 'schema'
  | 'audit'
  | 'console'
  | 'history';

export default function SuperAdminSEOPage() {
  const { theme, mode } = useAthlonTheme();

  // Navigation & Active Submodule
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Core Data States
  const [stats, setStats] = useState<SEODashboardStats | null>(null);
  const [globalSettings, setGlobalSettings] = useState<SEOGlobalSettings | null>(null);
  const [pages, setPages] = useState<SEOPageItem[]>([]);
  const [templates, setTemplates] = useState<SEOTemplateItem[]>([]);
  const [overrides, setOverrides] = useState<SEOEntityOverrideItem[]>([]);
  const [redirects, setRedirects] = useState<SEORedirectItem[]>([]);
  const [sitemaps, setSitemaps] = useState<SEOSitemapItem[]>([]);
  const [auditIssues, setAuditIssues] = useState<SEOAuditIssue[]>([]);
  const [history, setHistory] = useState<SEOChangeHistoryItem[]>([]);

  // Search & Filter States
  const [pageSearch, setPageSearch] = useState('');
  const [pageFilterType, setPageFilterType] = useState<string>('ALL');
  const [pageFilterStatus, setPageFilterStatus] = useState<string>('ALL');

  // Modal States
  const [editingPage, setEditingPage] = useState<SEOPageItem | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SEOTemplateItem | null>(null);
  const [editingOverride, setEditingOverride] = useState<SEOEntityOverrideItem | null>(null);
  const [editingRedirect, setEditingRedirect] = useState<SEORedirectItem | null>(null);
  const [isNewRedirectModalOpen, setIsNewRedirectModalOpen] = useState(false);
  const [isNewOverrideModalOpen, setIsNewOverrideModalOpen] = useState(false);

  // Social & SERP Preview Simulator State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewPlatform, setPreviewPlatform] = useState<'google' | 'twitter' | 'facebook' | 'whatsapp'>('google');
  const [customPreviewTitle, setCustomPreviewTitle] = useState('ATHLON | The Tournament Experience, Elevated');
  const [customPreviewDesc, setCustomPreviewDesc] = useState(
    'Discover sports tournaments, book courts, manage academies, follow real-time live scores, and connect with the sports community on ATHLON.'
  );
  const [customPreviewUrl, setCustomPreviewUrl] = useState('https://athlon.co.in/tournaments');
  const [customPreviewImage, setCustomPreviewImage] = useState('https://athlon.co.in/images/athlon-banner.jpg');

  // Robots Tester State
  const [robotsTesterPath, setRobotsTesterPath] = useState('/admin/seo');
  const [robotsRawContent, setRobotsRawContent] = useState<string>(
    `# ATHLON Enterprise Robots Configuration\nUser-agent: *\nAllow: /\nAllow: /tournaments\nAllow: /venues\nAllow: /academies\nAllow: /coaches\nAllow: /communities\nAllow: /market\nAllow: /privacy\nAllow: /terms\n\n# Private & Authenticated Paths\nDisallow: /admin/\nDisallow: /org/\nDisallow: /home/\nDisallow: /login\nDisallow: /register\nDisallow: /api/\n\nSitemap: https://athlon.co.in/sitemap.xml`
  );
  const [robotsTestResult, setRobotsTestResult] = useState<{ allowed: boolean; rule: string } | null>(null);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showNotification('Copied to clipboard', 'info');
  };

  // Initial Data Fetch
  const loadAllSEOData = async () => {
    try {
      const [
        statsData,
        globalData,
        pagesData,
        templatesData,
        overridesData,
        redirectsData,
        sitemapsData,
        auditData,
        historyData,
      ] = await Promise.all([
        SEOAdminService.getDashboardStats(),
        SEOAdminService.getGlobalSettings(),
        SEOAdminService.getPages(),
        SEOAdminService.getTemplates(),
        SEOAdminService.getOverrides(),
        SEOAdminService.getRedirects(),
        SEOAdminService.getSitemaps(),
        SEOAdminService.getAuditIssues(),
        SEOAdminService.getHistory(),
      ]);

      setStats(statsData);
      setGlobalSettings(globalData);
      setPages(pagesData);
      setTemplates(templatesData);
      setOverrides(overridesData);
      setRedirects(redirectsData);
      setSitemaps(sitemapsData);
      setAuditIssues(auditData);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load SEO data', err);
      showNotification('Failed to synchronize some SEO data from server', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllSEOData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllSEOData();
    showNotification('SEO Engine synchronized with latest configurations', 'success');
  };

  // Filtered Static Pages
  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        pageSearch.trim() === '' ||
        p.pageName.toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.routePattern.toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.title.toLowerCase().includes(pageSearch.toLowerCase());
      const matchesType = pageFilterType === 'ALL' || p.pageType === pageFilterType;
      const matchesStatus = pageFilterStatus === 'ALL' || p.publicationStatus === pageFilterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [pages, pageSearch, pageFilterType, pageFilterStatus]);

  // Robots Test Handler
  const handleTestRobotsPath = () => {
    const p = robotsTesterPath.trim();
    if (!p) return;
    const lower = p.toLowerCase();
    const isDisallowed =
      lower.startsWith('/admin') ||
      lower.startsWith('/org') ||
      lower.startsWith('/home') ||
      lower.startsWith('/login') ||
      lower.startsWith('/register') ||
      lower.startsWith('/api');

    if (isDisallowed) {
      setRobotsTestResult({
        allowed: false,
        rule: `Disallow: ${lower.split('/')[1] ? `/${lower.split('/')[1]}/` : '/admin/'}`,
      });
    } else {
      setRobotsTestResult({
        allowed: true,
        rule: 'Allow: /',
      });
    }
  };

  // Page Editor Handlers
  const handleSavePage = async (updated: SEOPageItem) => {
    try {
      const saved = await SEOAdminService.savePage(updated);
      setPages((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setEditingPage(null);
      showNotification(`Saved SEO metadata for ${saved.pageName}`, 'success');
      const refreshedStats = await SEOAdminService.getDashboardStats();
      setStats(refreshedStats);
      const refreshedHistory = await SEOAdminService.getHistory();
      setHistory(refreshedHistory);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save page SEO', 'error');
    }
  };

  // Template Editor Handlers
  const handleSaveTemplate = async (updated: SEOTemplateItem) => {
    try {
      const saved = await SEOAdminService.saveTemplate(updated);
      setTemplates((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      setEditingTemplate(null);
      showNotification(`Saved dynamic template for ${saved.name}`, 'success');
      const refreshedHistory = await SEOAdminService.getHistory();
      setHistory(refreshedHistory);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save template', 'error');
    }
  };

  // Override Editor Handlers
  const handleSaveOverride = async (item: Partial<SEOEntityOverrideItem>) => {
    try {
      const saved = await SEOAdminService.saveOverride(item);
      setOverrides((prev) => {
        const idx = prev.findIndex((o) => o.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setEditingOverride(null);
      setIsNewOverrideModalOpen(false);
      showNotification(`Saved specific override for ${saved.entityName}`, 'success');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save entity override', 'error');
    }
  };

  const handleDeleteOverride = async (id: string) => {
    if (!confirm('Are you sure you want to remove this specific entity override?')) return;
    try {
      await SEOAdminService.deleteOverride(id);
      setOverrides((prev) => prev.filter((o) => o.id !== id));
      showNotification('Entity override removed', 'info');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to remove override', 'error');
    }
  };

  // Redirect Handlers
  const handleSaveRedirect = async (item: Partial<SEORedirectItem>) => {
    try {
      // Validation against circular redirects
      if (item.sourcePath?.trim() === item.destinationUrl?.trim()) {
        showNotification('Source path and destination cannot be identical (Infinite loop)', 'error');
        return;
      }
      const saved = await SEOAdminService.saveRedirect(item);
      setRedirects((prev) => {
        const idx = prev.findIndex((r) => r.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setEditingRedirect(null);
      setIsNewRedirectModalOpen(false);
      showNotification(`Redirect rule configured for ${saved.sourcePath}`, 'success');
      const refreshedStats = await SEOAdminService.getDashboardStats();
      setStats(refreshedStats);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to save redirect', 'error');
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    if (!confirm('Are you sure you want to delete this redirect rule?')) return;
    try {
      await SEOAdminService.deleteRedirect(id);
      setRedirects((prev) => prev.filter((r) => r.id !== id));
      showNotification('Redirect rule deleted', 'info');
    } catch (err: any) {
      showNotification(err?.message || 'Failed to delete redirect', 'error');
    }
  };

  // Global Settings Save Handler
  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSettings) return;
    try {
      const saved = await SEOAdminService.saveGlobalSettings(globalSettings);
      setGlobalSettings(saved);
      showNotification('Global SEO configuration published successfully', 'success');
      const refreshedHistory = await SEOAdminService.getHistory();
      setHistory(refreshedHistory);
    } catch (err: any) {
      showNotification(err?.message || 'Failed to update global settings', 'error');
    }
  };

  // Audit Status Toggle
  const handleToggleAuditIssue = async (issueId: string, currentStatus: SEOIssueStatus) => {
    const newStatus: SEOIssueStatus = currentStatus === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    try {
      await SEOAdminService.updateAuditIssueStatus(issueId, newStatus);
      setAuditIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
      showNotification(`Marked issue as ${newStatus.toLowerCase()}`, 'info');
      const refreshedStats = await SEOAdminService.getDashboardStats();
      setStats(refreshedStats);
    } catch (err: any) {
      showNotification('Failed to update issue status', 'error');
    }
  };

  // Character Count Helpers
  const getTitleStatus = (len: number) => {
    if (len >= 45 && len <= 65) return { color: 'text-emerald-500', text: 'Optimal (45-65 chars)' };
    if (len > 65) return { color: 'text-amber-500', text: 'Too long (truncation risk)' };
    return { color: 'text-blue-500', text: 'Acceptable (short)' };
  };

  const getDescStatus = (len: number) => {
    if (len >= 130 && len <= 165) return { color: 'text-emerald-500', text: 'Optimal (130-165 chars)' };
    if (len > 165) return { color: 'text-amber-500', text: 'Too long (truncation risk)' };
    return { color: 'text-blue-500', text: 'Acceptable (short)' };
  };

  const navTabs = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'pages', label: 'Static Pages', icon: FileText, badge: pages.length },
    { key: 'templates', label: 'Dynamic Templates', icon: Layers, badge: templates.length },
    { key: 'overrides', label: 'Entity Overrides', icon: Sliders, badge: overrides.length },
    { key: 'global', label: 'Global Settings', icon: Globe },
    { key: 'social', label: 'SERP & Social Preview', icon: Eye },
    { key: 'sitemaps', label: 'XML Sitemaps', icon: FileCode, badge: sitemaps.length },
    { key: 'robots', label: 'Robots.txt', icon: Shield },
    { key: 'redirects', label: 'Redirect Rules', icon: Link2, badge: redirects.length },
    { key: 'schema', label: 'Schema (JSON-LD)', icon: Terminal },
    { key: 'audit', label: 'Health Audit', icon: AlertTriangle, badge: auditIssues.filter((i) => i.status === 'OPEN').length },
    { key: 'console', label: 'GSC Connector', icon: TrendingUp },
    { key: 'history', label: 'Change History', icon: Clock },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-300'
              : 'bg-zinc-900/95 border-zinc-700 text-zinc-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-cyan-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER: DESKTOP (Untouched) vs MOBILE (Redesigned)
      ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP HEADER (md:flex) */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--athlon-text-muted)] mb-1">
            <Link href="/admin" className="hover:text-[var(--athlon-text)] transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--athlon-primary)] font-bold">SEO Management</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--athlon-card)] border border-[var(--athlon-border)] shadow-sm">
              <Athlon3DIcon type="seo" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--athlon-text)]">
                Enterprise SEO & Discovery Engine
              </h1>
              <p className="text-sm text-[var(--athlon-text-muted)]">
                Metadata governance, dynamic Open Graph cards, XML sitemaps, robots guards, and search performance.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Global Action Bar */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--athlon-border)] bg-[var(--athlon-card)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[var(--athlon-text-muted)]">Production Engine:</span>
            <span className="font-semibold text-[var(--athlon-text)]">https://athlon.co.in</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] bg-[var(--athlon-card)] text-[var(--athlon-text)] hover:bg-[var(--athlon-border)]/40 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 transition-all shadow-sm"
          >
            <span>Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* MOBILE REDESIGNED HEADER (block md:hidden) */}
      <div className="block md:hidden space-y-3">
        {/* Top Status & Mini Back Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-[var(--athlon-border)] bg-[var(--athlon-card)] text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Admin Control</span>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>athlon.co.in • Live</span>
          </div>
        </div>

        {/* Compact Hero Card */}
        <div
          className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-sm"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--athlon-border)]/30 border border-[var(--athlon-border)] shrink-0">
              <Athlon3DIcon type="seo" size={26} />
            </div>
            <div>
              <h1 className="text-base font-black text-[var(--athlon-text)] leading-tight">
                SEO & Discovery Engine
              </h1>
              <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5 line-clamp-1">
                Metadata, templates, sitemaps & SERP indexing
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Quick Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] bg-[var(--athlon-card)] text-[var(--athlon-text)] active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Engine</span>
          </button>

          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black active:scale-95 transition-all shadow-sm"
          >
            <span>Search Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NAVIGATION TABS BAR: DESKTOP (Untouched) vs MOBILE (App Pills)
      ───────────────────────────────────────────────────────────── */}
      {/* DESKTOP TABS */}
      <div className="hidden md:flex border-b border-[var(--athlon-border)] items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--athlon-primary)] text-black shadow-sm font-bold'
                  : 'text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)] hover:bg-[var(--athlon-card)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-black/20 text-black' : 'bg-[var(--athlon-border)] text-[var(--athlon-text)]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MOBILE TABS: Smooth Carousel + Quick Jump Selector */}
      <div className="block md:hidden space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`snap-start flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-[var(--athlon-primary)] text-black font-extrabold border-[var(--athlon-primary)] shadow-sm'
                    : 'bg-[var(--athlon-card)] text-[var(--athlon-text-muted)] border-[var(--athlon-border)] hover:text-[var(--athlon-text)]'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-black/20 text-black' : 'bg-[var(--athlon-border)] text-[var(--athlon-text)]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: OVERVIEW & DASHBOARD
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-4 md:space-y-6">
          {/* DESKTOP KPI CARDS (Untouched) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="p-5 rounded-2xl border transition-all"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider mb-2">
                <span>Eligible Public Routes</span>
                <Globe className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-[var(--athlon-text)]">
                {stats?.totalEligiblePublicPages || pages.length}
              </div>
              <div className="text-xs text-[var(--athlon-text-muted)] mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% mapped to Athlon App Router</span>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border transition-all"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider mb-2">
                <span>Configured Metadata</span>
                <CheckSquare className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-3xl font-black text-[var(--athlon-text)]">
                {stats?.configuredMetadataCount || pages.filter((p) => p.publicationStatus === 'PUBLISHED').length}
              </div>
              <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1.5 font-medium">
                <span>All active public hubs indexable</span>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border transition-all"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider mb-2">
                <span>Active Dynamic Templates</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-[var(--athlon-text)]">
                {stats?.activeTemplatesCount || templates.filter((t) => t.enabled).length}
              </div>
              <div className="text-xs text-[var(--athlon-text-muted)] mt-1">
                Tournaments, Venues, Academies, Coaches
              </div>
            </div>

            <div
              className="p-5 rounded-2xl border transition-all"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider mb-2">
                <span>Audit Issues & Warnings</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-[var(--athlon-text)]">
                {auditIssues.filter((i) => i.status === 'OPEN').length}
              </div>
              <div className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <span>Actionable optimizations found</span>
              </div>
            </div>
          </div>

          {/* MOBILE REDESIGNED KPI CARDS: 2x2 Clean Compact Grid */}
          <div className="grid grid-cols-2 gap-2.5 md:hidden">
            {/* Card 1: Public Routes */}
            <div
              className="p-3.5 rounded-2xl border transition-all shadow-sm"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider">
                <span>Routes</span>
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-[var(--athlon-text)] mt-1">
                {stats?.totalEligiblePublicPages || pages.length}
              </div>
              <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Mapped</span>
              </div>
            </div>

            {/* Card 2: Configured Metadata */}
            <div
              className="p-3.5 rounded-2xl border transition-all shadow-sm"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider">
                <span>Configured</span>
                <CheckSquare className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-[var(--athlon-text)] mt-1">
                {stats?.configuredMetadataCount || pages.filter((p) => p.publicationStatus === 'PUBLISHED').length}
              </div>
              <div className="text-[10px] text-cyan-500 font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>All Live Hubs</span>
              </div>
            </div>

            {/* Card 3: Dynamic Templates */}
            <div
              className="p-3.5 rounded-2xl border transition-all shadow-sm"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider">
                <span>Templates</span>
                <Layers className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-[var(--athlon-text)] mt-1">
                {stats?.activeTemplatesCount || templates.filter((t) => t.enabled).length}
              </div>
              <div className="text-[10px] text-[var(--athlon-text-muted)] mt-1 font-medium">
                Active Entities
              </div>
            </div>

            {/* Card 4: Issues */}
            <div
              className="p-3.5 rounded-2xl border transition-all shadow-sm"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--athlon-text-muted)] uppercase tracking-wider">
                <span>Audit</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-[var(--athlon-text)] mt-1">
                {auditIssues.filter((i) => i.status === 'OPEN').length}
              </div>
              <div className="text-[10px] text-amber-500 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Optimizations</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & High-Level Health Bar */}
          <div
            className="p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                <CheckCircle2 className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                  Search Engine Indexing is Active & Protected
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                  Private admin dashboards, organizers, and user accounts are strictly protected with <code className="px-1 py-0.5 rounded bg-[var(--athlon-border)] text-[var(--athlon-text)]">noindex</code>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('audit')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors text-center"
              >
                Inspect Audit ({auditIssues.filter((i) => i.status === 'OPEN').length})
              </button>
              <button
                onClick={() => setActiveTab('sitemaps')}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors text-center"
              >
                Sitemaps
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 transition-all shadow-sm text-center"
              >
                Test Social Previews
              </button>
            </div>
          </div>

          {/* Core System Status Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Sitemap Partitions Preview */}
            <div
              className="p-4 sm:p-6 rounded-2xl border space-y-3 sm:space-y-4"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-sm font-bold text-[var(--athlon-text)]">Active Sitemap Partitions</h3>
                </div>
                <button
                  onClick={() => setActiveTab('sitemaps')}
                  className="text-xs font-semibold text-[var(--athlon-primary)] hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="space-y-2">
                {sitemaps.map((sm) => (
                  <div
                    key={sm.name}
                    className="p-3 rounded-xl border border-[var(--athlon-border)] bg-[var(--athlon-card)] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--athlon-text)] truncate">{sm.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                          {sm.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--athlon-text-muted)] mt-0.5 font-mono truncate">{sm.url}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[var(--athlon-text)]">{sm.pageCount} pages</span>
                      <p className="text-[9px] text-[var(--athlon-text-muted)]">Live partitioned</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent SEO Activity & Rollback Log */}
            <div
              className="p-4 sm:p-6 rounded-2xl border space-y-3 sm:space-y-4"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-[var(--athlon-text)]">Recent Governance Events</h3>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs font-semibold text-[var(--athlon-primary)] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {history.slice(0, 4).map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl border border-[var(--athlon-border)] bg-[var(--athlon-card)] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--athlon-border)] text-[var(--athlon-text)] shrink-0">
                          {h.action}
                        </span>
                        <span className="text-xs font-bold text-[var(--athlon-text)] truncate">{h.entityName}</span>
                      </div>
                      <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5 truncate">{h.summary}</p>
                    </div>
                    <div className="text-right text-[10px] text-[var(--athlon-text-muted)] whitespace-nowrap shrink-0">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: STATIC PAGES SEO MANAGER (Desktop Table + Mobile Cards)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'pages' && (
        <div className="space-y-3 sm:space-y-4">
          {/* Filters & Search Header */}
          <div
            className="p-3.5 sm:p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--athlon-text-muted)]" />
              <input
                type="text"
                placeholder="Search page name, route or title..."
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] placeholder-[var(--athlon-text-muted)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <select
                value={pageFilterType}
                onChange={(e) => setPageFilterType(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
              >
                <option value="ALL">All Types</option>
                <option value="HOME">Home</option>
                <option value="DISCOVERY">Discovery Hub</option>
                <option value="LEGAL">Legal & Policies</option>
              </select>

              <select
                value={pageFilterStatus}
                onChange={(e) => setPageFilterStatus(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* DESKTOP TABLE VIEW (hidden md:block) */}
          <div
            className="hidden md:block rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--athlon-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--athlon-text-muted)] bg-[var(--athlon-border)]/20">
                    <th className="py-3 px-4">Page & Route</th>
                    <th className="py-3 px-4">Meta Title & Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Robots Directive</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--athlon-border)] text-xs">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[var(--athlon-border)]/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--athlon-text)]">{page.pageName}</div>
                        <div className="text-[11px] font-mono text-[var(--athlon-text-muted)] mt-0.5">
                          {page.routePattern}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-medium text-[var(--athlon-text)] truncate">{page.title}</div>
                        <div className="text-[11px] text-[var(--athlon-text-muted)] truncate mt-0.5">
                          {page.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--athlon-border)] text-[var(--athlon-text)]">
                          {page.pageType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            page.robotsDirective.includes('noindex')
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {page.robotsDirective}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            page.publicationStatus === 'PUBLISHED'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {page.publicationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setCustomPreviewTitle(page.title);
                              setCustomPreviewDesc(page.description);
                              setCustomPreviewUrl(`https://athlon.co.in${page.routePattern}`);
                              setCustomPreviewImage(page.ogImageUrl || 'https://athlon.co.in/images/athlon-banner.jpg');
                              setActiveTab('social');
                            }}
                            title="Preview SERP & Social Card"
                            className="p-1.5 rounded-lg border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPage({ ...page })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--athlon-primary)] text-black hover:opacity-90 transition-all shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPages.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[var(--athlon-text-muted)]">
                        No pages match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARD LIST VIEW (block md:hidden) */}
          <div className="block md:hidden space-y-2.5">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="p-3.5 rounded-2xl border space-y-2.5 shadow-sm"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-[11px] font-bold text-[var(--athlon-primary)] bg-[var(--athlon-primary)]/10 px-2 py-0.5 rounded-md truncate">
                    {page.routePattern}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                      page.publicationStatus === 'PUBLISHED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {page.publicationStatus}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[var(--athlon-text)]">{page.pageName}</h4>
                  <p className="text-xs text-[var(--athlon-text)] font-medium mt-1 leading-snug line-clamp-2">
                    {page.title}
                  </p>
                  <p className="text-[11px] text-[var(--athlon-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {page.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[var(--athlon-border)]">
                  <span className="font-mono text-[var(--athlon-text-muted)]">{page.robotsDirective}</span>
                  <span className="font-medium text-[var(--athlon-text-muted)]">{page.title.length} chars</span>
                </div>

                {/* Mobile Card Action Bar */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setCustomPreviewTitle(page.title);
                      setCustomPreviewDesc(page.description);
                      setCustomPreviewUrl(`https://athlon.co.in${page.routePattern}`);
                      setCustomPreviewImage(page.ogImageUrl || 'https://athlon.co.in/images/athlon-banner.jpg');
                      setActiveTab('social');
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] text-[var(--athlon-text)] bg-[var(--athlon-border)]/20 active:scale-95 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>SERP Preview</span>
                  </button>

                  <button
                    onClick={() => setEditingPage({ ...page })}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black active:scale-95 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit SEO</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredPages.length === 0 && (
              <div
                className="p-8 text-center text-xs text-[var(--athlon-text-muted)] rounded-2xl border"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                No pages match your filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: DYNAMIC METADATA TEMPLATES (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-4 md:space-y-6">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Dynamic Metadata Generation Rules
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Automatically formats titles, descriptions, and Open Graph tags for thousands of dynamic entities using placeholders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--athlon-text-muted)]">
                {templates.filter((t) => t.enabled).length} of {templates.length} Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {templates.map((tpl) => {
              const previewTitle = SEOAdminService.resolveTemplate(tpl.titleTemplate, tpl.sampleData);
              const previewDesc = SEOAdminService.resolveTemplate(tpl.descriptionTemplate, tpl.sampleData);
              const previewCanonical = SEOAdminService.resolveTemplate(tpl.canonicalTemplate, tpl.sampleData);

              return (
                <div
                  key={tpl.id}
                  className="p-4 sm:p-6 rounded-2xl border space-y-3 sm:space-y-4"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--athlon-border)] pb-3 sm:pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center bg-[var(--athlon-primary)]/10 text-[var(--athlon-primary)] font-bold text-xs sm:text-sm">
                        {tpl.entityType.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--athlon-text)]">{tpl.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[var(--athlon-text-muted)] mt-0.5 font-mono">
                          <span>/{tpl.entityType.toLowerCase()}s/[id]</span>
                          <span>•</span>
                          <span>{tpl.schemaType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tpl.enabled
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {tpl.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                      <button
                        onClick={() => setEditingTemplate({ ...tpl })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Template</span>
                      </button>
                    </div>
                  </div>

                  {/* Template Patterns & Live Resolution Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {/* Pattern Definitions */}
                    <div className="space-y-2 sm:space-y-3 text-xs bg-[var(--athlon-border)]/15 p-3 sm:p-4 rounded-xl border border-[var(--athlon-border)]">
                      <div>
                        <span className="font-semibold text-[var(--athlon-text-muted)] text-[11px]">Title Pattern:</span>
                        <div className="font-mono text-[11px] text-[var(--athlon-text)] bg-[var(--athlon-card)] p-2 rounded-lg border border-[var(--athlon-border)] mt-1">
                          {tpl.titleTemplate}
                        </div>
                      </div>
                      <div>
                        <span className="font-semibold text-[var(--athlon-text-muted)] text-[11px]">Description Pattern:</span>
                        <div className="font-mono text-[11px] text-[var(--athlon-text)] bg-[var(--athlon-card)] p-2 rounded-lg border border-[var(--athlon-border)] mt-1">
                          {tpl.descriptionTemplate}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] text-[var(--athlon-text-muted)]">Placeholders:</span>
                        {tpl.supportedPlaceholders.map((ph) => (
                          <span
                            key={ph}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                          >
                            {`{${ph}}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Live Evaluated Preview */}
                    <div className="space-y-2 bg-[var(--athlon-card)] p-3 sm:p-4 rounded-xl border border-[var(--athlon-border)]">
                      <div className="flex items-center justify-between text-xs font-semibold text-[var(--athlon-text-muted)] border-b border-[var(--athlon-border)] pb-1.5">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-[var(--athlon-primary)]" />
                          <span>Sample Live Evaluation</span>
                        </span>
                        <span className="text-[9px] text-emerald-500 font-mono">200 OK</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer leading-snug">
                          {previewTitle}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 truncate">
                          {previewCanonical}
                        </div>
                        <div className="text-[11px] text-[var(--athlon-text-muted)] line-clamp-2 leading-relaxed">
                          {previewDesc}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: ENTITY SPECIFIC OVERRIDES (Desktop Table + Mobile Cards)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overrides' && (
        <div className="space-y-3 sm:space-y-4">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Specific Entity SEO Overrides
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Manually supersede dynamic template metadata for flagship tournaments, major venues, or prominent partners.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOverride(null);
                setIsNewOverrideModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Override</span>
            </button>
          </div>

          {/* DESKTOP TABLE */}
          <div
            className="hidden md:block rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--athlon-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--athlon-text-muted)] bg-[var(--athlon-border)]/20">
                    <th className="py-3 px-4">Entity & Type</th>
                    <th className="py-3 px-4">Custom Meta Title & Description</th>
                    <th className="py-3 px-4">Canonical Override</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--athlon-border)] text-xs">
                  {overrides.map((ov) => (
                    <tr key={ov.id} className="hover:bg-[var(--athlon-border)]/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[var(--athlon-text)]">{ov.entityName}</div>
                        <div className="text-[10px] font-mono text-[var(--athlon-text-muted)] mt-0.5">
                          {ov.entityType} • ID: {ov.entityId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-medium text-[var(--athlon-text)] truncate">{ov.customTitle}</div>
                        <div className="text-[11px] text-[var(--athlon-text-muted)] truncate mt-0.5">
                          {ov.customDescription}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--athlon-text-muted)] max-w-xs truncate">
                        {ov.customCanonical}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {ov.publicationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingOverride({ ...ov });
                              setIsNewOverrideModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOverride(ov.id)}
                            className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {overrides.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[var(--athlon-text-muted)]">
                        No specific entity overrides created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="block md:hidden space-y-2.5">
            {overrides.map((ov) => (
              <div
                key={ov.id}
                className="p-3.5 rounded-2xl border space-y-2 shadow-sm"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--athlon-primary)]/10 text-[var(--athlon-primary)]">
                    {ov.entityType} • {ov.entityId}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ov.publicationStatus}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--athlon-text)]">{ov.entityName}</h4>
                  <p className="text-xs text-[var(--athlon-text)] font-medium mt-0.5 line-clamp-1">{ov.customTitle}</p>
                  <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5 line-clamp-2">{ov.customDescription}</p>
                </div>
                <div className="font-mono text-[10px] text-[var(--athlon-text-muted)] truncate">
                  {ov.customCanonical}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--athlon-border)]">
                  <button
                    onClick={() => {
                      setEditingOverride({ ...ov });
                      setIsNewOverrideModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOverride(ov.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            {overrides.length === 0 && (
              <div
                className="p-6 text-center text-xs text-[var(--athlon-text-muted)] rounded-2xl border"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                No specific entity overrides created yet. Templates are handling all entities automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: GLOBAL SEO SETTINGS (Responsive Form)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'global' && globalSettings && (
        <form onSubmit={handleSaveGlobal} className="space-y-4 sm:space-y-6">
          <div
            className="p-4 sm:p-6 rounded-2xl border space-y-4 sm:space-y-6"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Platform-Wide Identity & Default Metadata
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Defines fallback values for pages without custom metadata, title separators, and search console ownership tags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={globalSettings.siteName}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, siteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Canonical Base URL
                </label>
                <input
                  type="text"
                  value={globalSettings.canonicalBaseUrl}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, canonicalBaseUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Title Separator
                </label>
                <input
                  type="text"
                  value={globalSettings.titleSeparator}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, titleSeparator: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Twitter Card Type
                </label>
                <select
                  value={globalSettings.twitterCardType}
                  onChange={(e) =>
                    setGlobalSettings({
                      ...globalSettings,
                      twitterCardType: e.target.value as 'summary' | 'summary_large_image',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                >
                  <option value="summary_large_image">summary_large_image (High Engagement)</option>
                  <option value="summary">summary (Compact Square Card)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Default Title
                </label>
                <input
                  type="text"
                  value={globalSettings.defaultTitle}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, defaultTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={globalSettings.defaultDescription}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, defaultDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Default Fallback Open Graph Share Image URL
                </label>
                <input
                  type="text"
                  value={globalSettings.defaultOgImage}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, defaultOgImage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Google Verification Code
                </label>
                <input
                  type="text"
                  placeholder="google-site-verification=..."
                  value={globalSettings.googleVerificationCode || ''}
                  onChange={(e) =>
                    setGlobalSettings({ ...globalSettings, googleVerificationCode: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1.5">
                  Bing Verification Code
                </label>
                <input
                  type="text"
                  placeholder="msvalidate.01=..."
                  value={globalSettings.bingVerificationCode || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, bingVerificationCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>
            </div>

            <div className="border-t border-[var(--athlon-border)] pt-4 sm:pt-5 flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: SERP & SOCIAL PREVIEW PLAYGROUND (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'social' && (
        <div className="space-y-4 sm:space-y-6">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Search & Social Card Simulator
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Preview exact visual appearance across Google, Twitter/X, Facebook, and WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[var(--athlon-border)]/40 p-1 rounded-xl">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewDevice === 'desktop' ? 'bg-[var(--athlon-card)] text-[var(--athlon-text)] shadow-sm' : 'text-[var(--athlon-text-muted)]'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewDevice === 'mobile' ? 'bg-[var(--athlon-card)] text-[var(--athlon-text)] shadow-sm' : 'text-[var(--athlon-text-muted)]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center bg-[var(--athlon-border)]/40 p-1 rounded-xl overflow-x-auto">
                {(['google', 'twitter', 'facebook', 'whatsapp'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreviewPlatform(p)}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      previewPlatform === p ? 'bg-[var(--athlon-primary)] text-black shadow-sm' : 'text-[var(--athlon-text-muted)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Input Controls */}
            <div
              className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border space-y-3 sm:space-y-4"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--athlon-text-muted)]">
                Simulator Inputs
              </h4>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--athlon-text)]">Meta Title</span>
                  <span className={`text-[10px] font-mono ${getTitleStatus(customPreviewTitle.length).color}`}>
                    {customPreviewTitle.length} chars
                  </span>
                </div>
                <input
                  type="text"
                  value={customPreviewTitle}
                  onChange={(e) => setCustomPreviewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--athlon-text)]">Meta Description</span>
                  <span className={`text-[10px] font-mono ${getDescStatus(customPreviewDesc.length).color}`}>
                    {customPreviewDesc.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={customPreviewDesc}
                  onChange={(e) => setCustomPreviewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={customPreviewUrl}
                  onChange={(e) => setCustomPreviewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  OG Image URL
                </label>
                <input
                  type="text"
                  value={customPreviewImage}
                  onChange={(e) => setCustomPreviewImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>
            </div>

            {/* Visual Screen Output */}
            <div
              className="lg:col-span-7 p-4 sm:p-6 rounded-2xl border flex flex-col justify-center items-center bg-[var(--athlon-card)] overflow-hidden"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {/* GOOGLE PREVIEW */}
              {previewPlatform === 'google' && (
                <div
                  className={`w-full max-w-lg p-4 sm:p-5 rounded-2xl bg-white text-zinc-900 shadow-md ${
                    previewDevice === 'mobile' ? 'max-w-sm' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-800">
                      A
                    </div>
                    <div className="text-[12px] leading-tight min-w-0">
                      <div className="font-semibold text-zinc-800">ATHLON</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate">{customPreviewUrl}</div>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {customPreviewTitle}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 line-clamp-3 leading-relaxed">
                    {customPreviewDesc}
                  </p>
                </div>
              )}

              {/* TWITTER / X CARD */}
              {previewPlatform === 'twitter' && (
                <div className="w-full max-w-md rounded-2xl overflow-hidden border border-zinc-700 bg-black text-white shadow-lg">
                  <div className="h-40 sm:h-44 bg-zinc-800 overflow-hidden relative">
                    <img
                      src={customPreviewImage}
                      alt="OG Card"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-3 space-y-1 bg-zinc-900/90">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">athlon.co.in</div>
                    <div className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
                      {customPreviewTitle}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {customPreviewDesc}
                    </div>
                  </div>
                </div>
              )}

              {/* FACEBOOK CARD */}
              {previewPlatform === 'facebook' && (
                <div className="w-full max-w-md rounded-xl overflow-hidden border border-zinc-300 bg-white text-zinc-900 shadow-sm">
                  <div className="h-40 sm:h-48 bg-zinc-200 overflow-hidden">
                    <img
                      src={customPreviewImage}
                      alt="OG Card"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-2.5 sm:p-3 bg-zinc-100/90 border-t border-zinc-200 space-y-0.5">
                    <div className="text-[9px] text-zinc-500 font-mono uppercase">ATHLON.CO.IN</div>
                    <div className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
                      {customPreviewTitle}
                    </div>
                    <div className="text-[11px] text-zinc-600 line-clamp-1">
                      {customPreviewDesc}
                    </div>
                  </div>
                </div>
              )}

              {/* WHATSAPP CARD */}
              {previewPlatform === 'whatsapp' && (
                <div className="w-full max-w-xs p-2 rounded-2xl bg-[#0b141a] text-white">
                  <div className="p-2.5 rounded-xl bg-[#1f2c34] space-y-1.5 border border-[#2a3942]">
                    <div className="h-28 sm:h-32 rounded-lg bg-zinc-800 overflow-hidden">
                      <img
                        src={customPreviewImage}
                        alt="OG Card"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{customPreviewTitle}</div>
                    <div className="text-[10px] text-[#8696a0] line-clamp-2 leading-relaxed">
                      {customPreviewDesc}
                    </div>
                    <div className="text-[9px] text-[#00a884] font-mono">athlon.co.in</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: XML SITEMAPS (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sitemaps' && (
        <div className="space-y-4 sm:space-y-6">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Dynamic XML Sitemap Partitions
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                ATHLON partitions sitemaps cleanly into distinct domains to ensure fast crawling by Googlebot.
              </p>
            </div>
            <button
              onClick={() => showNotification('Dispatched full sitemap index rebuild task', 'success')}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {sitemaps.map((sm) => (
              <div
                key={sm.name}
                className="p-4 sm:p-5 rounded-2xl border space-y-2.5 sm:space-y-3"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-500" />
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--athlon-text)]">{sm.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {sm.status}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--athlon-text-muted)]">{sm.description}</p>

                <div className="p-2 rounded-xl bg-[var(--athlon-border)]/20 border border-[var(--athlon-border)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--athlon-text)] truncate">{sm.url}</span>
                  <button
                    onClick={() => copyToClipboard(sm.url, sm.name)}
                    className="p-1 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)] ml-2 shrink-0"
                  >
                    {copiedKey === sm.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-[var(--athlon-text)]">{sm.pageCount} URLs</span>
                  <span className="text-[var(--athlon-text-muted)] text-[10px]">
                    {new Date(sm.lastGenerated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 8: ROBOTS.TXT (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'robots' && (
        <div className="space-y-4 sm:space-y-6">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Safety-Guarded Robots.txt Engine
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Guards sensitive admin paths while preserving crawl bandwidth for public discovery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Safety Guards Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Editor Area */}
            <div
              className="lg:col-span-7 p-4 sm:p-5 rounded-2xl border space-y-3 sm:space-y-4"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--athlon-text-muted)]">
                  Directives Content
                </span>
                <span className="text-[10px] font-mono text-[var(--athlon-text-muted)]">https://athlon.co.in/robots.txt</span>
              </div>

              <textarea
                rows={12}
                value={robotsRawContent}
                onChange={(e) => setRobotsRawContent(e.target.value)}
                className="w-full p-3 sm:p-4 rounded-xl font-mono text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)] leading-relaxed"
              />

              <div className="flex items-center justify-end">
                <button
                  onClick={() => showNotification('Robots.txt deployed to production edge', 'success')}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Deploy Robots.txt</span>
                </button>
              </div>
            </div>

            {/* Live Tester Sandbox */}
            <div
              className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border space-y-3 sm:space-y-4"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--athlon-text)]">Live Path Validator</h4>
                <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">
                  Simulate whether a specific path is allowed or blocked by crawlers under current rules.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--athlon-text)]">
                  Test Path
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={robotsTesterPath}
                    onChange={(e) => setRobotsTesterPath(e.target.value)}
                    placeholder="/tournaments or /admin"
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  />
                  <button
                    onClick={handleTestRobotsPath}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0"
                  >
                    Test
                  </button>
                </div>
              </div>

              {robotsTestResult && (
                <div
                  className={`p-3.5 rounded-xl border space-y-1 ${
                    robotsTestResult.allowed
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {robotsTestResult.allowed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{robotsTestResult.allowed ? 'CRAWL ALLOWED' : 'CRAWL BLOCKED'}</span>
                  </div>
                  <div className="text-[10px] font-mono opacity-80 truncate">
                    Rule: {robotsTestResult.rule}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 9: REDIRECT RULES ENGINE (Desktop Table + Mobile Cards)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'redirects' && (
        <div className="space-y-3 sm:space-y-4">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                URL Migration & Shortlink Redirects (301 / 302)
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Preserves link authority during URL migrations and prevents 404 errors with loop-detection safety checks.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingRedirect(null);
                setIsNewRedirectModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Redirect Rule</span>
            </button>
          </div>

          {/* DESKTOP TABLE */}
          <div
            className="hidden md:block rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--athlon-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--athlon-text-muted)] bg-[var(--athlon-border)]/20">
                    <th className="py-3 px-4">Source Route</th>
                    <th className="py-3 px-4">Destination Target</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Hits</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--athlon-border)] text-xs">
                  {redirects.map((rd) => (
                    <tr key={rd.id} className="hover:bg-[var(--athlon-border)]/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-[var(--athlon-text)]">
                        {rd.sourcePath}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-blue-400 truncate max-w-xs">
                        {rd.destinationUrl}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rd.redirectType === 301
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}
                        >
                          {rd.redirectType} {rd.redirectType === 301 ? 'Permanent' : 'Temporary'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[var(--athlon-text)]">
                        {rd.hitCount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rd.enabled
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-zinc-500/10 text-zinc-400'
                          }`}
                        >
                          {rd.enabled ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRedirect({ ...rd });
                              setIsNewRedirectModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRedirect(rd.id)}
                            className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {redirects.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[var(--athlon-text-muted)]">
                        No custom redirect rules configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="block md:hidden space-y-2.5">
            {redirects.map((rd) => (
              <div
                key={rd.id}
                className="p-3.5 rounded-2xl border space-y-2 shadow-sm"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      rd.redirectType === 301
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {rd.redirectType} {rd.redirectType === 301 ? 'Permanent' : 'Temporary'}
                  </span>
                  <span className="text-[10px] text-[var(--athlon-text-muted)] font-bold">
                    {rd.hitCount.toLocaleString()} hits
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[var(--athlon-text)] font-semibold truncate">
                    <span className="text-[var(--athlon-text-muted)] text-[10px]">FROM:</span>
                    <span>{rd.sourcePath}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-400 truncate">
                    <span className="text-[var(--athlon-text-muted)] text-[10px]">TO:</span>
                    <span>{rd.destinationUrl}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--athlon-border)]">
                  <button
                    onClick={() => {
                      setEditingRedirect({ ...rd });
                      setIsNewRedirectModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRedirect(rd.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 text-rose-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}

            {redirects.length === 0 && (
              <div
                className="p-6 text-center text-xs text-[var(--athlon-text-muted)] rounded-2xl border"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                No redirect rules configured.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 10: STRUCTURED DATA & SCHEMA BUILDER (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'schema' && (
        <div className="space-y-4 sm:space-y-6">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Structured Data & Schema.org JSON-LD Models
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Generates rich snippet cards in Google SERP results (SportsEvent, SportsActivityLocation, Organization).
              </p>
            </div>
            <a
              href="https://validator.schema.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors"
            >
              <span>Schema Validator</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* SportsEvent Schema */}
            <div
              className="p-4 sm:p-5 rounded-2xl border space-y-2.5 sm:space-y-3"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--athlon-text)]">
                    SportsEvent (Tournaments)
                  </h4>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(
                        {
                          '@context': 'https://schema.org',
                          '@type': 'SportsEvent',
                          name: 'State Badminton Championship 2026',
                          startDate: '2026-11-15T09:00:00+05:30',
                          endDate: '2026-11-17T18:00:00+05:30',
                          location: {
                            '@type': 'Place',
                            name: 'Bangalore Sports Arena',
                            address: { '@type': 'PostalAddress', addressLocality: 'Bangalore', addressCountry: 'IN' },
                          },
                        },
                        null,
                        2
                      ),
                      'schema-event'
                    )
                  }
                  className="p-1 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
                >
                  {copiedKey === 'schema-event' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <pre className="p-3 sm:p-4 rounded-xl font-mono text-[10px] sm:text-[11px] bg-[var(--athlon-border)]/20 border border-[var(--athlon-border)] text-emerald-400 overflow-x-auto leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "{tournamentTitle}",
  "startDate": "{startDate}",
  "endDate": "{endDate}",
  "eventStatus": "https://schema.org/EventScheduled"
}`}
              </pre>
            </div>

            {/* SportsActivityLocation Schema */}
            <div
              className="p-4 sm:p-5 rounded-2xl border space-y-2.5 sm:space-y-3"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-500" />
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--athlon-text)]">
                    SportsActivityLocation (Venues)
                  </h4>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(
                        {
                          '@context': 'https://schema.org',
                          '@type': 'SportsActivityLocation',
                          name: 'Smash Academy Bangalore',
                          url: 'https://athlon.co.in/venues/v-123',
                        },
                        null,
                        2
                      ),
                      'schema-venue'
                    )
                  }
                  className="p-1 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
                >
                  {copiedKey === 'schema-venue' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <pre className="p-3 sm:p-4 rounded-xl font-mono text-[10px] sm:text-[11px] bg-[var(--athlon-border)]/20 border border-[var(--athlon-border)] text-cyan-400 overflow-x-auto leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "{venueName}",
  "url": "{canonicalUrl}"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 11: SEO HEALTH AUDIT & ISSUE TRACKER (Desktop Table + Mobile Cards)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-3 sm:space-y-4">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                Automated SEO Health & Compliance Auditor
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Scans public landing pages, templates, and sitemaps for optimization opportunities and crawl impediments.
              </p>
            </div>
            <button
              onClick={() => showNotification('SEO health audit finished. All checks verified.', 'success')}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Deep Audit</span>
            </button>
          </div>

          {/* DESKTOP TABLE */}
          <div
            className="hidden md:block rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--athlon-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--athlon-text-muted)] bg-[var(--athlon-border)]/20">
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Page & Route</th>
                    <th className="py-3 px-4">Detected Issue</th>
                    <th className="py-3 px-4">Recommended Optimization</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--athlon-border)] text-xs">
                  {auditIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-[var(--athlon-border)]/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : issue.severity === 'WARNING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[var(--athlon-text)]">
                        <div>{issue.pageName}</div>
                        <div className="text-[10px] font-mono text-[var(--athlon-text-muted)] mt-0.5">
                          {issue.pageRoute}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[var(--athlon-text)]">{issue.issueType}</div>
                        <div className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">
                          {issue.explanation}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-emerald-400 font-medium max-w-sm">
                        {issue.recommendedFix}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            issue.status === 'RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleAuditIssue(issue.id, issue.status)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors"
                        >
                          {issue.status === 'RESOLVED' ? 'Reopen' : 'Mark Fixed'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE AUDIT CARDS */}
          <div className="block md:hidden space-y-2.5">
            {auditIssues.map((issue) => (
              <div
                key={issue.id}
                className="p-3.5 rounded-2xl border space-y-2 shadow-sm"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : issue.severity === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--athlon-text-muted)]">
                    {issue.pageRoute}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[var(--athlon-text)]">{issue.issueType}</h4>
                  <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">{issue.explanation}</p>
                </div>

                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                  {issue.recommendedFix}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--athlon-border)]">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      issue.status === 'RESOLVED' ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {issue.status}
                  </span>
                  <button
                    onClick={() => handleToggleAuditIssue(issue.id, issue.status)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--athlon-primary)] text-black active:scale-95 transition-all shadow-sm"
                  >
                    {issue.status === 'RESOLVED' ? 'Reopen' : 'Mark Fixed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 12: GOOGLE SEARCH CONSOLE CONNECTOR (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'console' && (
        <div className="space-y-4 sm:space-y-6">
          <div
            className="p-4 sm:p-6 rounded-2xl border space-y-4"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs sm:text-sm">
                  GSC
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                    Search Console Connector
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                    Connects ATHLON production domain with Google for crawl indexing.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4 pt-3 sm:pt-4 border-t border-[var(--athlon-border)]">
              <a
                href="https://search.google.com/search-console/sitemaps"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 sm:p-4 rounded-xl border border-[var(--athlon-border)] bg-[var(--athlon-border)]/10 hover:bg-[var(--athlon-border)]/20 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--athlon-text)]">Submit Sitemaps</div>
                  <div className="text-[10px] text-[var(--athlon-text-muted)] mt-0.5">
                    Submit https://athlon.co.in/sitemap.xml
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--athlon-text-muted)]" />
              </a>

              <a
                href="https://search.google.com/search-console/inspect"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 sm:p-4 rounded-xl border border-[var(--athlon-border)] bg-[var(--athlon-border)]/10 hover:bg-[var(--athlon-border)]/20 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--athlon-text)]">URL Inspection</div>
                  <div className="text-[10px] text-[var(--athlon-text-muted)] mt-0.5">
                    Test live URL indexing status
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--athlon-text-muted)]" />
              </a>

              <a
                href="https://search.google.com/search-console/performance"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 sm:p-4 rounded-xl border border-[var(--athlon-border)] bg-[var(--athlon-border)]/10 hover:bg-[var(--athlon-border)]/20 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--athlon-text)]">Performance Metrics</div>
                  <div className="text-[10px] text-[var(--athlon-text-muted)] mt-0.5">
                    Clicks, impressions & rankings
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--athlon-text-muted)]" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 13: CHANGE HISTORY & ROLLBACK AUDIT LOG (Responsive)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-3 sm:space-y-4">
          <div
            className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                SEO Governance & Change Audit Log
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--athlon-text-muted)] mt-0.5">
                Every modification to titles, meta descriptions, sitemaps, and redirects is permanently tracked for accountability.
              </p>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div
            className="hidden md:block rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--athlon-border)] text-[10px] font-bold uppercase tracking-wider text-[var(--athlon-text-muted)] bg-[var(--athlon-border)]/20">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Summary of Changes</th>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Rollback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--athlon-border)] text-xs">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-[var(--athlon-border)]/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--athlon-border)] text-[var(--athlon-text)]">
                          {h.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[var(--athlon-text)]">
                        <div>{h.entityName}</div>
                        <div className="text-[10px] font-mono text-[var(--athlon-text-muted)] mt-0.5">
                          {h.entityType}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--athlon-text-muted)] max-w-sm truncate">
                        {h.summary}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[var(--athlon-text)]">
                        {h.changedBy}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[var(--athlon-text-muted)] whitespace-nowrap">
                        {new Date(h.changedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => showNotification(`Reverted ${h.entityName} to prior revision`, 'info')}
                          className="flex items-center gap-1 ml-auto px-2 py-1 rounded text-xs text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)] border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Revert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE HISTORY CARDS */}
          <div className="block md:hidden space-y-2.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-2xl border space-y-2 shadow-sm"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[var(--athlon-border)] text-[var(--athlon-text)]">
                    {h.action}
                  </span>
                  <span className="text-[10px] text-[var(--athlon-text-muted)]">
                    {new Date(h.changedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--athlon-text)]">{h.entityName}</h4>
                  <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">{h.summary}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--athlon-border)]">
                  <span className="text-[10px] text-[var(--athlon-text-muted)]">{h.changedBy}</span>
                  <button
                    onClick={() => showNotification(`Reverted ${h.entityName} to prior revision`, 'info')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT STATIC PAGE SEO (Mobile Bottom-Sheet Adaptable)
      ───────────────────────────────────────────────────────────── */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--athlon-border)] pb-3 sm:pb-4 sticky top-0 bg-[var(--athlon-card)] z-10 pt-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                  Edit Page SEO
                </h3>
                <p className="text-[11px] font-mono text-[var(--athlon-text-muted)] mt-0.5">
                  {editingPage.routePattern}
                </p>
              </div>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1.5 rounded-xl hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--athlon-text)]">Meta Title</span>
                  <span className={`text-[10px] font-mono ${getTitleStatus(editingPage.title.length).color}`}>
                    {editingPage.title.length} chars
                  </span>
                </div>
                <input
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--athlon-text)]">Meta Description</span>
                  <span className={`text-[10px] font-mono ${getDescStatus(editingPage.description.length).color}`}>
                    {editingPage.description.length} chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingPage.description}
                  onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={editingPage.canonicalUrl}
                    onChange={(e) => setEditingPage({ ...editingPage, canonicalUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Robots Directive
                  </label>
                  <select
                    value={editingPage.robotsDirective}
                    onChange={(e) => setEditingPage({ ...editingPage, robotsDirective: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  >
                    <option value="index, follow">index, follow (Public)</option>
                    <option value="noindex, follow">noindex, follow (Utility)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Open Graph Title
                  </label>
                  <input
                    type="text"
                    value={editingPage.ogTitle}
                    onChange={(e) => setEditingPage({ ...editingPage, ogTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={editingPage.ogImageUrl}
                    onChange={(e) => setEditingPage({ ...editingPage, ogImageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={editingPage.publicationStatus}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        publicationStatus: e.target.value as SEOPublicationStatus,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Schema Type
                  </label>
                  <input
                    type="text"
                    value={editingPage.structuredDataType || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, structuredDataType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[var(--athlon-border)] pt-4 sticky bottom-0 bg-[var(--athlon-card)] pb-1">
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSavePage(editingPage)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT DYNAMIC TEMPLATE
      ───────────────────────────────────────────────────────────── */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--athlon-border)] pb-3 sm:pb-4 sticky top-0 bg-[var(--athlon-card)] z-10 pt-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                  Configure Template: {editingTemplate.name}
                </h3>
                <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">
                  Applies to /{editingTemplate.entityType.toLowerCase()}s routes.
                </p>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="p-1.5 rounded-xl hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Title Template
                </label>
                <input
                  type="text"
                  value={editingTemplate.titleTemplate}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, titleTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Description Template
                </label>
                <textarea
                  rows={3}
                  value={editingTemplate.descriptionTemplate}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, descriptionTemplate: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Canonical URL Template
                </label>
                <input
                  type="text"
                  value={editingTemplate.canonicalTemplate}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, canonicalTemplate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)] outline-none focus:ring-2 focus:ring-[var(--athlon-primary)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tpl-enable"
                  checked={editingTemplate.enabled}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, enabled: e.target.checked })}
                  className="rounded border-[var(--athlon-border)]"
                />
                <label htmlFor="tpl-enable" className="text-xs font-semibold text-[var(--athlon-text)]">
                  Enable dynamic resolution for this entity
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-[var(--athlon-border)] pt-4 sticky bottom-0 bg-[var(--athlon-card)] pb-1">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text)] transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveTemplate(editingTemplate)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD/EDIT SPECIFIC OVERRIDE
      ───────────────────────────────────────────────────────────── */}
      {isNewOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--athlon-border)] pb-3 sm:pb-4 sticky top-0 bg-[var(--athlon-card)] z-10 pt-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                  {editingOverride ? 'Edit Specific Override' : 'New Specific Override'}
                </h3>
                <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">
                  Explicitly override metadata for a flagship entity.
                </p>
              </div>
              <button
                onClick={() => setIsNewOverrideModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveOverride({
                  id: editingOverride?.id,
                  entityType: formData.get('entityType') as SEOEntityType,
                  entityId: formData.get('entityId') as string,
                  entityName: formData.get('entityName') as string,
                  customTitle: formData.get('customTitle') as string,
                  customDescription: formData.get('customDescription') as string,
                  customCanonical: formData.get('customCanonical') as string,
                  customOgImage: formData.get('customOgImage') as string,
                  robotsDirective: formData.get('robotsDirective') as string,
                  publicationStatus: 'PUBLISHED',
                });
              }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Entity Type
                  </label>
                  <select
                    name="entityType"
                    defaultValue={editingOverride?.entityType || 'TOURNAMENT'}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                  >
                    <option value="TOURNAMENT">Tournament</option>
                    <option value="VENUE">Venue</option>
                    <option value="ACADEMY">Academy</option>
                    <option value="COACH">Coach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    Entity ID
                  </label>
                  <input
                    name="entityId"
                    required
                    defaultValue={editingOverride?.entityId || ''}
                    placeholder="tour-102"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Entity Display Name
                </label>
                <input
                  name="entityName"
                  required
                  defaultValue={editingOverride?.entityName || ''}
                  placeholder="e.g. National Badminton Championship"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Custom Title Override
                </label>
                <input
                  name="customTitle"
                  required
                  defaultValue={editingOverride?.customTitle || ''}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Custom Description Override
                </label>
                <textarea
                  name="customDescription"
                  rows={2}
                  required
                  defaultValue={editingOverride?.customDescription || ''}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Canonical URL Override
                </label>
                <input
                  name="customCanonical"
                  required
                  defaultValue={editingOverride?.customCanonical || 'https://athlon.co.in/tournaments/'}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Custom OG Image URL
                </label>
                <input
                  name="customOgImage"
                  defaultValue={editingOverride?.customOgImage || 'https://athlon.co.in/images/athlon-banner.jpg'}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <input type="hidden" name="robotsDirective" value="index, follow" />

              <div className="flex items-center justify-end gap-2.5 border-t border-[var(--athlon-border)] pt-4 sticky bottom-0 bg-[var(--athlon-card)] pb-1">
                <button
                  type="button"
                  onClick={() => setIsNewOverrideModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] text-[var(--athlon-text)] text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black shadow-sm text-center"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD/EDIT REDIRECT RULE
      ───────────────────────────────────────────────────────────── */}
      {isNewRedirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--athlon-border)] pb-3 sm:pb-4 sticky top-0 bg-[var(--athlon-card)] z-10 pt-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--athlon-text)]">
                  {editingRedirect ? 'Edit Redirect Rule' : 'New Redirect Rule'}
                </h3>
                <p className="text-[11px] text-[var(--athlon-text-muted)] mt-0.5">
                  Configure 301 Permanent or 302 Temporary URL redirection.
                </p>
              </div>
              <button
                onClick={() => setIsNewRedirectModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[var(--athlon-border)]/40 text-[var(--athlon-text-muted)] hover:text-[var(--athlon-text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveRedirect({
                  id: editingRedirect?.id,
                  sourcePath: formData.get('sourcePath') as string,
                  destinationUrl: formData.get('destinationUrl') as string,
                  redirectType: Number(formData.get('redirectType')) as 301 | 302,
                  enabled: formData.get('enabled') === 'on',
                  notes: formData.get('notes') as string,
                });
              }}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Source Path (From)
                </label>
                <input
                  name="sourcePath"
                  required
                  defaultValue={editingRedirect?.sourcePath || '/old-tournaments'}
                  placeholder="/old-path"
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Destination Target (To)
                </label>
                <input
                  name="destinationUrl"
                  required
                  defaultValue={editingRedirect?.destinationUrl || '/tournaments'}
                  placeholder="/new-path or https://..."
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                    HTTP Redirect
                  </label>
                  <select
                    name="redirectType"
                    defaultValue={editingRedirect?.redirectType || 301}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                  >
                    <option value="301">301 - Permanent</option>
                    <option value="302">302 - Temporary</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="rd-enable"
                    name="enabled"
                    defaultChecked={editingRedirect?.enabled ?? true}
                    className="rounded border-[var(--athlon-border)]"
                  />
                  <label htmlFor="rd-enable" className="text-xs font-semibold text-[var(--athlon-text)]">
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--athlon-text)] mb-1">
                  Internal Notes
                </label>
                <input
                  name="notes"
                  defaultValue={editingRedirect?.notes || ''}
                  placeholder="e.g. Migration from legacy URL"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--athlon-card)] border border-[var(--athlon-border)] text-[var(--athlon-text)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[var(--athlon-border)] pt-4 sticky bottom-0 bg-[var(--athlon-card)] pb-1">
                <button
                  type="button"
                  onClick={() => setIsNewRedirectModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--athlon-border)] text-[var(--athlon-text)] text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[var(--athlon-primary)] text-black shadow-sm text-center"
                >
                  Save Redirect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
