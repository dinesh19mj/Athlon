'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Clock,
  IndianRupee,
  Building2,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  VenueDto,
  FacilityDto,
  FacilityPricingRule,
  PricingType
} from '@/lib/api/venue';

export default function VenuePricingPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Add Rule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pricingType, setPricingType] = useState<PricingType>('PEAK');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [price, setPrice] = useState<number>(750);
  const [priority, setPriority] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orgVenues = await venueApi.getVenuesByOrganization(orgId);
        if (orgVenues.success && orgVenues.data && orgVenues.data.length > 0) {
          const v = orgVenues.data[0];
          setVenue(v);
          const facRes = await facilityApi.getFacilitiesByVenue(v.venueId);
          if (facRes.success && facRes.data) {
            setFacilities(facRes.data);
            if (facRes.data.length > 0) {
              setSelectedFacility(facRes.data[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load pricing:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const handleAddPricingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility || !venue) return;

    try {
      setSaving(true);
      const updatedRules = [
        ...(selectedFacility.pricingRules || []),
        {
          pricingType,
          dayOfWeek: dayOfWeek || undefined,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          price: Number(price),
          durationMinutes: selectedFacility.slotDurationMinutes || 60,
          priority: Number(priority),
          isActive: true,
        },
      ];

      const res = await facilityApi.updateFacility(selectedFacility.facilityUuid, {
        venueId: venue.venueId,
        name: selectedFacility.name,
        facilityType: selectedFacility.facilityType,
        indoorOutdoor: selectedFacility.indoorOutdoor,
        surfaceType: selectedFacility.surfaceType,
        slotDurationMinutes: selectedFacility.slotDurationMinutes,
        bookingEnabled: true,
        sports: selectedFacility.sports,
        pricingRules: updatedRules,
      });

      if (res.success) {
        setIsModalOpen(false);
        // Refresh facility
        const facRes = await facilityApi.getFacilitiesByVenue(venue.venueId);
        if (facRes.success) {
          setFacilities(facRes.data);
          const current = facRes.data.find((f) => f.facilityId === selectedFacility.facilityId);
          if (current) setSelectedFacility(current);
        }
      }
    } catch (err) {
      console.error('Error adding pricing rule:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
            <Tag className="w-4 h-4" /> Dynamic Pricing
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Slot Rate Rules & Tiers
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure Standard, Peak hours, Weekend rates, and Off-Peak discounts per facility.
          </p>
        </div>

        <button
          onClick={() => {
            setPricingType('PEAK');
            setStartTime('18:00');
            setEndTime('22:00');
            setPrice(750);
            setPriority(5);
            setIsModalOpen(true);
          }}
          disabled={!selectedFacility}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Rate Rule
        </button>
      </div>

      {/* Facility Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {facilities.map((fac) => (
          <button
            key={fac.facilityId}
            onClick={() => setSelectedFacility(fac)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedFacility?.facilityId === fac.facilityId
                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{fac.name}</span>
          </button>
        ))}
      </div>

      {/* Pricing Rules Matrix */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
      ) : !selectedFacility ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border text-xs text-muted-foreground">
          No facilities available.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
              <span>{selectedFacility.name} Pricing Rules</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Evaluated by highest priority first)
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFacility.pricingRules?.map((rule, idx) => {
              let badgeColor = 'bg-primary/10 text-primary border-primary/30';
              if (rule.pricingType === 'PEAK') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              if (rule.pricingType === 'WEEKEND') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
              if (rule.pricingType === 'OFF_PEAK') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${badgeColor}`}>
                      {rule.pricingType}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Priority #{rule.priority || 1}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground">₹{rule.price}</span>
                    <span className="text-xs text-muted-foreground">/{rule.durationMinutes || 60}m</span>
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground pt-1 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span>Time Interval:</span>
                      <span className="font-bold text-foreground">
                        {rule.startTime?.slice(0, 5)} - {rule.endTime?.slice(0, 5)}
                      </span>
                    </div>
                    {rule.dayOfWeek && (
                      <div className="flex items-center justify-between">
                        <span>Day of Week:</span>
                        <span className="font-bold text-primary">{rule.dayOfWeek}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Pricing Rule Modal */}
      {isModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-black text-foreground">Add Rate Rule</h3>
                <p className="text-xs text-muted-foreground">{selectedFacility.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPricingRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Tier Type</label>
                <select
                  value={pricingType}
                  onChange={(e) => {
                    const t = e.target.value as PricingType;
                    setPricingType(t);
                    if (t === 'PEAK') setPriority(5);
                    if (t === 'WEEKEND') setPriority(4);
                    if (t === 'OFF_PEAK') setPriority(3);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="PEAK">Peak Hours (Evening/Prime)</option>
                  <option value="WEEKEND">Weekend Rate (Sat/Sun)</option>
                  <option value="OFF_PEAK">Off-Peak (Afternoon Discount)</option>
                  <option value="STANDARD">Standard Rate</option>
                  <option value="CUSTOM">Custom Override</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Price Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Specific Day (Optional)</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">All Applicable Days</option>
                    <option value="SATURDAY">Saturday Only</option>
                    <option value="SUNDAY">Sunday Only</option>
                    <option value="MONDAY">Monday Only</option>
                    <option value="FRIDAY">Friday Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Pricing Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
