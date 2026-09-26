'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import {
  Settings,
  Bell,
  CreditCard,
  ShieldAlert,
  Palette,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { ThemeSelector } from '@/components/theme';
import { AcademyPermissionMatrixView } from '@/components/academy/AcademyPermissionMatrixView';
import { ClubPermissionMatrixView } from '@/components/club/ClubPermissionMatrixView';
import OrganizerRolesPermissionsView from '@/components/organizer/OrganizerRolesPermissionsView';
import VenueRolesPermissionsView from '@/components/venue/VenueRolesPermissionsView';
import { OrganizationProfileEditor } from '@/components/academy/OrganizationProfileEditor';
import { VenueProfileEditor } from '@/components/venue/VenueProfileEditor';
import { OrganizationPaymentsSettings } from '@/components/organization/OrganizationPaymentsSettings';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { CommunityService, CommunityResponse } from '@/lib/api/community';
import { SubscriptionService, SubscriptionPackage, OrganizationSubscriptionResponse } from '@/lib/api/subscription';
import { Crown, Trophy, Check, Zap, ArrowUpRight, Download, Receipt, FileText, BadgeCheck, CheckCircle2, Loader2 } from 'lucide-react';

function SettingsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId) || {
    id: orgId,
    name: 'Workspace',
    type: 'ORGANIZER' as any,
    logo: undefined as string | undefined,
  };
  const { isAdmin } = useOrgRole();
  const { logout } = useAuthStore();

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<
    'profile' | 'amenities' | 'permissions' | 'appearance' | 'notifications' | 'payments' | 'billing' | 'danger'
  >('profile');

  useEffect(() => {
    if (tabQuery) {
      if (tabQuery === 'venue-hours' || tabQuery === 'amenities') {
        setActiveTab('amenities');
      } else if (['profile', 'permissions', 'appearance', 'notifications', 'payments', 'billing', 'danger'].includes(tabQuery)) {
        setActiveTab(tabQuery as any);
      }
    }
  }, [tabQuery]);

  const isVenueOrg = org.type === 'COURT' || (org.type as string) === 'VENUE_MANAGER';
  const isCommunityOrg = org.type === 'COMMUNITY';

  const [communityDetails, setCommunityDetails] = useState<CommunityResponse | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic Subscription State
  const [subscription, setSubscription] = useState<OrganizationSubscriptionResponse | null>(null);
  const [availablePackages, setAvailablePackages] = useState<SubscriptionPackage[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    if (isCommunityOrg && org.id) {
      CommunityService.getCommunity(org.id)
        .then((res: any) => {
          const data = (res as any)?.data || res;
          if (data) setCommunityDetails(data);
        })
        .catch((err) => console.error('Failed to load community plan:', err));
    }
  }, [isCommunityOrg, org.id]);

  useEffect(() => {
    const targetUuid = org.id || orgId;
    if (targetUuid && !isCommunityOrg) {
      setLoadingSubscription(true);
      SubscriptionService.getActiveForOrg(targetUuid)
        .then((res: any) => {
          const data = (res as any)?.data || res;
          if (data && (data.uuid || data.subscriptionPackage || data.status)) {
            setSubscription(data);
          }
        })
        .catch((err) => console.log('No active subscription found:', err))
        .finally(() => setLoadingSubscription(false));

      SubscriptionService.getAll()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : (res as any)?.data || [];
          if (Array.isArray(list)) setAvailablePackages(list);
        })
        .catch((err) => console.log('Failed to load subscription packages:', err));
    }
  }, [org.id, orgId, isCommunityOrg]);

  const handleUpdateCommunityPlan = async (newPlan: 'COMMUNITY_FREE' | 'COMMUNITY_PRO') => {
    try {
      setIsUpdatingPlan(true);
      setPlanMessage(null);
      const res = await CommunityService.updatePlan(org.id, newPlan);
      const updated = (res as any)?.data || res;
      if (updated) setCommunityDetails(updated);
      setPlanMessage({
        type: 'success',
        text: newPlan === 'COMMUNITY_PRO'
          ? '🎉 Upgraded to Community PRO! Tournaments and bracket features are now unlocked.'
          : 'Workspace updated to Community Free Tier.',
      });
      setTimeout(() => setPlanMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to update community plan:', err);
      setPlanMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update plan. Please try again.',
      });
      setTimeout(() => setPlanMessage(null), 5000);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);

  const handleDownloadReceipt = async (receiptData: {
    invoiceNumber: string;
    date: string;
    planName: string;
    amount: number | string;
    period: string;
    status: string;
  }) => {
    try {
      setDownloadingReceipt(receiptData.invoiceNumber);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Dark header banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, 'F');

      // Brand Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('ATHLON', 18, 20);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('THE TOURNAMENT EXPERIENCE, ELEVATED', 18, 27);
      doc.text('Athlon Sport Cloud Technologies Pvt. Ltd.', 18, 33);

      // Tax Invoice Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('TAX INVOICE & RECEIPT', 192, 20, { align: 'right' });

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Invoice No: ${receiptData.invoiceNumber}`, 192, 27, { align: 'right' });
      doc.text(`Date of Issue: ${receiptData.date}`, 192, 33, { align: 'right' });

      // Customer Details
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('BILLED TO:', 18, 55);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(org.name || 'Athlon Workspace', 18, 62);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Organization Domain: ${org.type} Workspace`, 18, 68);
      doc.text(`Workspace UUID: ${org.id || orgId}`, 18, 74);
      doc.text(`Account Status: ${receiptData.status}`, 18, 80);

      // Payment Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text('PAYMENT DETAILS:', 125, 55);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Payment Gateway: Razorpay Route', 125, 62);
      doc.text(`Billing Interval: ${receiptData.period}`, 125, 68);
      doc.text('Payment Mode: Verified Digital Settlement', 125, 74);
      doc.text('Settlement: COMPLETED & VERIFIED', 125, 80);

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(18, 92, 174, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('ITEM DESCRIPTION', 22, 98.5);
      doc.text('INTERVAL', 110, 98.5);
      doc.text('QTY', 140, 98.5);
      doc.text('AMOUNT (INR)', 188, 98.5, { align: 'right' });

      // Amounts Calculation
      const cleanAmountStr = String(receiptData.amount).replace(/[^0-9.]/g, '');
      const numAmount = parseFloat(cleanAmountStr) || 2999;
      const baseAmount = (numAmount / 1.18).toFixed(2);
      const gstAmount = (numAmount - parseFloat(baseAmount)).toFixed(2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${receiptData.planName} License`, 22, 109);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Full platform access, tournament bracket engine, role matrix & cloud sync', 22, 114);

      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(receiptData.period, 110, 111);
      doc.text('1', 142, 111);
      doc.setFont('helvetica', 'bold');
      doc.text(`INR ${parseFloat(baseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, 111, { align: 'right' });

      // Dividers & Subtotals
      doc.setDrawColor(226, 232, 240);
      doc.line(18, 122, 192, 122);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal (Taxable Value):', 135, 130);
      doc.text(`INR ${parseFloat(baseAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, 130, { align: 'right' });

      doc.text('Integrated GST (18% IGST):', 135, 137);
      doc.text(`INR ${parseFloat(gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, 137, { align: 'right' });

      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(135, 142, 192, 142);

      // Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Paid:', 135, 149);
      doc.text(`INR ${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 188, 149, { align: 'right' });

      // Verification Badge Box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(18, 160, 174, 26, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52);
      doc.text('✓ PAYMENT CONFIRMED & RECONCILED', 24, 169);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61);
      doc.text(`Transaction Reference: ${receiptData.invoiceNumber}`, 24, 175);
      doc.text('This is a computer-generated tax invoice and requires no physical signature.', 24, 180);

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Support: support@athlon.sport | Website: https://athlon.sport', 105, 280, { align: 'center' });
      doc.text('© 2026 Athlon Sport Technologies. All Rights Reserved.', 105, 285, { align: 'center' });

      doc.save(`ATHLON-Receipt-${receiptData.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`);
    } catch (err) {
      console.error('Failed to generate receipt PDF:', err);
    } finally {
      setDownloadingReceipt(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden p-3.5 sm:p-6 md:p-8 pb-32 sm:pb-16 space-y-4 sm:space-y-6 animate-in fade-in duration-300 text-foreground font-sans">
      {/* ── 1. LUXURY REDESIGNED WORKSPACE SETTINGS HERO COMMAND CARD ── */}
      <div
        className="relative overflow-hidden rounded-[26px] sm:rounded-[30px] p-5 sm:p-7 md:p-8 border shadow-xl transition-all select-none"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
          boxShadow:
            '0 16px 40px -12px var(--athlon-shadow, rgba(0, 0, 0, 0.14)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.14)',
        }}
      >
        {/* Top Edge Neon Energy Accent Rail */}
        <div
          className="absolute top-0 inset-x-0 h-[2.5px] opacity-85 pointer-events-none z-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
          }}
        />

        {/* Ambient Neon Spotlight Glows */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-60 z-0"
          style={{
            background:
              'radial-gradient(circle, var(--athlon-primary) 0%, rgba(251, 146, 60, 0.3) 40%, transparent 75%)',
          }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25 dark:opacity-40 z-0"
          style={{
            background:
              'radial-gradient(circle, var(--athlon-primary) 0%, transparent 75%)',
          }}
        />

        {/* Precision Tech Dot-Matrix Pattern with Fade Mask */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.14] dark:opacity-[0.22] z-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--athlon-primary) 1.2px, transparent 1.2px)',
            backgroundSize: '16px 16px',
            maskImage:
              'radial-gradient(ellipse 80% 80% at 85% 20%, black 20%, transparent 85%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 80% at 85% 20%, black 20%, transparent 85%)',
          }}
        />

        {/* High-Tech Precision Geometry / Settings Wireframe SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
          viewBox="0 0 600 240"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Concentric Telemetry Calibration Rings */}
          <g transform="translate(510, 60)" opacity="0.28" stroke="var(--athlon-primary)">
            <circle cx="0" cy="0" r="110" fill="none" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r="85" fill="none" strokeWidth="0.8" opacity="0.6" />
            <circle cx="0" cy="0" r="62" fill="none" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="42" fill="none" strokeWidth="0.75" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="22" fill="none" strokeWidth="1" />

            {/* Crosshair Radial Axis */}
            <line x1="-120" y1="0" x2="120" y2="0" strokeWidth="0.75" opacity="0.4" />
            <line x1="0" y1="-120" x2="0" y2="120" strokeWidth="0.75" opacity="0.4" />
            <line x1="-80" y1="-80" x2="80" y2="80" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
            <line x1="-80" y1="80" x2="80" y2="-80" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />

            {/* Precision Degree Ticks */}
            <line x1="0" y1="-62" x2="0" y2="-55" strokeWidth="1.2" />
            <line x1="62" y1="0" x2="55" y2="0" strokeWidth="1.2" />
            <line x1="0" y1="62" x2="0" y2="55" strokeWidth="1.2" />
            <line x1="-62" y1="0" x2="-55" y2="0" strokeWidth="1.2" />
          </g>

          {/* Velocity Chevrons in Top-Right */}
          <g transform="translate(430, 20)" stroke="var(--athlon-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
            <line x1="0" y1="0" x2="6" y2="8" />
            <line x1="6" y1="8" x2="0" y2="16" />
            <line x1="8" y1="0" x2="14" y2="8" />
            <line x1="14" y1="8" x2="8" y2="16" />
            <line x1="16" y1="0" x2="22" y2="8" />
            <line x1="22" y1="8" x2="16" y2="16" />
          </g>

          {/* Technical Reticles */}
          <path d="M 570 190 L 580 190 M 575 185 L 575 195" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.3" />
          <path d="M 20 20 L 30 20 M 20 20 L 20 30" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.35" />
        </svg>

        {/* Foreground Content */}
        <div className="relative z-10 space-y-4 sm:space-y-5">
          {/* 1. Header Top Badges Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border backdrop-blur-md transition-all shadow-xs"
                style={{
                  backgroundColor: 'var(--athlon-primary-soft)',
                  borderColor: 'var(--athlon-primary)',
                  color: 'var(--athlon-primary)',
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: 'var(--athlon-primary)' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: 'var(--athlon-primary)' }}
                  />
                </span>
                Workspace Configuration
              </span>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-foreground/70 bg-foreground/[0.04] border border-border/80 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Control Center
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  Administrator
                </span>
              )}
              <span
                className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider border shadow-xs transition-all"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {org.type}
              </span>
            </div>
          </div>

          {/* 2. Main Title and Org Avatar Hero Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              {/* High-Gloss Glassmorphic Settings Icon Container */}
              <div
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg group transition-transform"
                style={{
                  backgroundColor: 'var(--athlon-primary-soft)',
                  borderColor: 'var(--athlon-primary)',
                  boxShadow: '0 8px 24px -4px var(--athlon-shadow, rgba(0, 0, 0, 0.15))',
                }}
              >
                {(org as any)?.logo ? (
                  <img
                    src={(org as any).logo}
                    alt={org.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <Settings
                      className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-700 group-hover:rotate-90"
                      style={{ color: 'var(--athlon-primary)' }}
                    />
                  </div>
                )}
                {/* Micro corner accent indicator */}
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-primary)' }}
                >
                  <Sparkles className="w-2 h-2 text-black dark:text-black" />
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none flex items-center gap-2">
                  <span>Workspace Settings</span>
                </h1>
                <p className="text-foreground/70 text-xs sm:text-sm font-medium mt-1.5 max-w-2xl leading-relaxed">
                  Fine-tune operating hours, permissions, appearance, notifications, billing, and system parameters for{' '}
                  <span
                    className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md border text-foreground"
                    style={{
                      backgroundColor: 'var(--athlon-primary-soft)',
                      borderColor: 'var(--athlon-primary)',
                    }}
                  >
                    <Building2 className="w-3 h-3 text-primary shrink-0" />
                    {org.name}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 3. Quick Telemetry & Status Badges Strip */}
          <div
            className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-foreground/60 text-[11px] sm:text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status:</span>
                <strong className="text-foreground font-bold">Active &amp; Synced</strong>
              </span>
              <span className="text-border">•</span>
              <span>
                Domain: <strong className="text-foreground font-bold">{org.type}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="text-foreground/50">Active Tab:</span>
              <span
                className="px-2.5 py-0.5 rounded-lg border font-black uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--athlon-primary-soft)',
                  borderColor: 'var(--athlon-primary)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {activeTab}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE HORIZONTAL PILL BAR & DESKTOP SIDEBAR ── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-full">
        {/* Navigation Tabs (Horizontal on mobile, Vertical on desktop) */}
        <div className="w-full md:w-64 shrink-0 max-w-full">
          <div className="p-1 md:p-1.5 rounded-2xl bg-card/70 backdrop-blur-md border border-border/70 flex md:flex-col gap-1.5 overflow-x-auto pb-1.5 md:pb-1.5 hide-scrollbar w-full max-w-full shadow-xs">
            {/* 1. Organization Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'profile'
                ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">
                {org.type === 'ACADEMY'
                  ? 'Academy Profile'
                  : org.type === 'COACH'
                    ? 'Coach Profile & Credentials'
                    : org.type === 'CLUB'
                      ? 'Club Profile'
                      : 'Organization Profile'}
              </span>
            </button>

            {/* 2. Venue Amenities & Hours Tab (Specific to Court / Venue Manager) */}
            {isVenueOrg && (
              <button
                onClick={() => setActiveTab('amenities')}
                className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'amenities'
                  ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                  : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                  }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Amenities &amp; Hours</span>
              </button>
            )}

            {(org.type === 'ACADEMY' || org.type === 'CLUB' || org.type === 'ORGANIZER' || org.type === 'ASSOCIATION' || isVenueOrg) && isAdmin && (
              <button
                onClick={() => setActiveTab('permissions')}
                className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'permissions'
                  ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                  : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                  }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Roles &amp; Permissions</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'appearance'
                ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'notifications'
                ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                }`}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'payments'
                ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Payments &amp; Settlements</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'billing'
                ? 'bg-primary text-black font-black shadow-md shadow-primary/20'
                : 'text-foreground/75 hover:bg-foreground/5 hover:text-foreground border border-transparent'
                }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Plan &amp; Billing</span>
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${activeTab === 'danger'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/25 font-black'
                : 'text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
                }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Danger Zone</span>
            </button>

            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 md:mt-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
              }}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Log Out</span>
            </button>
          </div>
        </div>

        {/* ── Settings Content Area ── */}
        <div className="flex-grow min-w-0 w-full max-w-full overflow-x-hidden">
          {/* 1. Profile Editor Tab (Always OrganizationProfileEditor) */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <OrganizationProfileEditor orgId={org.id} />
            </div>
          )}

          {/* 2. Venue Amenities & Hours Tab */}
          {activeTab === 'amenities' && isVenueOrg && (
            <div className="animate-in fade-in duration-300">
              <VenueProfileEditor orgId={org.id} />
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && org.type === 'ACADEMY' && (
            <div className="animate-in fade-in duration-300">
              <AcademyPermissionMatrixView orgUuid={org.id} />
            </div>
          )}

          {activeTab === 'permissions' && org.type === 'CLUB' && (
            <div className="animate-in fade-in duration-300">
              <ClubPermissionMatrixView orgUuid={org.id} />
            </div>
          )}

          {activeTab === 'permissions' && (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION') && (
            <div className="animate-in fade-in duration-300">
              <OrganizerRolesPermissionsView orgUuid={org.id} orgName={org.name || 'Organizer Workspace'} />
            </div>
          )}

          {activeTab === 'permissions' && isVenueOrg && (
            <div className="animate-in fade-in duration-300">
              <VenueRolesPermissionsView orgUuid={org.id} orgName={org.name || 'Venue Workspace'} />
            </div>
          )}

          {/* Other Tabs in Card */}
          {activeTab !== 'profile' && activeTab !== 'amenities' && !(activeTab === 'permissions' && (org.type === 'ACADEMY' || org.type === 'CLUB' || org.type === 'ORGANIZER' || org.type === 'ASSOCIATION' || isVenueOrg)) && (
            <div
              className="rounded-[24px] p-4 sm:p-6 md:p-8 shadow-sm border"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* ─── Appearance Tab ───────────────────────────────────────────── */}
              {activeTab === 'appearance' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Appearance &amp; Accent Theme</h2>
                    <p className="text-xs sm:text-sm font-medium text-foreground/50 mb-6">
                      Customize the ATHLON sports-tech accent theme across your workspace.
                    </p>
                    <ThemeSelector showPreviews={true} />
                  </div>
                </div>
              )}

              {/* ─── Notifications Tab ────────────────────────────────────────── */}
              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Notification Preferences</h2>
                    <p className="text-xs sm:text-sm font-medium text-foreground/50 mb-6">
                      Choose how you want to be alerted about workspace activity.
                    </p>

                    <div className="space-y-3">
                      {[
                        { title: 'New Member Registrations', desc: 'Get notified when a new member or student joins.' },
                        { title: 'Fee Payment Alerts', desc: 'Notifications for successful fee collections and overdue alerts.' },
                        { title: 'Schedule Changes', desc: 'Alerts when a coach modifies or cancels a batch.' },
                        { title: 'Weekly Reports', desc: 'Receive a weekly digest of analytics and attendance.' },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3.5 border rounded-2xl"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div>
                            <div className="font-bold text-foreground text-xs sm:text-sm">{item.title}</div>
                            <div className="text-[11px] text-foreground/50 mt-0.5">{item.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                            <div className="w-10 h-5 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Payments & Settlements Tab ─────────────────────────────── */}
              {activeTab === 'payments' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <OrganizationPaymentsSettings
                    organizationId={org.id || orgId}
                    organizationName={org.name}
                    organizationType={org.type}
                  />
                </div>
              )}

              {/* ─── Billing Tab ──────────────────────────────────────────────── */}
              {activeTab === 'billing' && (
                <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border shadow-xs"
                            style={{
                              backgroundColor: 'var(--athlon-primary-soft)',
                              borderColor: 'var(--athlon-primary)',
                              color: 'var(--athlon-primary)',
                            }}
                          >
                            <CreditCard className="w-3 h-3" />
                            License &amp; Subscriptions
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-foreground tracking-tight">
                          {isCommunityOrg ? 'Community Tier & Features' : 'Billing & Plan'}
                        </h2>
                        <p className="text-[11px] sm:text-xs text-foreground/60 font-medium leading-relaxed max-w-xl">
                          {isCommunityOrg
                            ? 'Manage your community plan tier, unlock tournament features, and configure play settings.'
                            : 'Manage your ATHLON license, billing intervals, and invoice download history.'}
                        </p>
                      </div>
                    </div>

                    {planMessage && (
                      <div
                        className={`p-3 rounded-2xl mb-6 text-xs font-bold border flex items-center gap-2.5 ${planMessage.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}
                      >
                        {planMessage.type === 'success' ? (
                          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                        )}
                        <span>{planMessage.text}</span>
                      </div>
                    )}

                    {isCommunityOrg ? (
                      <div className="space-y-6">
                        {/* Current Plan Overview Card */}
                        {(() => {
                          const isPro = communityDetails?.planType === 'COMMUNITY_PRO';
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Free Tier Card */}
                              <div
                                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${!isPro
                                  ? 'bg-primary/5 border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/30'
                                  : 'bg-surface border-border opacity-85'
                                  }`}
                                style={{
                                  backgroundColor: !isPro ? undefined : 'var(--athlon-surface)',
                                  borderColor: !isPro ? undefined : 'var(--athlon-border)',
                                }}
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-black text-sm">
                                        🏸
                                      </div>
                                      <div>
                                        <h3 className="font-black text-sm text-foreground">Community FREE</h3>
                                        <p className="text-[10px] text-foreground/50">Standard Play Hub</p>
                                      </div>
                                    </div>
                                    {!isPro && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/30">
                                        Active Plan
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-2 text-xs text-foreground/80">
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span>Unlimited Players &amp; Captains</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span>Let&apos;s Play Sessions &amp; Live RSVP</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span>Social Feed, Media &amp; Polls</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span>Internal Teams &amp; Friendly Matches</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span>Kitty &amp; Shared Expense Ledger</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-5 mt-4 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                                  {isPro ? (
                                    <button
                                      type="button"
                                      disabled={isUpdatingPlan}
                                      onClick={() => handleUpdateCommunityPlan('COMMUNITY_FREE')}
                                      className="w-full py-2.5 rounded-xl border border-foreground/20 hover:bg-foreground/5 text-foreground font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {isUpdatingPlan ? 'Switching...' : 'Switch to Free Tier'}
                                    </button>
                                  ) : (
                                    <div className="text-[11px] text-foreground/50 font-bold text-center py-1">
                                      Included with Athlon Sports Circle
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* PRO Tier Card */}
                              <div
                                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${isPro
                                  ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/40 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                                  : 'bg-surface border-border'
                                  }`}
                                style={{
                                  backgroundColor: isPro ? undefined : 'var(--athlon-surface)',
                                  borderColor: isPro ? undefined : 'var(--athlon-border)',
                                }}
                              >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                                <div className="space-y-4 relative z-10">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/30">
                                        <Trophy className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <h3 className="font-black text-sm text-foreground">Community PRO</h3>
                                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        </div>
                                        <p className="text-[10px] text-amber-400 font-semibold">Tournaments &amp; Cups</p>
                                      </div>
                                    </div>
                                    {isPro && (
                                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/40">
                                        Active PRO
                                      </span>
                                    )}
                                  </div>

                                  <div className="space-y-2 text-xs text-foreground/80">
                                    <div className="flex items-center gap-2 font-bold text-foreground">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Everything in Free Tier, plus:</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Knockout &amp; Elimination Tournaments</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Round-Robin Leagues, Draws &amp; Pools</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Live Court Scorekeeping &amp; Ref Desk</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-semibold">
                                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>Championship Badges &amp; Leaderboards</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-5 mt-4 border-t relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                                  {isPro ? (
                                    <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-black text-amber-400 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                      <Crown className="w-3.5 h-3.5 fill-amber-400" />
                                      <span>All Tournament Features Unlocked</span>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isUpdatingPlan}
                                      onClick={() => handleUpdateCommunityPlan('COMMUNITY_PRO')}
                                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                      {isUpdatingPlan ? (
                                        <span>Upgrading...</span>
                                      ) : (
                                        <>
                                          <Crown className="w-3.5 h-3.5 fill-black" />
                                          <span>Upgrade to Community PRO</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* Dynamic Luxury SaaS Current License Hero Card */
                      (() => {
                        const activePkg = subscription?.subscriptionPackage || availablePackages.find(p => p.workspaceType === org.type || p.name?.toUpperCase().includes(org.type?.toUpperCase())) || null;
                        const planName = activePkg?.name || `${org.type} Pro`;
                        const planPrice = activePkg?.price !== undefined ? `₹${Number(activePkg.price).toLocaleString('en-IN')}` : '₹2,999';
                        const planPeriod = activePkg?.durationMonths ? (activePkg.durationMonths === 1 ? '/ month' : `/${activePkg.durationMonths} mo`) : activePkg?.period ? `/${activePkg.period}` : '/ month';
                        const planStatus = subscription?.status || ((org as any).isActive ? 'ACTIVE' : 'INACTIVE');
                        const isSubActive = planStatus === 'ACTIVE';
                        const renewalDate = subscription?.endDate
                          ? new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Continuous Active';
                        const featuresList = activePkg?.features
                          ? activePkg.features.split(/[,;\n]/).map(f => f.trim()).filter(Boolean)
                          : [
                              `${org.type === 'ORGANIZER' ? 'Full Tournament Engine & Draws' : org.type === 'ACADEMY' ? 'Student Batch Management' : org.type === 'CLUB' ? 'Member Access & Court Bookings' : 'Full Workspace Suite'}`,
                              'Role Governance & Staff Permissions',
                              'Direct UPI & Online Payment Gateway',
                            ];

                        return (
                          <div
                            className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 border shadow-md transition-all"
                            style={{
                              backgroundColor: 'var(--athlon-card)',
                              borderColor: 'var(--athlon-border)',
                              boxShadow: '0 12px 32px -8px var(--athlon-shadow, rgba(0, 0, 0, 0.12)), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            {/* Ambient Glow */}
                            <div
                              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-25"
                              style={{ backgroundColor: 'var(--athlon-primary)' }}
                            />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-xs"
                                    style={{
                                      backgroundColor: 'var(--athlon-primary-soft)',
                                      borderColor: 'var(--athlon-primary)',
                                      color: 'var(--athlon-primary)',
                                    }}
                                  >
                                    <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                      <span
                                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                                        style={{
                                          backgroundColor: 'var(--athlon-primary-soft)',
                                          borderColor: 'var(--athlon-primary)',
                                          color: 'var(--athlon-primary)',
                                        }}
                                      >
                                        {activePkg?.name ? 'ACTIVE PLAN' : 'PRO LICENSE'}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase border ${
                                          isSubActive
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                                        }`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                        {planStatus}
                                      </span>
                                    </div>
                                    <h3 className="text-base sm:text-xl font-black text-foreground tracking-tight mt-0.5">
                                      {planName}
                                    </h3>
                                  </div>
                                </div>

                                {/* Dynamic Pricing & Renewal Telemetry */}
                                <div className="flex flex-wrap items-baseline gap-2 pt-0.5">
                                  <span className="text-xl sm:text-2xl font-black text-foreground font-mono">
                                    {planPrice}
                                  </span>
                                  <span className="text-xs font-semibold text-foreground/50">{planPeriod}</span>
                                  <span className="text-foreground/30">•</span>
                                  <span className="text-[11px] sm:text-xs font-semibold text-foreground/70">
                                    Status: <strong className="text-foreground font-bold">{renewalDate}</strong>
                                  </span>
                                </div>

                                {/* Dynamic Plan Highlights */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] sm:text-[11px] text-foreground/75 font-semibold">
                                  {featuresList.slice(0, 4).map((feat, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {feat}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* CTA Buttons */}
                              <div className="shrink-0 self-start md:self-center pt-2 md:pt-0 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadReceipt({
                                      invoiceNumber:
                                        subscription?.paymentReference ||
                                        `ATH-INV-${(org.id || orgId).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`,
                                      date: subscription?.startDate
                                        ? new Date(subscription.startDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          })
                                        : new Date().toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          }),
                                      planName,
                                      amount: planPrice,
                                      period: planPeriod,
                                      status: planStatus,
                                    })
                                  }
                                  disabled={downloadingReceipt !== null}
                                  className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center gap-2 text-foreground hover:border-primary cursor-pointer disabled:opacity-50 shadow-xs"
                                  style={{
                                    backgroundColor: 'var(--athlon-surface)',
                                    borderColor: 'var(--athlon-border)',
                                  }}
                                >
                                  {downloadingReceipt ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5 text-primary" />
                                  )}
                                  <span>{downloadingReceipt ? 'Generating PDF...' : 'Tax Invoice'}</span>
                                </button>

                                <button
                                  type="button"
                                  className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-primary/25 flex items-center gap-2 hover:brightness-110 cursor-pointer"
                                  style={{
                                    backgroundColor: 'var(--athlon-primary)',
                                    color: '#000000',
                                  }}
                                >
                                  <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
                                  <span>Manage Subscription</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Dynamic Billing History Section */}
                    <div className="pt-2 sm:pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-primary" />
                          <h3 className="font-black text-foreground text-xs sm:text-sm uppercase tracking-wider">
                            Billing History &amp; Receipts
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold text-foreground/40 font-mono">
                          Auto-Invoicing via Razorpay
                        </span>
                      </div>

                      {(() => {
                        const activePkg =
                          subscription?.subscriptionPackage ||
                          availablePackages.find(
                            (p) =>
                              p.workspaceType === org.type ||
                              p.name?.toUpperCase().includes(org.type?.toUpperCase())
                          ) ||
                          null;
                        const invNumber =
                          subscription?.paymentReference ||
                          `ATH-INV-${(org.id || orgId).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;
                        const invDate = subscription?.startDate
                          ? new Date(subscription.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : new Date().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            });
                        const currentPlanName =
                          subscription?.subscriptionPackage?.name || activePkg?.name || `${org.type} Pro`;
                        const currentPlanPrice =
                          subscription?.subscriptionPackage?.price !== undefined
                            ? `₹${Number(subscription.subscriptionPackage.price).toLocaleString('en-IN')}`
                            : activePkg?.price !== undefined
                            ? `₹${Number(activePkg.price).toLocaleString('en-IN')}`
                            : '₹2,999';
                        const currentPlanPeriod = activePkg?.durationMonths
                          ? activePkg.durationMonths === 1
                            ? 'Monthly'
                            : `${activePkg.durationMonths} Months`
                          : 'Monthly';
                        const currentStatus = subscription?.status || 'PAID';

                        return (
                          <>
                            {/* Desktop Table View */}
                            <div
                              className="hidden sm:block border rounded-2xl overflow-hidden shadow-xs"
                              style={{
                                backgroundColor: 'var(--athlon-card)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <table className="w-full text-left">
                                <thead
                                  className="border-b bg-foreground/[0.02]"
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  <tr>
                                    <th className="px-4 py-3 text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                                      Billing Date
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                                      Plan &amp; License
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                                      Status
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black text-foreground/50 uppercase tracking-widest">
                                      Amount
                                    </th>
                                    <th className="px-4 py-3 text-[10px] font-black text-foreground/50 uppercase tracking-widest text-right">
                                      Tax Invoice
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--athlon-border)' }}>
                                  <tr className="hover:bg-foreground/[0.02] transition-colors">
                                    <td className="px-4 py-3.5 text-xs font-bold text-foreground">
                                      {invDate}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-foreground/80 font-medium">
                                      <span className="font-bold text-foreground">
                                        {currentPlanName}
                                      </span>
                                      <span className="block text-[10px] text-foreground/50 font-mono">
                                        {invNumber}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {currentStatus}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs font-black text-foreground font-mono">
                                      {currentPlanPrice}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDownloadReceipt({
                                            invoiceNumber: invNumber,
                                            date: invDate,
                                            planName: currentPlanName,
                                            amount: currentPlanPrice,
                                            period: currentPlanPeriod,
                                            status: currentStatus,
                                          })
                                        }
                                        disabled={downloadingReceipt !== null}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border hover:border-primary transition-all active:scale-95 text-foreground hover:text-primary cursor-pointer disabled:opacity-50"
                                        style={{
                                          backgroundColor: 'var(--athlon-surface)',
                                          borderColor: 'var(--athlon-border)',
                                        }}
                                      >
                                        {downloadingReceipt === invNumber ? (
                                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                        ) : (
                                          <Download className="w-3 h-3 text-primary" />
                                        )}
                                        <span>
                                          {downloadingReceipt === invNumber ? 'Generating...' : 'Download'}
                                        </span>
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="block sm:hidden space-y-2">
                              <div
                                className="p-3.5 rounded-xl border space-y-2.5 shadow-xs"
                                style={{
                                  backgroundColor: 'var(--athlon-card)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xs font-black text-foreground block">
                                      {currentPlanName}
                                    </span>
                                    <span className="text-[10px] text-foreground/50 font-medium">
                                      {invDate} • {invNumber}
                                    </span>
                                  </div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase">
                                    {currentStatus}
                                  </span>
                                </div>

                                <div
                                  className="pt-2 border-t flex items-center justify-between"
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  <span className="text-xs font-black font-mono text-foreground">
                                    {currentPlanPrice}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadReceipt({
                                        invoiceNumber: invNumber,
                                        date: invDate,
                                        planName: currentPlanName,
                                        amount: currentPlanPrice,
                                        period: currentPlanPeriod,
                                        status: currentStatus,
                                      })
                                    }
                                    disabled={downloadingReceipt !== null}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border hover:border-primary transition-all active:scale-95 text-foreground hover:text-primary cursor-pointer disabled:opacity-50"
                                    style={{
                                      backgroundColor: 'var(--athlon-surface)',
                                      borderColor: 'var(--athlon-border)',
                                    }}
                                  >
                                    {downloadingReceipt === invNumber ? (
                                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                    ) : (
                                      <Download className="w-3 h-3 text-primary" />
                                    )}
                                    <span>
                                      {downloadingReceipt === invNumber ? 'Generating...' : 'Download Receipt'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Danger Tab ───────────────────────────────────────────────── */}
              {activeTab === 'danger' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" /> Danger Zone
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-foreground/50 mb-6">Irreversible actions for your workspace.</p>

                    <div className="border border-red-500/25 bg-red-500/5 rounded-2xl p-4 sm:p-6">
                      <h3 className="font-bold text-foreground text-sm mb-1.5">Delete Workspace</h3>
                      <p className="text-xs text-foreground/60 mb-5 leading-relaxed">
                        Once you delete this workspace, there is no going back. All members, tournament records, settings, and financial logs will be permanently wiped.
                      </p>
                      <button className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                        Delete {org.name}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-foreground/50">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}