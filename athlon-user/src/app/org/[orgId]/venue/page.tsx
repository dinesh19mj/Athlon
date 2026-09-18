'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Layers,
  Tag,
  Shield,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Users,
  ChevronRight,
  Activity,
  Calendar,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { venueApi, VenueDto, VenueReportSummaryDto } from '@/lib/api/venue';

export default function VenueManagerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.orgId as string;
  const { organizations } = useWorkspaceStore();

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [report, setReport] = useState<VenueReportSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeOrg = organizations.find((o) => o.id === orgId);

  useEffect(() => {
    async function loadVenueData() {
      try {
        setLoading(true);
        // Try fetching venues by organization UUID
        const res = await venueApi.getVenuesByOrganization(orgId);
        if (res.success && res.data && res.data.length > 0) {
          const currentVenue = res.data[0];
          setVenue(currentVenue);
          // Fetch report
          try {
            const reportRes = await venueApi.getVenueReport(currentVenue.venueId);
            if (reportRes.success) {
              setReport(reportRes.data);
            }
          } catch (e) {
            console.warn('Report fetch error:', e);
          }
        } else {
          // If no venue found yet, venue is null (show onboard card)
          setVenue(null);
        }
      } catch (err: any) {
        console.error('Failed to load venue data:', err);
        setError(err?.message || 'Failed to load venue data');
      } finally {
        setLoading(false);
      }
    }

    if (orgId) {
      loadVenueData();
    }
  }, [orgId]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-card rounded-xl border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card rounded-2xl border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card to-card/60 border border-border p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
            <Sparkles className="w-4 h-4" /> Venue Manager Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {venue ? venue.name : activeOrg?.name || 'Athlon Sports Complex'}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {venue?.city ? `${venue.addressLine1 || ''}, ${venue.city}, ${venue.state || 'India'}` : 'Facility Operations & Instant Booking Management'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href={`/org/${orgId}/venue/calendar`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <CalendarDays className="w-4 h-4" /> Live Booking Grid
          </Link>
          <Link
            href={`/org/${orgId}/venue/facilities`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-bold text-sm hover:bg-white/5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 text-primary" /> Add Court / Facility
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-foreground">
            {report?.totalBookings ?? 0}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="font-bold text-foreground">{report?.confirmedBookings ?? 0}</span> confirmed sessions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-foreground">
            ₹{(report?.totalRevenue ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="font-bold text-green-400">₹{(report?.paidRevenue ?? 0).toLocaleString()}</span> collected
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Utilization</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-foreground">
            {report?.averageUtilizationPercentage ?? 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            Across {venue?.totalFacilities || 0} active facilities
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Courts</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-foreground">
            {venue?.totalFacilities ?? 0}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
            Live Booking Enabled
          </div>
        </div>
      </div>

      {/* Venue Module Navigation Hub */}
      <div className="space-y-4">
        <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Management Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/org/${orgId}/venue/calendar`}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                Live Booking Calendar & Matrix
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visual slot schedule across all courts and turfs. Instant walk-in reservation, customer check-in and quick blocking.
              </p>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              Open Live Grid <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/org/${orgId}/venue/facilities`}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                Courts & Multi-Sport Facilities
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure Badminton courts, Cricket nets, Football turfs, Swimming pools with custom slot durations and surface types.
              </p>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              Manage Facilities <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/org/${orgId}/venue/bookings`}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center font-bold">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                Bookings & Walk-in Ledger
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Search reservations, record UPI/Cash payments, view full audit history logs, process cancellations and refunds.
              </p>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              View Bookings <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/org/${orgId}/venue/recurring`}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                Recurring Series & Academy Batches
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Schedule recurring internal academy slots and coach reservations with pre-flight conflict detector and exception overrides.
              </p>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              Manage Series <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/org/${orgId}/venue/pricing`}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                Dynamic Pricing & Peak Rates
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set peak evening rates, morning discounts, weekend pricing tiers and custom holiday pricing rules with priority ordering.
              </p>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              Configure Pricing <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href={`/org/${orgId}/venue/blocks`}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-white/[0.02] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                Admin Blocks & Maintenance
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Block courts for private club tournaments or schedule floor coating and lighting maintenance without collision.
              </p>
            </div>
            <div className="text-xs font-bold text-primary flex items-center gap-1">
              Manage Blocks <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
