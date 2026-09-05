'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Settings,
  Bell,
  CreditCard,
  ShieldAlert,
  Palette,
} from 'lucide-react';
import { ThemeSelector } from '@/components/theme';

export default function SettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find(o => o.id === orgId);
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'billing' | 'danger'>('appearance');

  if (!org) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-foreground font-sans">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Workspace Configuration
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" /> Workspace Settings
        </h1>
        <p className="text-foreground/60 text-xs md:text-sm font-medium mt-1">
          Manage workspace appearance, notifications, billing, and preferences for <span className="font-bold text-foreground">{org.name}</span>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'appearance'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <Palette className="w-4 h-4" /> Appearance & Theme
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'notifications'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'billing'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <CreditCard className="w-4 h-4" /> Billing & Plan
          </button>
          <div className="pt-4 mt-4 border-t border-border">
            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'danger'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                }`}
            >
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-grow">
          <div
            className="rounded-[24px] p-6 md:p-8 shadow-xl border"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >

            {/* ─── Appearance Tab ───────────────────────────────────────────── */}
            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Appearance & Accent Theme</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Customize the ATHLON sports-tech accent theme across your workspace.</p>
                  <ThemeSelector showPreviews={true} />
                </div>
              </div>
            )}

            {/* ─── Notifications Tab ────────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Notification Preferences</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Choose how you want to be alerted about workspace activity.</p>

                  <div className="space-y-4">
                    {[
                      { title: 'New Member Registrations', desc: 'Get notified when a new member or student joins.' },
                      { title: 'Fee Payment Alerts', desc: 'Notifications for successful fee collections and overdue alerts.' },
                      { title: 'Schedule Changes', desc: 'Alerts when a coach modifies or cancels a batch.' },
                      { title: 'Weekly Reports', desc: 'Receive a weekly digest of analytics and attendance.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                        <div>
                          <div className="font-bold text-foreground text-sm">{item.title}</div>
                          <div className="text-xs text-foreground/50 mt-0.5">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                          <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Billing Tab ──────────────────────────────────────────────── */}
            {activeTab === 'billing' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Billing & Plan</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Manage your ATHLON OS license and billing details.</p>

                  <div
                    className="p-6 rounded-2xl relative overflow-hidden mb-8 border"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-primary text-xs font-black uppercase tracking-widest mb-1">Current License</div>
                        <h3 className="text-2xl font-black text-foreground mb-1">{org.type} Professional</h3>
                        <p className="text-sm font-semibold text-foreground/70">₹2,999 / month • Next renewal on Sep 12, 2026</p>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md shrink-0">
                        Manage Subscription
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Billing History</h3>
                  <div className="border border-border rounded-xl overflow-hidden bg-surface">
                    <table className="w-full text-left">
                      <thead className="bg-foreground/[0.02] border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Date</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Description</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Amount</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">Aug 12, 2026</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">{org.type} Pro License - Monthly</td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₹2,999</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-xs font-bold text-primary hover:underline">Download</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">Jul 12, 2026</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">{org.type} Pro License - Monthly</td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₹2,999</td>
                          <td className="px-4 py-3 text-right">
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
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Danger Zone
                  </h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Irreversible actions for your workspace.</p>

                  <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                    <h3 className="font-bold text-foreground mb-2">Delete Workspace</h3>
                    <p className="text-xs text-foreground/60 mb-6 leading-relaxed">
                      Once you delete this workspace, there is no going back. All members, tournament records, settings, and financial logs will be permanently wiped.
                    </p>
                    <button className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                      Delete {org.name}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}