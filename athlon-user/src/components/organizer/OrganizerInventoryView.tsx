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
  History,
  MapPin,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Boxes,
  TrendingUp,
  Check,
  ChevronRight,
  ShieldAlert,
  IndianRupee,
  Activity,
  Trophy,
  Shirt,
  Tablet,
  Flag,
  HeartPulse,
  Share2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';
import {
  OrganizerInventoryItem,
  OrganizerInventoryLog,
  OrganizerInventorySummary,
  OrganizerInventoryService,
  CreateOrganizerInventoryPayload,
  UpdateOrganizerInventoryPayload,
  AdjustOrganizerStockPayload,
} from '@/lib/api/organizerInventory';
import { useOrgRole } from '@/hooks/use-org-role';
import { usePermissions } from '@/hooks/use-permissions';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

interface OrganizerInventoryViewProps {
  orgUuid: string;
  orgName: string;
}

const CATEGORIES = [
  { id: 'MATCH_GEAR', label: 'Match Gear & Shuttles', icon: '🏸', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'TROPHIES_AWARDS', label: 'Trophies & Medals', icon: '🏆', color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { id: 'PLAYER_KITS', label: 'Player Kits & Bibs', icon: '👕', color: 'from-purple-500/20 to-purple-600/10 text-purple-400' },
  { id: 'COURT_ASSETS', label: 'Court Tablets & Tech', icon: '📱', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'BRANDING_MEDIA', label: 'Banners & Branding', icon: '🚩', color: 'from-rose-500/20 to-rose-600/10 text-rose-400' },
  { id: 'FIRST_AID_SAFETY', label: 'First Aid & Medical', icon: '🩹', color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400' },
  { id: 'OTHER', label: 'Other Logistics', icon: '📦', color: 'from-slate-500/20 to-slate-600/10 text-slate-400' },
];

const UNITS = ['Tubes', 'Pieces', 'Sets', 'Boxes', 'Pairs', 'Kits', 'Bottles', 'Rolls', 'Units'];

export default function OrganizerInventoryView({ orgUuid, orgName }: OrganizerInventoryViewProps) {
  const { role, isAdmin } = useOrgRole(orgUuid);
  const { canManageModule } = usePermissions(orgUuid);
  const canManage = canManageModule('inventory') || isAdmin;

  const [items, setItems] = useState<OrganizerInventoryItem[]>([]);
  const [summary, setSummary] = useState<OrganizerInventorySummary | null>(null);
  const [logs, setLogs] = useState<OrganizerInventoryLog[]>([]);
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
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<OrganizerInventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<OrganizerInventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Add / Edit Item
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('MATCH_GEAR');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formMinThreshold, setFormMinThreshold] = useState('5');
  const [formUnit, setFormUnit] = useState('Units');
  const [formLocation, setFormLocation] = useState('');
  const [formUnitCost, setFormUnitCost] = useState('');
  const [formConditionStatus, setFormConditionStatus] = useState('NEW');
  const [formIsRental, setFormIsRental] = useState(false);
  const [formReturnDueDate, setFormReturnDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Form State for Stock Adjustment & Allocation
  const [adjustChangeType, setAdjustChangeType] = useState<
    'RESTOCK' | 'CONSUMED_MATCH' | 'ALLOCATED_TO_COURT' | 'DISTRIBUTED_TO_TEAM' | 'DAMAGED_LOST' | 'RETURNED' | 'ADJUSTMENT'
  >('ALLOCATED_TO_COURT');
  const [adjustAmount, setAdjustAmount] = useState('1');
  const [adjustCourtNumber, setAdjustCourtNumber] = useState('Court 1');
  const [adjustRecipientName, setAdjustRecipientName] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  useEffect(() => {
    if (orgUuid) {
      loadData();
    }
  }, [orgUuid, selectedCategory, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const catParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;

      const [itemsRes, sumRes] = await Promise.allSettled([
        OrganizerInventoryService.getItems(orgUuid, catParam, statusParam),
        OrganizerInventoryService.getSummary(orgUuid),
      ]);

      if (itemsRes.status === 'fulfilled') {
        setItems(itemsRes.value);
      }

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value);
      }
    } catch (err) {
      console.error('Failed to load tournament inventory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('MATCH_GEAR');
    setFormQuantity('1');
    setFormMinThreshold('5');
    setFormUnit('Units');
    setFormLocation('');
    setFormUnitCost('');
    setFormConditionStatus('NEW');
    setFormIsRental(false);
    setFormReturnDueDate('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: OrganizerInventoryItem) => {
    setEditingItem(item);
    setFormName(item.itemName);
    setFormCategory(item.category);
    setFormQuantity(item.quantity.toString());
    setFormMinThreshold(item.minThreshold.toString());
    setFormUnit(item.unit);
    setFormLocation(item.location || '');
    setFormUnitCost(item.unitCost ? item.unitCost.toString() : '');
    setFormConditionStatus(item.conditionStatus || 'NEW');
    setFormIsRental(item.isRental || false);
    setFormReturnDueDate(item.returnDueDate || '');
    setFormNotes(item.notes || '');
    setIsAddModalOpen(true);
  };

  const openAdjustModal = (item: OrganizerInventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustChangeType('ALLOCATED_TO_COURT');
    setAdjustAmount('1');
    setAdjustCourtNumber('Court 1');
    setAdjustRecipientName('');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const openLogDrawer = async (itemUuid?: string) => {
    setIsLogDrawerOpen(true);
    try {
      const logsRes = await OrganizerInventoryService.getLogs(orgUuid, itemUuid);
      setLogs(logsRes);
    } catch (err) {
      console.error('Failed to load inventory logs:', err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setSubmitting(true);
      if (editingItem) {
        await OrganizerInventoryService.updateItem({
          itemUuid: editingItem.itemUuid,
          itemName: formName.trim(),
          category: formCategory,
          quantity: parseInt(formQuantity || '0', 10),
          minThreshold: parseInt(formMinThreshold || '5', 10),
          unit: formUnit,
          location: formLocation.trim() || undefined,
          unitCost: formUnitCost ? parseFloat(formUnitCost) : undefined,
          conditionStatus: formConditionStatus,
          isRental: formIsRental,
          returnDueDate: formReturnDueDate || undefined,
          notes: formNotes.trim() || undefined,
        });
        setToastMessage('Item updated successfully!');
      } else {
        const payload: CreateOrganizerInventoryPayload = {
          organizationUuid: orgUuid,
          itemName: formName.trim(),
          category: formCategory,
          quantity: parseInt(formQuantity || '0', 10),
          minThreshold: parseInt(formMinThreshold || '5', 10),
          unit: formUnit,
          location: formLocation.trim() || undefined,
          unitCost: formUnitCost ? parseFloat(formUnitCost) : undefined,
          conditionStatus: formConditionStatus,
          isRental: formIsRental,
          returnDueDate: formReturnDueDate || undefined,
          notes: formNotes.trim() || undefined,
        };
        await OrganizerInventoryService.createItem(payload);
        setToastMessage('Tournament asset registered in inventory!');
      }

      setIsAddModalOpen(false);
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to save item:', err);
      setToastMessage('Failed to save asset. Please retry.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    const qty = parseInt(adjustAmount, 10);
    if (isNaN(qty) || qty <= 0) return;

    const isDeduction =
      adjustChangeType === 'CONSUMED_MATCH' ||
      adjustChangeType === 'ALLOCATED_TO_COURT' ||
      adjustChangeType === 'DISTRIBUTED_TO_TEAM' ||
      adjustChangeType === 'DAMAGED_LOST';

    const signedChange = isDeduction ? -qty : qty;

    try {
      setSubmitting(true);
      const payload: AdjustOrganizerStockPayload = {
        itemUuid: selectedItemForAdjust.itemUuid,
        changeType: adjustChangeType,
        quantityChange: signedChange,
        courtNumber: adjustChangeType === 'ALLOCATED_TO_COURT' ? adjustCourtNumber : undefined,
        recipientName: adjustChangeType === 'DISTRIBUTED_TO_TEAM' ? adjustRecipientName : undefined,
        notes: adjustNotes.trim() || undefined,
      };

      await OrganizerInventoryService.adjustStock(payload);
      setToastMessage(`Stock updated: ${signedChange > 0 ? '+' : ''}${signedChange} ${selectedItemForAdjust.unit}`);
      setIsAdjustModalOpen(false);
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      setToastMessage('Failed to adjust stock.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemUuid: string) => {
    if (!confirm('Are you sure you want to remove this item from tournament inventory?')) return;

    try {
      await OrganizerInventoryService.deleteItem(itemUuid);
      setItems((prev) => prev.filter((i) => i.itemUuid !== itemUuid));
      setToastMessage('Item removed from inventory.');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  // Category counts for quick tabs
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((it) => {
      map[it.category] = (map[it.category] || 0) + 1;
    });
    return map;
  }, [items]);

  const totalQuantityDisplay = summary?.totalQuantity ?? items.reduce((acc, i) => acc + (i.quantity || 0), 0);
  const estimatedValueDisplay = summary?.estimatedTotalValue ?? items.reduce((acc, i) => acc + (i.unitCost ? i.unitCost * i.quantity : 0), 0);
  const inStockCount = summary?.inStockCount ?? items.filter((i) => i.status === 'IN_STOCK').length;
  const lowStockCount = summary?.lowStockCount ?? items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = summary?.outOfStockCount ?? items.filter((i) => i.status === 'OUT_OF_STOCK' || i.quantity <= 0).length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[110] flex items-center gap-2.5 bg-emerald-950/95 border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-full shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW (STYLISH, THEME-ALIGNED MOBILE FIRST INTERFACE)            */}
      {/* ========================================================================= */}
      <div className="block md:hidden p-3.5 space-y-4 animate-in fade-in duration-300">
        
        {/* 1. Mobile Header App Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                boxShadow: '0 4px 20px var(--athlon-glow, rgba(0,0,0,0.1))',
              }}
            >
              <Athlon3DIcon type="inventory" size={34} active={true} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black tracking-tight truncate"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Tournament Vault
                </h1>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              </div>
              <p
                className="text-[11px] font-semibold truncate"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                {orgName} • {items.length} gear types
              </p>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => openLogDrawer()}
              className="p-2.5 rounded-xl border active:scale-95 transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Audit Logs"
            >
              <History className="w-4 h-4 text-primary" />
              <span className="text-[11px]">Logs</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border active:scale-95 transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Mobile Tactical Hero HUD Card */}
        <div
          className="relative overflow-hidden rounded-[26px] border p-4 shadow-lg space-y-3.5"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          {/* Top Info Strip */}
          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="w-3 h-3" />
              Organizer Vault
            </span>
            {estimatedValueDisplay > 0 && (
              <span
                className="text-[11px] font-black font-mono"
                style={{ color: 'var(--athlon-text-secondary)' }}
              >
                Valuation: ₹{Number(estimatedValueDisplay).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Big Number Counter & Quick Add Button */}
          <div className="relative flex items-baseline justify-between gap-2">
            <div>
              <div className="text-3xl font-black text-primary tracking-tight font-mono">
                {totalQuantityDisplay}
              </div>
              <div
                className="text-xs font-bold mt-0.5"
                style={{ color: 'var(--athlon-text-secondary)' }}
              >
                Total Tournament Assets in Vault
              </div>
            </div>
            
            {canManage && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl text-black text-xs font-black tracking-wide flex items-center gap-1.5 hover:opacity-90 active:scale-95 shadow-md shadow-primary/25 shrink-0 transition-all bg-primary"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Asset
              </button>
            )}
          </div>

          {/* Interactive 3-Pill Stock Health Toggles */}
          <div
            className="relative grid grid-cols-3 gap-2 pt-2 border-t"
            style={{ borderColor: 'var(--athlon-border-subtle, var(--athlon-border))' }}
          >
            {/* In Stock */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'IN_STOCK' ? 'ALL' : 'IN_STOCK')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedStatus === 'IN_STOCK'
                  ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400">Ready</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-400 mt-1 font-mono">{inStockCount}</div>
            </button>

            {/* Low Stock */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedStatus === 'LOW_STOCK'
                  ? 'bg-amber-500/25 border-amber-500/50 ring-2 ring-amber-500/30'
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-amber-400">Low</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <div className="text-lg font-black text-amber-400 mt-1 font-mono">{lowStockCount}</div>
            </button>

            {/* Out of Stock */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedStatus === 'OUT_OF_STOCK'
                  ? 'bg-rose-500/25 border-rose-500/50 ring-2 ring-rose-500/30'
                  : 'bg-rose-500/10 border-rose-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-rose-400">Out</span>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
              </div>
              <div className="text-lg font-black text-rose-400 mt-1 font-mono">{outOfStockCount}</div>
            </button>
          </div>
        </div>

        {/* 3. Mobile Category Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-3.5 px-3.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border ${
              selectedCategory === 'ALL'
                ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20'
                : 'text-foreground/70 border-transparent hover:border-white/10'
            }`}
            style={selectedCategory !== 'ALL' ? { backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' } : {}}
          >
            All ({items.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 font-black'
                    : 'text-foreground/70'
                }`}
                style={!isSelected ? { backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' } : {}}
              >
                <span>{cat.icon}</span>
                <span className="truncate max-w-[120px]">{cat.label.split('&')[0]}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/60'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. Mobile Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search match shuttles, trophies, bibs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
          />
        </div>

        {/* 5. Mobile Cards List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <p className="text-[11px] font-black uppercase tracking-wider text-foreground/40">Loading Vault Assets</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="py-12 px-4 rounded-3xl border text-center space-y-3"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto">
              📦
            </div>
            <p className="text-xs text-foreground/60">No items match your filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
              const isLowStock = item.status === 'LOW_STOCK';
              const isOutOfStock = item.status === 'OUT_OF_STOCK' || item.quantity <= 0;

              return (
                <div
                  key={item.itemUuid}
                  className="rounded-[22px] border p-4 shadow-md relative overflow-hidden space-y-3 transition-all active:scale-[0.99]"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* Top Status Glow Bar */}
                  <div
                    className={`h-1 w-full absolute top-0 left-0 right-0 ${
                      isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />

                  {/* Top Header: Icon, Name & Badges */}
                  <div className="flex items-start justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        {catObj.icon}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="text-sm font-black truncate leading-snug"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {item.itemName}
                        </h3>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider block"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          {catObj.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          In Stock
                        </span>
                      )}
                      {item.isRental && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          Rental
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Level Counter Box */}
                  <div
                    className="p-2.5 rounded-xl border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-foreground/40 block">
                        Available Count
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-xl font-black font-mono ${
                            isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-primary'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-foreground/60">{item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-foreground/40 block">
                        Min Threshold
                      </span>
                      <span className="text-xs font-bold text-foreground/70">
                        {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Location & Details row */}
                  <div className="flex items-center justify-between text-[11px] text-foreground/60">
                    <div className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{item.location || 'Main Vault'}</span>
                    </div>

                    {item.unitCost && (
                      <span className="font-bold font-mono text-foreground/80">
                        ₹{(item.unitCost * item.quantity).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Mobile Action Buttons */}
                  <div
                    className="flex items-center justify-between gap-2 pt-2 border-t"
                    style={{ borderColor: 'var(--athlon-border-subtle, var(--athlon-border))' }}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openLogDrawer(item.itemUuid)}
                        className="p-2 rounded-xl border text-foreground/60 hover:text-foreground active:scale-95 transition-all"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        title="History"
                      >
                        <History className="w-3.5 h-3.5 text-primary" />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-xl border text-foreground/60 hover:text-foreground active:scale-95 transition-all"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {canManage && (
                      <button
                        onClick={() => openAdjustModal(item)}
                        className="flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-primary text-black flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 transition-all"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Allocate / Adjust</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP VIEW (EXPANSIVE HIGH-DENSITY DASHBOARD)                         */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        {/* Top Hero Header & Metrics */}
        <div className="relative border-b overflow-hidden" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="absolute top-0 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 pb-6 relative z-10 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 border"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <Athlon3DIcon type="inventory" size={40} active={true} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                      Tournament Inventory &amp; Logistics
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/25">
                      Organizer Vault
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    Manage match balls, shuttles, trophies, player kits, court tablets &amp; arena assets.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => openLogDrawer()}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <History className="w-4 h-4 text-primary" />
                  <span>Audit Trail</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-xl border text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                </button>

                {canManage && (
                  <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-primary hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Asset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Metrics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div
                className="p-4 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">Total Assets</span>
                  <Boxes className="w-4 h-4 text-primary" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground">{totalQuantityDisplay}</span>
                  <span className="text-xs text-foreground/40 font-bold">across {items.length} types</span>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">In Stock Ready</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">{inStockCount}</span>
                  <span className="text-xs text-emerald-400/60 font-bold">categories</span>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">Low Stock Alarms</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400">{lowStockCount}</span>
                  <span className="text-xs text-amber-400/60 font-bold">need restock</span>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border flex flex-col justify-between"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">Asset Valuation</span>
                  <IndianRupee className="w-4 h-4 text-primary" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">
                    ₹{Number(estimatedValueDisplay).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-foreground/40 font-bold">Est. Value</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Body Filters & Grid */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-6 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border ${
                selectedCategory === 'ALL'
                  ? 'bg-primary text-black border-primary shadow-md shadow-primary/20'
                  : 'bg-surface text-foreground/70 border-white/5 hover:border-white/20'
              }`}
            >
              All Assets ({items.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 font-black'
                      : 'bg-surface text-foreground/70 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gear, trophies, bibs, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border text-xs text-foreground bg-surface border-white/10 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 font-bold shrink-0">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold text-foreground bg-surface border-white/10 focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Desktop Cards Grid */}
          <div className="grid grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
              const isLowStock = item.status === 'LOW_STOCK';
              const isOutOfStock = item.status === 'OUT_OF_STOCK' || item.quantity <= 0;

              return (
                <div
                  key={item.itemUuid}
                  className="rounded-2xl border p-5 flex flex-col justify-between group hover:border-primary/40 shadow-lg relative overflow-hidden transition-all"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div
                    className={`h-1 w-full absolute top-0 left-0 right-0 ${
                      isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />

                  <div className="space-y-3 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{catObj.icon}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                            {item.itemName}
                          </h3>
                          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                            {catObj.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            In Stock
                          </span>
                        )}
                        {item.isRental && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            Rental
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="p-3 rounded-xl border flex items-center justify-between"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">
                          Available Count
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`text-2xl font-black font-mono ${
                              isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-foreground'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <span className="text-xs font-bold text-foreground/60">{item.unit}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">
                          Threshold
                        </span>
                        <span className="text-xs font-bold text-foreground/60">Min {item.minThreshold} {item.unit}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-foreground/70 pt-1">
                      {item.location && (
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}

                      {item.unitCost && (
                        <div className="flex items-center justify-between text-[11px] text-foreground/50">
                          <span>Unit Cost: ₹{item.unitCost.toLocaleString('en-IN')}</span>
                          <span className="font-bold text-foreground/70">
                            Total: ₹{(item.unitCost * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openLogDrawer(item.itemUuid)}
                        className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5"
                        title="View history logs"
                      >
                        <History className="w-4 h-4 text-primary" />
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/5"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.itemUuid)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-white/5"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {canManage && (
                      <button
                        onClick={() => openAdjustModal(item)}
                        className="px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-surface border border-primary/40 text-primary hover:bg-primary hover:text-black active:scale-95 transition-all flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Allocate / Adjust</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 1: ADD / EDIT TOURNAMENT ASSET (PREMIUM MOBILE-FIRST MODAL)
         ══════════════════════════════════════════════════════════════════════════ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-t-[36px] sm:rounded-[32px] border p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Mobile Drag Indicator */}
            <div className="w-14 h-1.5 bg-white/20 rounded-full mx-auto sm:hidden mb-1" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center shadow-inner shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground">
                    {editingItem ? 'Edit Tournament Asset' : 'Register Tournament Asset'}
                  </h3>
                  <p className="text-[11px] text-foreground/50 font-medium">
                    {editingItem ? 'Update asset parameters & inventory quotas' : 'Track tournament gear, equipment & court assets'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/10 active:scale-95 transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span>Item Name</span>
                  <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yonex AS-30 Feather Shuttles, Winner Trophy Gold"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Category</span>
                    <span className="text-primary">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <Boxes className="w-3.5 h-3.5 text-primary" />
                    <span>Unit Type</span>
                    <span className="text-primary">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Count & Low Stock Alert */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <Boxes className="w-3.5 h-3.5 text-primary" />
                    <span>Initial Count</span>
                    <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      required
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border text-sm sm:text-base font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-foreground/40 pointer-events-none">
                      {formUnit}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Low Stock Alert</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={formMinThreshold}
                      onChange={(e) => setFormMinThreshold(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border text-sm sm:text-base font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-amber-400/60 pointer-events-none">
                      Min
                    </span>
                  </div>
                </div>
              </div>

              {/* Location & Unit Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>Storage / Desk Location</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Desk 1, Arena Store, Court 3 Rack"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unit Cost (₹)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground/40 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 1850"
                      value={formUnitCost}
                      onChange={(e) => setFormUnitCost(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border text-xs sm:text-sm font-mono font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Luxury Rental Asset Switch Card */}
              <div
                className="p-4 rounded-2xl border space-y-3 transition-all cursor-pointer"
                style={{
                  backgroundColor: formIsRental ? 'rgba(var(--primary-rgb, 16, 185, 129), 0.05)' : 'var(--athlon-surface)',
                  borderColor: formIsRental ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                }}
                onClick={() => setFormIsRental(!formIsRental)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                      formIsRental 
                        ? 'bg-primary/20 border-primary text-primary shadow-sm' 
                        : 'bg-white/5 border-white/10 text-foreground/40'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-foreground">Is this a Rented / Borrowed Asset?</p>
                      <p className="text-[10px] sm:text-[11px] text-foreground/50">Track supplier return deadlines & borrow status</p>
                    </div>
                  </div>

                  {/* Animated Pill Switch */}
                  <div
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                      formIsRental ? 'bg-primary' : 'bg-white/15'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black shadow-md transform transition-transform duration-200 ease-in-out ${
                        formIsRental ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white/70'
                      }`}
                    />
                  </div>
                </div>

                {formIsRental && (
                  <div
                    className="pt-2 border-t mt-2 animate-in fade-in slide-in-from-top-1 duration-200"
                    style={{ borderColor: 'var(--athlon-border)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 flex items-center gap-1 mb-1.5">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span>Return Due Date</span>
                    </label>
                    <input
                      type="date"
                      value={formReturnDueDate}
                      onChange={(e) => setFormReturnDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                )}
              </div>

              {/* Notes & Description */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Notes &amp; Operational Specs</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Specific to finals, allocated for court umpires..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[1.4] py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-primary via-emerald-400 to-primary hover:opacity-95 active:scale-[0.98] shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingItem ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Update Asset</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Register Asset</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 2: QUICK ALLOCATION & STOCK ADJUST (PREMIUM MOBILE-FIRST MODAL)
         ══════════════════════════════════════════════════════════════════════════ */}
      {isAdjustModalOpen && selectedItemForAdjust && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-t-[36px] sm:rounded-[32px] border p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] space-y-4 max-h-[92vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="w-14 h-1.5 bg-white/20 rounded-full mx-auto sm:hidden mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary shadow-inner shrink-0">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-foreground">Stock Allocation</h3>
                  <p className="text-xs font-semibold text-foreground/50 truncate max-w-[200px] sm:max-w-xs">
                    {selectedItemForAdjust.itemName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/10 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Vault Stock Banner */}
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between shadow-sm"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground/60">Current Vault Balance:</span>
              </div>
              <span className="text-base font-black text-primary font-mono bg-primary/10 px-2.5 py-0.5 rounded-lg border border-primary/20">
                {selectedItemForAdjust.quantity} {selectedItemForAdjust.unit}
              </span>
            </div>

            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  <span>Action / Allocation Type</span>
                  <span className="text-primary">*</span>
                </label>
                <select
                  value={adjustChangeType}
                  onChange={(e) => setAdjustChangeType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <option value="ALLOCATED_TO_COURT">🚀 Allocate to Court / Umpire (Deduct)</option>
                  <option value="DISTRIBUTED_TO_TEAM">🎁 Distribute to Team / Player (Deduct)</option>
                  <option value="CONSUMED_MATCH">🎾 Match Consumption (Deduct)</option>
                  <option value="RESTOCK">📦 Restock / New Delivery (Add)</option>
                  <option value="DAMAGED_LOST">⚠️ Damaged / Lost (Deduct)</option>
                  <option value="RETURNED">🔄 Returned from Court (Add)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                  <Boxes className="w-3.5 h-3.5 text-primary" />
                  <span>Quantity ({selectedItemForAdjust.unit})</span>
                  <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-base font-mono font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {adjustChangeType === 'ALLOCATED_TO_COURT' && (
                <div className="animate-in fade-in duration-150">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <Trophy className="w-3.5 h-3.5 text-primary" />
                    <span>Target Court / Table</span>
                    <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Court 1, Court 2, Umpire Desk"
                    value={adjustCourtNumber}
                    onChange={(e) => setAdjustCourtNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              )}

              {adjustChangeType === 'DISTRIBUTED_TO_TEAM' && (
                <div className="animate-in fade-in duration-150">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Recipient Team / Player Name</span>
                    <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore Smashers, Rahul M."
                    value={adjustRecipientName}
                    onChange={(e) => setAdjustRecipientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Remarks / Audit Note</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semi-finals batch, tournament day 1 handout"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[1.4] py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-primary via-emerald-400 to-primary hover:opacity-95 active:scale-[0.98] shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Allocating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Allocation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          DRAWER: AUDIT LEDGER & ALLOCATION HISTORY (RESPONSIVE)
         ══════════════════════════════════════════════════════════════════════════ */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md h-full border-l p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-foreground">Audit &amp; Distribution Trail</h3>
                    <p className="text-xs text-foreground/50">Live inventory movement history</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLogDrawerOpen(false)}
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <History className="w-8 h-8 text-foreground/20 mx-auto" />
                  <p className="text-xs font-bold text-foreground/40">No allocation or adjustment logs recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    const isPositive = log.quantityChange > 0;
                    return (
                      <div
                        key={log.logUuid || log.logId}
                        className="p-4 rounded-2xl border space-y-2 shadow-sm"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black text-foreground truncate max-w-[200px]">
                            {log.itemName || 'Tournament Item'}
                          </span>
                          <span
                            className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full ${
                              isPositive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isPositive ? `+${log.quantityChange}` : log.quantityChange} {log.unit || 'Units'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-foreground/70 font-semibold flex-wrap">
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            {log.changeType?.replace(/_/g, ' ')}
                          </span>
                          {log.courtNumber && <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">📍 {log.courtNumber}</span>}
                          {log.recipientName && <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5">👤 To: {log.recipientName}</span>}
                        </div>

                        {log.notes && (
                          <p className="text-[11px] text-foreground/60 italic bg-black/20 p-2 rounded-xl">
                            "{log.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] font-medium text-foreground/40 pt-1.5 border-t border-white/5">
                          <span className="flex items-center gap-1"><User className="w-3 h-3 text-primary/60" /> {log.loggedByName || 'Staff'}</span>
                          <span>{log.createdAt ? new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t mt-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <button
                onClick={() => setIsLogDrawerOpen(false)}
                className="w-full py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground hover:bg-white/5 active:scale-95 transition-all"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
