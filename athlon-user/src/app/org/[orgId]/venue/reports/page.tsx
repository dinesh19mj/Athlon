'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Calendar,
  IndianRupee,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  PieChart,
  BarChart3,
  Building2,
  Activity,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  venueApi,
  VenueDto,
  VenueReportSummaryDto
} from '@/lib/api/venue';

export default function VenueReportsPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [report, setReport] = useState<VenueReportSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Date range filter
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orgVenues = await venueApi.getVenuesByOrganization(orgId);
        if (orgVenues.success && orgVenues.data && orgVenues.data.length > 0) {
          const v = orgVenues.data[0];
          setVenue(v);
          await loadReport(v.venueId, startDate, endDate);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId, startDate, endDate]);

  const loadReport = async (venueId: number, start: string, end: string) => {
    const res = await venueApi.getVenueReport(venueId, start, end);
    if (res.success && res.data) {
      setReport(res.data);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
            <TrendingUp className="w-4 h-4" /> Venue Insights & Reports
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Revenue & Utilization Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Track court occupancy %, sport distribution, and treasury performance.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-border">
          <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-foreground px-1 outline-none cursor-pointer"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-foreground px-1 outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase">Total Revenue</div>
          <div className="text-3xl font-black text-foreground">
            ₹{(report?.totalRevenue ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-green-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ₹{(report?.paidRevenue ?? 0).toLocaleString()} Paid
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase">Pending Collections</div>
          <div className="text-3xl font-black text-amber-400">
            ₹{(report?.pendingRevenue ?? 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Unpaid or partial on-court bookings
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase">Total Reservations</div>
          <div className="text-3xl font-black text-foreground">
            {report?.totalBookings ?? 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {report?.confirmedBookings ?? 0} Confirmed • {report?.cancelledBookings ?? 0} Cancelled
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase">Average Utilization</div>
          <div className="text-3xl font-black text-primary">
            {report?.averageUtilizationPercentage ?? 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            Based on active facility operating hours
          </div>
        </div>
      </div>

      {/* Sport Share & Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sport Distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Bookings by Sport
          </h3>

          {report?.bookingsBySport && Object.keys(report.bookingsBySport).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(report.bookingsBySport).map(([sport, count]) => {
                const total = report.totalBookings || 1;
                const pct = Math.round((Number(count) / total) * 100);
                return (
                  <div key={sport} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{sport}</span>
                      <span className="text-muted-foreground">{count} bookings ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-8 text-center">
              No sport booking data in this period.
            </div>
          )}
        </div>

        {/* Source Distribution */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" /> Booking Channels
          </h3>

          {report?.bookingsBySource && Object.keys(report.bookingsBySource).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(report.bookingsBySource).map(([src, count]) => {
                const total = report.totalBookings || 1;
                const pct = Math.round((Number(count) / total) * 100);
                return (
                  <div key={src} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">{src.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">{count} bookings ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground py-8 text-center">
              No channel distribution data in this period.
            </div>
          )}
        </div>
      </div>

      {/* Facility Performance Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Facility Performance Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="p-3 font-black uppercase tracking-wider">Facility Name</th>
                <th className="p-3 font-black uppercase tracking-wider">Total Bookings</th>
                <th className="p-3 font-black uppercase tracking-wider">Total Revenue</th>
                <th className="p-3 font-black uppercase tracking-wider text-right">Utilization %</th>
              </tr>
            </thead>
            <tbody>
              {report?.facilityPerformances?.map((fac) => (
                <tr key={fac.facilityId} className="border-b border-border/50 hover:bg-white/[0.01]">
                  <td className="p-3 font-bold text-foreground">{fac.facilityName}</td>
                  <td className="p-3 text-muted-foreground">{fac.totalBookings}</td>
                  <td className="p-3 font-bold text-foreground">₹{fac.revenue.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
                      {fac.utilizationPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
