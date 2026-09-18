'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Clock,
  Wrench,
  Trash2,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  VenueDto,
  FacilityDto,
  FacilityBlockDto,
  FacilityMaintenanceDto,
  BlockType
} from '@/lib/api/venue';

export default function VenueBlocksPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [blocks, setBlocks] = useState<FacilityBlockDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Block Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [facilityId, setFacilityId] = useState<number>(0);
  const [blockType, setBlockType] = useState<BlockType>('OWNER_BLOCK');
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('Private Tournament / Match');
  const [notes, setNotes] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  // Maintenance Modal
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintType, setMaintType] = useState('ROUTINE');
  const [maintStart, setMaintStart] = useState(new Date().toISOString().slice(0, 16));
  const [maintEnd, setMaintEnd] = useState(new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16));
  const [maintDesc, setMaintDesc] = useState('Floor Mat Cleaning & LED Light Replacement');
  const [savingMaint, setSavingMaint] = useState(false);

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
              setFacilityId(facRes.data[0].facilityId);
            }
          }
          await loadBlocks(v.venueId);
        }
      } catch (err) {
        console.error('Failed to load blocks:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadBlocks = async (venueId: number) => {
    const res = await facilityApi.getBlocksByVenue(venueId);
    if (res.success && res.data) {
      setBlocks(res.data);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !facilityId) return;

    try {
      setSavingBlock(true);
      const res = await facilityApi.createBlock({
        venueId: venue.venueId,
        facilityId,
        blockType,
        blockDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        reason: reason.trim(),
        notes: notes.trim(),
      });

      if (res.success) {
        setIsBlockModalOpen(false);
        await loadBlocks(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to create block:', err);
    } finally {
      setSavingBlock(false);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId) return;

    try {
      setSavingMaint(true);
      const res = await facilityApi.createMaintenance({
        facilityId,
        maintenanceType: maintType,
        startDateTime: `${maintStart}:00`,
        endDateTime: `${maintEnd}:00`,
        description: maintDesc.trim(),
      });

      if (res.success) {
        setIsMaintModalOpen(false);
        if (venue) await loadBlocks(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to schedule maintenance:', err);
    } finally {
      setSavingMaint(false);
    }
  };

  const handleDeleteBlock = async (blockUuid: string) => {
    if (!confirm('Are you sure you want to release this block?')) return;
    if (!venue) return;

    try {
      await facilityApi.deleteBlock(blockUuid);
      await loadBlocks(venue.venueId);
    } catch (err) {
      console.error('Failed to delete block:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
            <Shield className="w-4 h-4" /> Capacity & Maintenance
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Administrative Blocks & Maintenance
          </h1>
          <p className="text-xs text-muted-foreground">
            Block courts for tournaments, private events, or scheduled maintenance without slot overlap.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsMaintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-bold text-xs hover:bg-white/5 transition-all"
          >
            <Wrench className="w-4 h-4 text-amber-400" /> Schedule Maintenance
          </button>
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> New Admin Block
          </button>
        </div>
      </div>

      {/* Blocks List */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
      ) : blocks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
          <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-sm font-black text-foreground">No Active Blocks</h3>
          <p className="text-xs text-muted-foreground">
            All court slots are currently open for booking according to operating rules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocks.map((b) => (
            <div
              key={b.blockUuid}
              className="p-5 rounded-2xl bg-card border border-border hover:border-red-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-black uppercase">
                    {b.blockType}
                  </span>
                  <button
                    onClick={() => handleDeleteBlock(b.blockUuid)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    title="Release Block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-black text-foreground">{b.reason}</h3>

                <div className="text-xs space-y-1 text-muted-foreground pt-1">
                  <div className="flex items-center justify-between">
                    <span>Facility:</span>
                    <span className="font-bold text-foreground">{b.facilityName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="font-bold text-foreground">{b.blockDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Window:</span>
                    <span className="font-bold text-foreground">
                      {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Block Facility Slot</h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-muted-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Facility</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  {facilities.map((fac) => (
                    <option key={fac.facilityId} value={fac.facilityId}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Block Reason / Category</label>
                <select
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value as BlockType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="OWNER_BLOCK">Owner / Admin Hold</option>
                  <option value="PRIVATE_EVENT">Private Tournament / Event</option>
                  <option value="CLUB">Club Member Session</option>
                  <option value="ACADEMY">Academy Coaching Session</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Date</label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Notes / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Badminton League matches"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBlock}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-xs hover:bg-red-600 disabled:opacity-50"
                >
                  {savingBlock ? 'Blocking...' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Schedule Maintenance</h3>
              <button onClick={() => setIsMaintModalOpen(false)} className="text-muted-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Facility</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  {facilities.map((fac) => (
                    <option key={fac.facilityId} value={fac.facilityId}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Maintenance Type</label>
                <select
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                >
                  <option value="ROUTINE">Routine Inspection & Cleaning</option>
                  <option value="FLOOR_COATING">Floor Coating / Relining</option>
                  <option value="LIGHTING">Lighting & Floodlight Repair</option>
                  <option value="REPAIR">Net / Equipment Repair</option>
                  <option value="EMERGENCY">Emergency Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={maintStart}
                    onChange={(e) => setMaintStart(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={maintEnd}
                    onChange={(e) => setMaintEnd(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description / Notes</label>
                <textarea
                  rows={2}
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMaint}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 disabled:opacity-50"
                >
                  {savingMaint ? 'Scheduling...' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
