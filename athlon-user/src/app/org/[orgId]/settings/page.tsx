'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import {
  Settings,
  Bell,
  CreditCard,
  ShieldAlert,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { ThemeSelector } from '@/components/theme';
import { AcademyPermissionMatrixView } from '@/components/academy/AcademyPermissionMatrixView';

export default function SettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { isAdmin } = useOrgRole();
  const [activeTab, setActiveTab] = useState<'permissions' | 'appearance' | 'notifications' | 'billing' | 'danger'>('permissions');

  if (!org) return null;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-300 text-foreground font-sans">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Workspace Configuration
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> Workspace Settings
        </h1>
        <p className="text-foreground/55 text-xs sm:text-sm font-medium mt-0.5">
          Manage workspace permissions, appearance, notifications, billing, and preferences for{' '}
          <span className="font-bold text-foreground">{org.name}</span>.
        </p>
      </div>

      {/* ── MOBILE HORIZONTAL PILL BAR & DESKTOP SIDEBAR ── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Navigation Tabs (Horizontal on mobile, Vertical on desktop) */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex md:flex-col gap-1.5 overflow-x-auto pb-1.5 md:pb-0 no-scrollbar">
            {org.type === 'ACADEMY' && isAdmin && (
              <button
                onClick={() => setActiveTab('permissions')}
                className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  activeTab === 'permissions'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground border'
                }`}
                style={{
                  backgroundColor: activeTab === 'permissions' ? undefined : 'var(--athlon-card)',
                  borderColor: activeTab === 'permissions' ? undefined : 'var(--athlon-border)',
                }}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Roles & Permissions</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                activeTab === 'appearance'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground border'
              }`}
              style={{
                backgroundColor: activeTab === 'appearance' ? undefined : 'var(--athlon-card)',
                borderColor: activeTab === 'appearance' ? undefined : 'var(--athlon-border)',
              }}
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                activeTab === 'notifications'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground border'
              }`}
              style={{
                backgroundColor: activeTab === 'notifications' ? undefined : 'var(--athlon-card)',
                borderColor: activeTab === 'notifications' ? undefined : 'var(--athlon-border)',
              }}
            >
              <Bell className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                activeTab === 'billing'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground border'
              }`}
              style={{
                backgroundColor: activeTab === 'billing' ? undefined : 'var(--athlon-card)',
                borderColor: activeTab === 'billing' ? undefined : 'var(--athlon-border)',
              }}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Billing &amp; Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('danger')}
              className={`flex items-center gap-2 md:gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 active:scale-95 md:mt-4 ${
                activeTab === 'danger'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400 border border-red-500/15'
              }`}
              style={{
                backgroundColor: activeTab === 'danger' ? undefined : 'var(--athlon-card)',
              }}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Danger Zone</span>
            </button>
          </div>
        </div>

        {/* ── Settings Content Area ── */}
        <div className="flex-grow min-w-0">
          {activeTab === 'permissions' && org.type === 'ACADEMY' ? (
            <div className="animate-in fade-in duration-300">
              <AcademyPermissionMatrixView orgUuid={org.id} />
            </div>
          ) : (
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

              {/* ─── Billing Tab ──────────────────────────────────────────────── */}
              {activeTab === 'billing' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Billing &amp; Plan</h2>
                    <p className="text-xs sm:text-sm font-medium text-foreground/50 mb-6">
                      Manage your ATHLON OS license and billing details.
                    </p>

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