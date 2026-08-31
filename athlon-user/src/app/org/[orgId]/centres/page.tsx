'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Plus,
  Phone,
  Mail,
  Clock,
  Dumbbell,
  Users,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Loader2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { AcademyService, AcademyCentre } from '@/lib/api/academy';

export default function AcademyCentresPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState<AcademyCentre | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 10:00 PM');
  const [sportsAvailable, setSportsAvailable] = useState('Badminton, Cricket, Football');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  const loadCentres = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await AcademyService.getCentres(orgId);
      setCentres(data || []);
    } catch (err: any) {
      console.error('Failed to load centres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentres();
  }, [orgId]);

  const openCreateModal = () => {
    setEditingCentre(null);
    setName('');
    setCode('');
    setAddress('');
    setCity('Bangalore');
    setState('Karnataka');
    setPostalCode('');
    setContactPhone('');
    setContactEmail('');
    setOperatingHours('06:00 AM - 10:00 PM');
    setSportsAvailable('Badminton, Cricket, Football');
    setManagerName('');
    setManagerPhone('');
    setShowModal(true);
  };

  const openEditModal = (centre: AcademyCentre) => {
    setEditingCentre(centre);
    setName(centre.name || '');
    setCode(centre.code || '');
    setAddress(centre.address || '');
    setCity(centre.city || '');
    setState(centre.state || '');
    setPostalCode(centre.postalCode || '');
    setContactPhone(centre.contactPhone || '');
    setContactEmail(centre.contactEmail || '');
    setOperatingHours(centre.operatingHours || '');
    setSportsAvailable(centre.sportsAvailable || '');
    setManagerName(centre.managerName || '');
    setManagerPhone(centre.managerPhone || '');
    setShowModal(true);
  };

  const handleSaveCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setErrorMsg('');

    try {
      if (editingCentre) {
        await AcademyService.updateCentre(editingCentre.centreUuid, {
          name,
          code,
          address,
          city,
          state,
          postalCode,
          contactPhone,
          contactEmail,
          operatingHours,
          sportsAvailable,
          managerName,
          managerPhone,
        });
        setSuccessMsg(`Centre "${name}" updated successfully!`);
      } else {
        await AcademyService.createCentre({
          organizationUuid: orgId,
          name,
          code,
          address,
          city,
          state,
          postalCode,
          contactPhone,
          contactEmail,
          operatingHours,
          sportsAvailable,
          managerName,
          managerPhone,
          status: 'ACTIVE',
        });
        setSuccessMsg(`New centre "${name}" created successfully!`);
      }

      setShowModal(false);
      await loadCentres();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to save centre:', err);
      setErrorMsg(err.message || 'Failed to save centre. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCentre = async (centreUuid: string, centreName: string) => {
    if (!confirm(`Are you sure you want to remove centre "${centreName}"?`)) return;
    try {
      await AcademyService.deleteCentre(centreUuid);
      setCentres((prev) => prev.filter((c) => c.centreUuid !== centreUuid));
      setSuccessMsg(`Centre "${centreName}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Failed to delete centre:', err);
      alert('Could not delete centre.');
    }
  };

  const filteredCentres = centres.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.sportsAvailable && c.sportsAvailable.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6 sm:pt-8 md:pt-10 pb-28 px-4 sm:px-6">
      {/* ══════════════════════════════════════════════════════════════════════
          TOP HEADER BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 p-5 sm:p-6 rounded-3xl border border-border backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/10">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Centres &amp; Campus Branches
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                {centres.length} Campuses
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage multi-location academy campuses, training facilities, and local managers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${orgId}/facilities`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-bold border border-border transition active:scale-95 shadow-sm"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span>Manage Courts</span>
          </Link>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-extrabold transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Centre</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by campus name, city, or sports..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium w-full sm:w-auto justify-between sm:justify-start">
          <span>Showing {filteredCentres.length} of {centres.length} centres</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CENTRES GRID
         ══════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Loading Academy Campuses...
          </p>
        </div>
      ) : filteredCentres.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card/60 rounded-3xl border border-border border-dashed space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-text-muted border border-border">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Academy Centres Found</h3>
          <p className="text-xs text-text-secondary max-w-sm">
            {searchQuery ? 'No centres match your filter criteria.' : 'Add your first training campus to organize courts, batches, and coaches.'}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md"
          >
            + Add First Centre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCentres.map((centre) => (
            <div
              key={centre.centreUuid}
              className="bg-card border border-border hover:border-primary/40 rounded-3xl p-6 space-y-5 transition-all shadow-xl hover:shadow-2xl group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border group-hover:border-primary/40 flex items-center justify-center text-primary shrink-0 transition-colors shadow-md">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                        {centre.name}
                      </h3>
                      {centre.code && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-surface text-text-secondary border border-border">
                          {centre.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{centre.address ? `${centre.address}, ${centre.city}` : centre.city || 'Bangalore'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(centre)}
                    className="p-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface transition border border-transparent hover:border-border"
                    title="Edit Campus"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCentre(centre.centreUuid, centre.name)}
                    className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition border border-transparent hover:border-error/20"
                    title="Delete Campus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Campus Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border">
                <div className="bg-surface/60 p-2.5 rounded-xl border border-border/80 text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Facilities</span>
                  <span className="text-sm font-extrabold text-foreground">{centre.facilitiesCount || 4} Units</span>
                </div>
                <div className="bg-surface/60 p-2.5 rounded-xl border border-border/80 text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Batches</span>
                  <span className="text-sm font-extrabold text-foreground">{centre.activeBatchesCount || 8} Active</span>
                </div>
                <div className="bg-surface/60 p-2.5 rounded-xl border border-border/80 text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Students</span>
                  <span className="text-sm font-extrabold text-primary">{centre.activeStudentsCount || 240}</span>
                </div>
                <div className="bg-surface/60 p-2.5 rounded-xl border border-border/80 text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Coaches</span>
                  <span className="text-sm font-extrabold text-foreground">{centre.activeCoachesCount || 8}</span>
                </div>
              </div>

              {/* Operating & Contact Detail */}
              <div className="space-y-2 text-xs text-text-secondary bg-surface/40 p-3 rounded-2xl border border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{centre.operatingHours || '06:00 AM - 10:00 PM'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>{centre.contactPhone || '+91 98765 43210'}</span>
                  </span>
                </div>

                {centre.managerName && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-[11px]">
                    <span className="text-text-muted">Manager: <span className="text-foreground font-semibold">{centre.managerName}</span></span>
                    {centre.managerPhone && <span className="text-text-muted font-mono">{centre.managerPhone}</span>}
                  </div>
                )}
              </div>

              {/* Sports Chips & Action */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-1">
                  {(centre.sportsAvailable || 'Badminton, Cricket').split(',').map((sport, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold"
                    >
                      {sport.trim()}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/org/${orgId}/facilities?centreUuid=${centre.centreUuid}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
                >
                  <span>Courts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE / EDIT CENTRE MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-card/80">
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                {editingCentre ? 'Edit Academy Campus' : 'Add New Academy Campus'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-foreground hover:bg-surface transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCentre} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Campus Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. ATHLON Main Campus - Indiranagar"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Campus Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MAIN-01, HSR-02"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Operating Timings
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="e.g. 05:30 AM - 10:30 PM"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Street Address &amp; Landmark
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100ft Road, Near Metro Pillar 128"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Campus Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Campus Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="campus@athlon.sport"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Sports Available (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={sportsAvailable}
                    onChange={(e) => setSportsAvailable(e.target.value)}
                    placeholder="Badminton, Cricket, Football, Tennis"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Centre Manager Name
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="e.g. Vikram Sethi"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Manager Phone
                  </label>
                  <input
                    type="text"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-bold border border-border transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCentre ? 'Update Campus' : 'Create Campus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
