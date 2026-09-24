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
import { Crown, Trophy, Check, Zap, ArrowUpRight } from 'lucide-react';

function SettingsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId) || {
    id: orgId,
    name: 'Workspace',
    type: 'ORGANIZER' as any,
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

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden p-3.5 sm:p-6 md:p-8 pb-32 sm:pb-16 space-y-4 sm:space-y-6 animate-in fade-in duration-300 text-foreground font-sans">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-card via-card to-primary/[0.04] border border-border/80 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-black uppercase tracking-widest shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Workspace Configuration
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-bold text-foreground/70 uppercase">
            {org.type}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <Settings className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </div>
          <span>Workspace Settings</span>
        </h1>
        <p className="text-foreground/60 text-xs sm:text-sm font-medium mt-1 max-w-2xl leading-relaxed">
          Manage workspace profile, operating hours, permissions, appearance, notifications, billing, and payment preferences for{' '}
          <span className="font-bold text-foreground underline decoration-primary/40 underline-offset-2">{org.name}</span>.
        </p>
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
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                      {isCommunityOrg ? 'Community Tier & Features' : 'Billing & Plan'}
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-foreground/50 mb-6">
                      {isCommunityOrg
                        ? 'Manage your community plan tier, unlock tournament features, and configure play settings.'
                        : 'Manage your ATHLON OS license and billing details.'}
                    </p>

                    {planMessage && (
                      <div
                        className={`p-3 rounded-2xl mb-6 text-xs font-bold border flex items-center gap-2.5 ${
                          planMessage.type === 'success'
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
                                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                                  !isPro
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
                                      <span>Let's Play Sessions &amp; Live RSVP</span>
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
                                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                                  isPro
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
                      <>
                        <div
                          className="p-5 sm:p-6 rounded-2xl relative overflow-hidden mb-6 border"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">Current License</div>
                              <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1">{org.type} Professional</h3>
                              <p className="text-xs sm:text-sm font-semibold text-foreground/70">₹2,999 / month • Next renewal on Sep 12, 2026</p>
                            </div>
                            <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md shrink-0">
                              Manage Subscription
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <h3 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wider">Billing History</h3>
                    <div
                      className="border rounded-2xl overflow-hidden"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <table className="w-full text-left">
                        <thead className="border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                          <tr>
                            <th className="px-3.5 py-2.5 text-[10px] font-black text-foreground/50 uppercase tracking-widest">Date</th>
                            <th className="px-3.5 py-2.5 text-[10px] font-black text-foreground/50 uppercase tracking-widest">Description</th>
                            <th className="px-3.5 py-2.5 text-[10px] font-black text-foreground/50 uppercase tracking-widest">Amount</th>
                            <th className="px-3.5 py-2.5 text-[10px] font-black text-foreground/50 uppercase tracking-widest text-right">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--athlon-border)' }}>
                          <tr>
                            <td className="px-3.5 py-2.5 text-xs font-bold text-foreground">Aug 12, 2026</td>
                            <td className="px-3.5 py-2.5 text-xs text-foreground/70">{org.type} Pro License</td>
                            <td className="px-3.5 py-2.5 text-xs font-bold text-foreground">₹2,999</td>
                            <td className="px-3.5 py-2.5 text-right">
                              <button className="text-xs font-bold text-primary hover:underline">Download</button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-2.5 text-xs font-bold text-foreground">Jul 12, 2026</td>
                            <td className="px-3.5 py-2.5 text-xs text-foreground/70">{org.type} Pro License</td>
                            <td className="px-3.5 py-2.5 text-xs font-bold text-foreground">₹2,999</td>
                            <td className="px-3.5 py-2.5 text-right">
                              <button className="text-xs font-bold text-primary hover:underline">Download</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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