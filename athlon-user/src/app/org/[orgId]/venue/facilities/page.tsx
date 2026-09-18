'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Edit2,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Tag,
  Shield,
  Search,
  IndianRupee,
  Filter,
  Check
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  VenueDto,
  FacilityDto,
  FacilityType,
  SurfaceType,
  FacilityStatus
} from '@/lib/api/venue';

export default function VenueFacilitiesPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityDto | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [facilityType, setFacilityType] = useState<FacilityType>('COURT');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'INDOOR' | 'OUTDOOR'>('INDOOR');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('SYNTHETIC');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [standardPrice, setStandardPrice] = useState(500);
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSports = [
    'Badminton', 'Tennis', 'Pickleball', 'Squash',
    'Cricket', 'Football', 'Basketball', 'Table Tennis', 'Volleyball', 'Swimming'
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        let orgVenues = await venueApi.getVenuesByOrganization(orgId);
        let v = orgVenues?.data && orgVenues.data.length > 0 ? orgVenues.data[0] : null;

        if (!v) {
          // Auto-create initial default venue for this workspace if not present
          const createRes = await venueApi.createVenue({
            organizationUuid: orgId,
            name: 'Main Sports Complex',
            venueType: 'MIXED',
            bookingEnabled: true,
            status: 'ACTIVE' as any,
          });
          if (createRes?.success && createRes.data) {
            v = createRes.data;
          }
        }

        if (v) {
          setVenue(v);
          await loadFacilities(v.venueId);
        }
      } catch (err: any) {
        console.error('Failed to load facilities:', err);
        setError(err?.message || 'Failed to load venue facilities');
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadFacilities = async (venueId: number) => {
    try {
      const res = await facilityApi.getFacilitiesByVenue(venueId);
      if (res?.success && res.data) {
        setFacilities(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load facility list:', err);
    }
  };

  const openCreateModal = () => {
    setEditingFacility(null);
    setName('');
    setDescription('');
    setFacilityType('COURT');
    setIndoorOutdoor('INDOOR');
    setSurfaceType('SYNTHETIC');
    setSlotDurationMinutes(60);
    setStandardPrice(500);
    setSelectedSports(['Badminton']);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fac: FacilityDto) => {
    setEditingFacility(fac);
    setName(fac.name || '');
    setDescription(fac.description || '');
    setFacilityType(fac.facilityType || 'COURT');
    setIndoorOutdoor((fac.indoorOutdoor as any) || 'INDOOR');
    setSurfaceType(fac.surfaceType || 'SYNTHETIC');
    setSlotDurationMinutes(fac.slotDurationMinutes || 60);
    const primaryPricing = fac.pricingRules?.find(p => p.pricingType === 'STANDARD');
    setStandardPrice(primaryPricing?.price || 500);
    setSelectedSports(fac.sports?.map(s => s.sportName) || ['Badminton']);
    setError(null);
    setIsModalOpen(true);
  };

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter(s => s !== sport));
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !name.trim()) {
      setError('Facility name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let currentVenue = venue;
      if (!currentVenue) {
        const orgVenues = await venueApi.getVenuesByOrganization(orgId);
        if (orgVenues?.data && orgVenues.data.length > 0) {
          currentVenue = orgVenues.data[0];
          setVenue(currentVenue);
        } else {
          const createRes = await venueApi.createVenue({
            organizationUuid: orgId,
            name: 'Main Sports Complex',
            venueType: 'MIXED',
            bookingEnabled: true,
            status: 'ACTIVE' as any,
          });
          if (createRes?.success && createRes.data) {
            currentVenue = createRes.data;
            setVenue(currentVenue);
          }
        }
      }

      if (!currentVenue) {
        setError('Venue profile not found. Please refresh the page and try again.');
        return;
      }

      const payload = {
        venueId: currentVenue.venueId,
        venueUuid: currentVenue.venueUuid,
        name: name.trim(),
        description: description?.trim() || '',
        facilityType,
        indoorOutdoor,
        surfaceType,
        slotDurationMinutes: Number(slotDurationMinutes) || 60,
        bookingEnabled: true,
        sports: selectedSports.map((s, idx) => ({
          sportName: s,
          isPrimary: idx === 0,
        })),
        pricingRules: [
          {
            pricingType: 'STANDARD',
            startTime: '06:00:00',
            endTime: '23:00:00',
            price: Number(standardPrice) || 0,
            durationMinutes: Number(slotDurationMinutes) || 60,
            priority: 1,
            isActive: true,
          },
        ],
      };

      if (editingFacility) {
        await facilityApi.updateFacility(editingFacility.facilityUuid, payload);
      } else {
        await facilityApi.createFacility(payload);
      }

      setIsModalOpen(false);
      await loadFacilities(currentVenue.venueId);
    } catch (err: any) {
      console.error('Error saving facility:', err);
      setError(err?.message || 'Failed to save facility. Please check all fields.');
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
            <Building2 className="w-4 h-4" /> Courts & Facilities
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Facility Infrastructure & Multi-Sport
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage bookable units (Courts, Turfs, Pitches, Pools, Nets) and their sport mappings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add New Facility
        </button>
      </div>

      {/* Facility Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-card border border-border" />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-foreground">No Facilities Configured</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Start by adding your first Badminton court, Cricket pitch or Football turf.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110"
          >
            <Plus className="w-4 h-4" /> Add Facility
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map((fac) => {
            const standardRate = fac.pricingRules?.find(p => p.pricingType === 'STANDARD')?.price;
            return (
              <div
                key={fac.facilityId}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {fac.facilityType} • {fac.indoorOutdoor}
                      </div>
                      <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                        {fac.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => openEditModal(fac)}
                      className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      title="Edit Facility"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {fac.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {fac.description}
                    </p>
                  )}

                  {/* Sport Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fac.sports?.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-foreground/80"
                      >
                        {s.sportName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Details */}
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{fac.slotDurationMinutes} min slot</span>
                  </div>

                  <div className="font-black text-foreground">
                    {standardRate ? `₹${standardRate}/slot` : 'Custom Rates'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-black text-foreground">
                {editingFacility ? 'Edit Facility' : 'Add New Facility'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveFacility} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Facility / Court Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Court 1 - Wooden Floor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Facility Type</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value="COURT">Court</option>
                    <option value="TURF">Turf</option>
                    <option value="FIELD">Field / Ground</option>
                    <option value="PITCH">Pitch</option>
                    <option value="PRACTICE_NET">Practice Net</option>
                    <option value="POOL">Swimming Pool</option>
                    <option value="TABLE">Table (TT/Pool)</option>
                    <option value="HALL">Indoor Hall</option>
                    <option value="MULTI_PURPOSE">Multi-Purpose</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Indoor / Outdoor</label>
                  <select
                    value={indoorOutdoor}
                    onChange={(e) => setIndoorOutdoor(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value="INDOOR">Indoor</option>
                    <option value="OUTDOOR">Outdoor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Surface Type</label>
                  <select
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value="SYNTHETIC">Synthetic Mat</option>
                    <option value="WOODEN">Wooden Flooring</option>
                    <option value="ACRYLIC">Acrylic Hardcourt</option>
                    <option value="CLAY">Clay</option>
                    <option value="ARTIFICIAL_TURF">Artificial Turf</option>
                    <option value="NATURAL_GRASS">Natural Grass</option>
                    <option value="CONCRETE">Concrete</option>
                    <option value="RUBBER">Rubberized</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Slot Duration (Min)</label>
                  <select
                    value={slotDurationMinutes}
                    onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                  </select>
                </div>
              </div>

              {/* Supported Sports */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Supported Sports</label>
                <div className="flex flex-wrap gap-2">
                  {availableSports.map((sport) => {
                    const active = selectedSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Standard Base Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Standard Base Price (₹ / Slot)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={standardPrice}
                  onChange={(e) => setStandardPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description & Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 8-LED anti-glare floodlights, BWF approved dimensions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingFacility ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
