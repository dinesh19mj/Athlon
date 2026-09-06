'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  Edit3,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
  History,
  MapPin,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Layers,
  BarChart3,
  Boxes,
  TrendingUp,
  Check,
  ChevronRight,
  ShieldAlert,
  IndianRupee,
  Activity,
  Users,
  Building2,
} from 'lucide-react';
import {
  AcademyInventoryItem,
  AcademyInventoryLog,
  AcademyInventorySummary,
  AcademyInventoryService,
  CreateAcademyInventoryPayload,
  UpdateAcademyInventoryPayload,
  AdjustAcademyInventoryStockPayload,
} from '@/lib/api/academyInventory';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { useOrgRole } from '@/hooks/use-org-role';
import { usePermissions } from '@/hooks/use-permissions';

interface AcademyInventoryViewProps {
  orgUuid: string;
  orgName: string;
}

const CATEGORIES = [
  { id: 'SHUTTLES', label: 'Shuttlecocks', icon: '🏸', color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { id: 'RACKETS', label: 'Rackets & Grips', icon: '🏸', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'BALLS', label: 'Balls & Spheres', icon: '⚽', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'TRAINING_GEAR', label: 'Training Aids & Cones', icon: '🎯', color: 'from-rose-500/20 to-rose-600/10 text-rose-400' },
  { id: 'UNIFORMS_APPAREL', label: 'Jerseys & Apparel', icon: '👕', color: 'from-purple-500/20 to-purple-600/10 text-purple-400' },
  { id: 'FIRST_AID', label: 'First Aid & Medical', icon: '🩹', color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400' },
  { id: 'NETS_POSTS', label: 'Nets & Hardware', icon: '🥅', color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400' },
  { id: 'OTHER', label: 'Other Equipment', icon: '📦', color: 'from-slate-500/20 to-slate-600/10 text-slate-400' },
];

const UNITS = ['Tubes', 'Pieces', 'Sets', 'Boxes', 'Pairs', 'Bottles', 'Units'];

export default function AcademyInventoryView({ orgUuid, orgName }: AcademyInventoryViewProps) {
  const { role, isAdmin } = useOrgRole(orgUuid);
  const { canManageModule } = usePermissions(orgUuid);
  const canManage = canManageModule('inventory');

  const [items, setItems] = useState<AcademyInventoryItem[]>([]);
  const [summary, setSummary] = useState<AcademyInventorySummary | null>(null);
  const [logs, setLogs] = useState<AcademyInventoryLog[]>([]);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<AcademyInventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<AcademyInventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Add / Edit Item
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('SHUTTLES');
  const [formQuantity, setFormQuantity] = useState('10');
  const [formMinThreshold, setFormMinThreshold] = useState('3');
  const [formUnit, setFormUnit] = useState('Tubes');
  const [formLocation, setFormLocation] = useState('');
  const [formUnitCost, setFormUnitCost] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Form State for Stock Adjustment
  const [adjustChangeType, setAdjustChangeType] = useState<'RESTOCK' | 'CONSUMED' | 'ADJUSTMENT' | 'DAMAGED'>('CONSUMED');
  const [adjustAmount, setAdjustAmount] = useState('1');
  const [adjustMemberUuid, setAdjustMemberUuid] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [itemsRes, summaryRes, membersRes] = await Promise.allSettled([
        AcademyInventoryService.getItems(orgUuid, selectedCategory, selectedStatus),
        AcademyInventoryService.getSummary(orgUuid),
        OrganizationService.getMembers(orgUuid),
      ]);

      if (itemsRes.status === 'fulfilled' && itemsRes.value) {
        setItems(itemsRes.value);
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value) {
        setSummary(summaryRes.value);
      }
      if (membersRes.status === 'fulfilled' && membersRes.value) {
        setMembers(membersRes.value);
      }
    } catch (err) {
      console.error('Failed to load academy inventory data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orgUuid) {
      loadData();
    }
  }, [orgUuid, selectedCategory, selectedStatus]);

  const loadLogs = async (itemUuid?: string) => {
    try {
      const res = await AcademyInventoryService.getLogs(orgUuid, itemUuid);
      if (res) {
        setLogs(res);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const filteredItems = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.filter((item) => {
      const matchesSearch =
        (item.itemName && item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  const handleOpenAddModal = (itemToEdit?: AcademyInventoryItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormName(itemToEdit.itemName);
      setFormCategory(itemToEdit.category);
      setFormQuantity(String(itemToEdit.quantity));
      setFormMinThreshold(String(itemToEdit.minThreshold));
      setFormUnit(itemToEdit.unit || 'Units');
      setFormLocation(itemToEdit.location || '');
      setFormUnitCost(itemToEdit.unitCost ? String(itemToEdit.unitCost) : '');
      setFormNotes(itemToEdit.notes || '');
    } else {
      setEditingItem(null);
      setFormName('');
      setFormCategory('SHUTTLES');
      setFormQuantity('10');
      setFormMinThreshold('3');
      setFormUnit('Tubes');
      setFormLocation('');
      setFormUnitCost('');
      setFormNotes('');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an item name');
      return;
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        const payload: UpdateAcademyInventoryPayload = {
          itemUuid: editingItem.itemUuid,
          itemName: formName.trim(),
          category: formCategory,
          quantity: parseInt(formQuantity, 10) || 0,
          minThreshold: parseInt(formMinThreshold, 10) || 0,
          unit: formUnit,
          location: formLocation.trim() || undefined,
          unitCost: formUnitCost ? parseFloat(formUnitCost) : undefined,
          notes: formNotes.trim() || undefined,
        };
        await AcademyInventoryService.updateItem(payload);
        showToast('Equipment updated successfully');
      } else {
        const payload: CreateAcademyInventoryPayload = {
          organizationUuid: orgUuid,
          itemName: formName.trim(),
          category: formCategory,
          quantity: parseInt(formQuantity, 10) || 0,
          minThreshold: parseInt(formMinThreshold, 10) || 3,
          unit: formUnit,
          location: formLocation.trim() || undefined,
          unitCost: formUnitCost ? parseFloat(formUnitCost) : undefined,
          notes: formNotes.trim() || undefined,
        };
        await AcademyInventoryService.createItem(payload);
        showToast('New academy equipment registered');
      }

      setIsAddModalOpen(false);
      loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAdjustModal = (item: AcademyInventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustChangeType('CONSUMED');
    setAdjustAmount('1');
    setAdjustMemberUuid('');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    const qty = parseInt(adjustAmount, 10);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid positive quantity');
      return;
    }

    let delta = qty;
    if (adjustChangeType === 'CONSUMED' || adjustChangeType === 'DAMAGED') {
      delta = -qty;
    }

    setSubmitting(true);
    try {
      const payload: AdjustAcademyInventoryStockPayload = {
        itemUuid: selectedItemForAdjust.itemUuid,
        changeType: adjustChangeType,
        quantityChange: delta,
        memberUuid: adjustMemberUuid || undefined,
        notes: adjustNotes.trim() || undefined,
      };

      await AcademyInventoryService.adjustStock(payload);
      showToast(`Stock updated: ${delta > 0 ? `+${delta}` : delta} ${selectedItemForAdjust.unit}`);
      setIsAdjustModalOpen(false);
      loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemUuid: string) => {
    if (!window.confirm('Are you sure you want to remove this item from academy inventory?')) return;

    try {
      await AcademyInventoryService.deleteItem(itemUuid);
      showToast('Equipment removed from inventory');
      loadData(true);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete item');
    }
  };

  const handleOpenLogs = (itemUuid?: string) => {
    loadLogs(itemUuid);
    setIsLogDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-card border border-primary/30 shadow-2xl text-foreground font-semibold text-xs tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden border-b bg-card/60 backdrop-blur-xl" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    Academy Inventory &amp; Supplies
                  </h1>
                  <p className="text-xs text-foreground/50 font-medium">
                    Manage shuttles, racquets, balls, training cones, kits &amp; gear stock for {orgName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleOpenLogs()}
                className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all shadow-sm active:scale-95"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <History className="w-4 h-4 text-primary" />
                <span>Stock History</span>
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl border flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                style={{ borderColor: 'var(--athlon-border)' }}
                title="Refresh Inventory"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>

              {canManage && (
                <button
                  onClick={() => handleOpenAddModal()}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Equipment</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div
              className="p-4 rounded-2xl border bg-card/40 relative overflow-hidden flex flex-col justify-between"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">Total Items</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-foreground font-mono">{summary?.totalCategories || items.length}</span>
                <span className="text-[10px] text-foreground/40 font-medium">SKUs</span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border bg-card/40 relative overflow-hidden flex flex-col justify-between"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">Active Units</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-primary font-mono">{summary?.totalQuantity ?? items.reduce((acc, i) => acc + (i.quantity || 0), 0)}</span>
                <span className="text-[10px] text-primary/70 font-medium">In Stock</span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border bg-card/40 relative overflow-hidden flex flex-col justify-between"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">Low Stock Alerts</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono ${(summary?.lowStockCount || 0) + (summary?.outOfStockCount || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(summary?.lowStockCount || 0) + (summary?.outOfStockCount || 0)}
                </span>
                <span className="text-[10px] text-foreground/40 font-medium">Need Refill</span>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border bg-card/40 relative overflow-hidden flex flex-col justify-between"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wider">Estimated Value</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-foreground font-mono">₹{Number(summary?.estimatedTotalValue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Category Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search gear, shuttles, cones, lockers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-card/50 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
              style={{ borderColor: 'var(--athlon-border)' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedStatus === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border text-foreground/70 hover:text-foreground hover:bg-white/5'
              }`}
              style={{ borderColor: selectedStatus === 'ALL' ? 'transparent' : 'var(--athlon-border)' }}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('LOW_STOCK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedStatus === 'LOW_STOCK'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-card border text-amber-400 hover:bg-amber-500/10'
              }`}
              style={{ borderColor: selectedStatus === 'LOW_STOCK' ? 'transparent' : 'var(--athlon-border)' }}
            >
              <AlertTriangle className="w-3 h-3" />
              Low Stock
            </button>
            <button
              onClick={() => setSelectedStatus('OUT_OF_STOCK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedStatus === 'OUT_OF_STOCK'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-card border text-rose-400 hover:bg-rose-500/10'
              }`}
              style={{ borderColor: selectedStatus === 'OUT_OF_STOCK' ? 'transparent' : 'var(--athlon-border)' }}
            >
              <ShieldAlert className="w-3 h-3" />
              Depleted
            </button>
          </div>
        </div>

        {/* Category Horizontal Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
              selectedCategory === 'ALL'
                ? 'bg-foreground text-background border-foreground shadow-md'
                : 'bg-card border text-foreground/70 hover:text-foreground hover:bg-white/5'
            }`}
            style={{ borderColor: selectedCategory === 'ALL' ? 'transparent' : 'var(--athlon-border)' }}
          >
            <span>🏷️</span>
            <span>All Categories</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card text-foreground/70 hover:text-foreground hover:bg-white/5'
                }`}
                style={{ borderColor: isSelected ? 'transparent' : 'var(--athlon-border)' }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Items Grid & Cards */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-foreground/50 font-semibold">Loading academy equipment roster...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="py-16 px-4 rounded-3xl border bg-card/30 text-center flex flex-col items-center justify-center gap-3.5"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">No Inventory Items Found</h3>
              <p className="text-xs text-foreground/50 max-w-sm mx-auto mt-1">
                {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                  ? 'No equipment matching your active filters. Try adjusting your search query.'
                  : 'Start tracking academy shuttles, racquets, cones, medical kits, and equipment.'}
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => handleOpenAddModal()}
                className="mt-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Item</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const catMeta = CATEGORIES.find((c) => c.id === item.category) || {
                label: item.category,
                icon: '📦',
              };

              const isLow = item.status === 'LOW_STOCK';
              const isOut = item.status === 'OUT_OF_STOCK' || item.quantity <= 0;

              return (
                <div
                  key={item.itemUuid}
                  className="rounded-[24px] border bg-card/60 p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-md group relative overflow-hidden"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  {/* Status Indicator Bar */}
                  <div
                    className={`h-1 absolute top-0 left-0 right-0 ${
                      isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-primary'
                    }`}
                  />

                  <div className="space-y-3.5">
                    {/* Top Row: Category + Actions */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface border flex items-center gap-1.5" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span>{catMeta.icon}</span>
                        <span className="text-foreground/70">{catMeta.label}</span>
                      </span>

                      {canManage && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenAddModal(item)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-primary hover:bg-white/5 transition-all"
                            title="Edit details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.itemUuid)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Item Name & Details */}
                    <div>
                      <h4 className="text-sm font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.itemName}
                      </h4>
                      {item.location && (
                        <div className="flex items-center gap-1 text-[11px] text-foreground/45 mt-0.5">
                          <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Stock Display Container */}
                    <div
                      className="p-3.5 rounded-2xl border flex items-center justify-between"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-foreground/40 block">Available</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`text-xl font-black font-mono ${
                              isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-foreground'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <span className="text-[11px] font-bold text-foreground/60">{item.unit || 'Units'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-foreground/40 block">Min Threshold</span>
                        <span className="text-xs font-bold font-mono text-foreground/60 mt-0.5 block">
                          {item.minThreshold} {item.unit || 'Units'}
                        </span>
                      </div>
                    </div>

                    {/* Cost & Notes */}
                    <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-1">
                      {item.unitCost ? (
                        <span className="font-semibold text-foreground/70">
                          ₹{item.unitCost} <span className="text-[10px] text-foreground/40">/ {item.unit}</span>
                        </span>
                      ) : (
                        <span className="text-foreground/30 italic">No cost set</span>
                      )}

                      <button
                        onClick={() => handleOpenLogs(item.itemUuid)}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <span>Logs</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Action Button */}
                  {canManage && (
                    <div className="pt-3.5 mt-3.5 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                      <button
                        onClick={() => handleOpenAdjustModal(item)}
                        className="w-full py-2 rounded-xl bg-surface border border-primary/30 text-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/10 transition-all active:scale-95 shadow-sm"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Adjust / Use Stock</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD / EDIT EQUIPMENT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-[28px] border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    {editingItem ? 'Edit Academy Equipment' : 'Register New Equipment'}
                  </h3>
                  <p className="text-xs text-foreground/50">Configure item details, tracking quantity and threshold</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yonex Mavis 350 (Yellow), Agility Cones Set"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Unit Type
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Quantity In Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Low Stock Alert At
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinThreshold}
                    onChange={(e) => setFormMinThreshold(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Storage Location / Locker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Court 1 Cabinet, Coach Shelf"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                    Cost Per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1250"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Notes &amp; Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional supplier details, batch numbers or usage instructions..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary resize-none"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          QUICK STOCK ADJUSTMENT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {isAdjustModalOpen && selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-[28px] border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">Quick Stock Update</span>
                <h3 className="text-base font-black text-foreground truncate max-w-[280px]">
                  {selectedItemForAdjust.itemName}
                </h3>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              {/* Current Quantity Badge */}
              <div
                className="p-3.5 rounded-2xl border flex items-center justify-between"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-bold text-foreground/60">Current Quantity</span>
                <span className="text-base font-black font-mono text-foreground">
                  {selectedItemForAdjust.quantity} {selectedItemForAdjust.unit}
                </span>
              </div>

              {/* Action Type Selection */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-2">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustChangeType('CONSUMED')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustChangeType === 'CONSUMED'
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                        : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                    <span>Used / Consumed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustChangeType('RESTOCK')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustChangeType === 'RESTOCK'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span>Restock / Add</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustChangeType('DAMAGED')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustChangeType === 'DAMAGED'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Broken / Damaged</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustChangeType('ADJUSTMENT')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustChangeType === 'ADJUSTMENT'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-surface border-transparent text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                    <span>Recount Audit</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Quantity To {adjustChangeType === 'RESTOCK' ? 'Add' : 'Deduct'} ({selectedItemForAdjust.unit})
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 5, 10].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustAmount(String(preset))}
                      className="px-3 py-1.5 rounded-lg border bg-surface text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      {preset}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border bg-surface text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary text-right"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              {/* Coach / Staff Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Coach / Student Involved (Optional)
                </label>
                <select
                  value={adjustMemberUuid}
                  onChange={(e) => setAdjustMemberUuid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <option value="">General Academy Stock</option>
                  {members.map((m) => (
                    <option key={m.organizationMemberUuid} value={m.organizationMemberUuid}>
                      {m.fullName || 'Coach / Member'} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 block mb-1.5">
                  Reason / Session Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning Elite Batch Sparring Session"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border bg-surface text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm Stock Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          HISTORY & LOGS DRAWER
         ══════════════════════════════════════════════════════════════════════ */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full bg-card border-l p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">Stock Movement Audit</h3>
                    <p className="text-xs text-foreground/50">Recent consumption &amp; refill logs</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Log List */}
              <div className="overflow-y-auto max-h-[calc(100vh-160px)] space-y-3 pr-1 hide-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-center py-16 text-foreground/40 text-xs font-semibold">
                    No stock movement history recorded yet.
                  </div>
                ) : (
                  logs.map((log) => {
                    const isPositive = log.quantityChange > 0;
                    return (
                      <div
                        key={log.logUuid || log.logId}
                        className="p-3.5 rounded-2xl border bg-surface/60 space-y-1.5"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-foreground line-clamp-1">
                            {log.itemName || 'Equipment Item'}
                          </span>
                          <span
                            className={`text-xs font-black font-mono px-2 py-0.5 rounded-full ${
                              isPositive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isPositive ? `+${log.quantityChange}` : log.quantityChange} {log.unit || ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-foreground/50">
                          <span>{log.changeType}</span>
                          <span>After: {log.quantityAfter}</span>
                        </div>

                        {log.notes && <p className="text-[11px] text-foreground/70 italic">"{log.notes}"</p>}

                        <div className="flex items-center justify-between text-[9px] text-foreground/40 pt-1 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                          <span>Logged by: {log.loggedByName || 'Staff'}</span>
                          <span>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              onClick={() => setIsLogDrawerOpen(false)}
              className="w-full py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              Close History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
