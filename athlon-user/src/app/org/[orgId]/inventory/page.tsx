'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  ClubInventoryService,
  ClubInventoryItem,
  ClubInventoryLog,
  InventorySummary,
  CreateInventoryItemPayload,
  AdjustStockPayload
} from '@/lib/api/clubInventory';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService } from '@/lib/api/user';
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
  DollarSign,
  Layers,
  BarChart3,
  Lock,
  Boxes,
  TrendingUp,
  Check,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useOrgRole } from '@/hooks/use-org-role';

const CATEGORIES = [
  { id: 'SHUTTLES', label: 'Shuttles & Tubes', icon: '🏸', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'BALLS', label: 'Balls', icon: '⚽', color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { id: 'RACQUETS', label: 'Racquets & Paddles', icon: '🎾', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'APPAREL', label: 'Bibs & Apparel', icon: '🎽', color: 'from-purple-500/20 to-purple-600/10 text-purple-400' },
  { id: 'MEDICAL', label: 'First Aid & Medical', icon: '⚕️', color: 'from-rose-500/20 to-rose-600/10 text-rose-400' },
  { id: 'TRAINING_GEAR', label: 'Training Cones & Ladders', icon: '🔺', color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400' },
  { id: 'NETS_POSTS', label: 'Nets & Court Hardware', icon: '🥅', color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400' },
  { id: 'OTHER', label: 'Other Supplies', icon: '📦', color: 'from-slate-500/20 to-slate-600/10 text-slate-400' }
];

const UNITS = ['Tubes', 'Pieces', 'Sets', 'Boxes', 'Pairs', 'Bottles', 'Units'];

export default function InventoryPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const orgUuid = (org?.id || orgIdParam) as string;
  const { role, isAdmin, canManage } = useOrgRole(orgUuid);

  const [items, setItems] = useState<ClubInventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [logs, setLogs] = useState<ClubInventoryLog[]>([]);
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
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<ClubInventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<ClubInventoryItem | null>(null);
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
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  useEffect(() => {
    if (orgUuid) {
      loadData();
      OrganizationService.getMembers(orgUuid).then((res) => {
        const memList = Array.isArray(res) ? res : ((res as any)?.data || []);
        setMembers(memList);
      }).catch(() => {});
    }
  }, [orgUuid, selectedCategory, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const catParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus;

      const [itemsRes, sumRes] = await Promise.allSettled([
        ClubInventoryService.getItems(orgUuid, catParam, statusParam),
        ClubInventoryService.getSummary(orgUuid)
      ]);

      if (itemsRes.status === 'fulfilled') {
        const list = Array.isArray(itemsRes.value) ? itemsRes.value : ((itemsRes.value as any)?.data || []);
        setItems(list);
      }

      if (sumRes.status === 'fulfilled') {
        const sum = (sumRes.value as any)?.data || sumRes.value;
        setSummary(sum);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openAddModal = (itemToEdit?: ClubInventoryItem) => {
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

  const openAdjustModal = (item: ClubInventoryItem, defaultType: 'CONSUMED' | 'RESTOCK' = 'CONSUMED') => {
    setSelectedItemForAdjust(item);
    setAdjustChangeType(defaultType);
    setAdjustAmount('1');
    setAdjustMemberUuid('');
    setAdjustNotes('');
    setIsMemberDropdownOpen(false);
    setMemberSearchQuery('');
    setIsAdjustModalOpen(true);
  };

  const openLogDrawer = async () => {
    try {
      setIsLogDrawerOpen(true);
      const res = await ClubInventoryService.getLogs(orgUuid);
      const logList = Array.isArray(res) ? res : ((res as any)?.data || []);
      setLogs(logList);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setSubmitting(true);
      if (editingItem) {
        await ClubInventoryService.updateItem({
          itemUuid: editingItem.itemUuid,
          itemName: formName.trim(),
          category: formCategory,
          quantity: parseInt(formQuantity || '0', 10),
          minThreshold: parseInt(formMinThreshold || '5', 10),
          unit: formUnit,
          location: formLocation.trim() || undefined,
          unitCost: formUnitCost ? parseFloat(formUnitCost) : undefined,
          notes: formNotes.trim() || undefined
        });
        setToastMessage('Item updated successfully!');
      } else {
        const payload: CreateInventoryItemPayload = {
          organizationUuid: orgUuid,
          itemName: formName.trim(),
          category: formCategory,
          quantity: parseInt(formQuantity || '0', 10),
          minThreshold: parseInt(formMinThreshold || '5', 10),
          unit: formUnit,
          location: formLocation.trim() || undefined,
          unitCost: formUnitCost ? parseFloat(formUnitCost) : undefined,
          notes: formNotes.trim() || undefined
        };
        await ClubInventoryService.createItem(payload);
        setToastMessage('Item added to inventory!');
      }

      setIsAddModalOpen(false);
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust || !adjustAmount || parseInt(adjustAmount, 10) <= 0) return;

    try {
      setSubmitting(true);
      const qtyNum = parseInt(adjustAmount, 10);
      const multiplier = (adjustChangeType === 'CONSUMED' || adjustChangeType === 'DAMAGED') ? -1 : 1;
      const change = qtyNum * multiplier;

      const payload: AdjustStockPayload = {
        itemUuid: selectedItemForAdjust.itemUuid,
        changeType: adjustChangeType,
        quantityChange: change,
        memberUuid: adjustMemberUuid && adjustMemberUuid.trim() !== '' ? adjustMemberUuid.trim() : undefined,
        notes: adjustNotes.trim() || undefined
      };

      await ClubInventoryService.adjustStock(payload);
      setIsAdjustModalOpen(false);
      setToastMessage(`Stock updated: ${change > 0 ? `+${change}` : change} ${selectedItemForAdjust.unit || 'units'}`);
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickChange = async (item: ClubInventoryItem, diff: number) => {
    try {
      const payload: AdjustStockPayload = {
        itemUuid: item.itemUuid,
        changeType: diff > 0 ? 'RESTOCK' : 'CONSUMED',
        quantityChange: diff,
        notes: diff > 0 ? 'Quick restock (+1)' : 'Quick match consumption (-1)'
      };
      await ClubInventoryService.adjustStock(payload);
      setToastMessage(`${diff > 0 ? `+${diff}` : diff} ${item.unit || 'unit'} updated!`);
      setTimeout(() => setToastMessage(null), 2500);
      loadData();
    } catch (err) {
      console.error('Failed quick change:', err);
    }
  };

  const handleDelete = async (itemUuid: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      await ClubInventoryService.deleteItem(itemUuid);
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
        (item.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchTerm, selectedCategory, selectedStatus]);

  // Category item counts for badges
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((it) => {
      map[it.category] = (map[it.category] || 0) + 1;
    });
    return map;
  }, [items]);

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
      {/* 📱 MOBILE VIEW (RE-DESIGNED EXCLUSIVELY FOR MOBILE SCREENS)               */}
      {/* ========================================================================= */}
      <div className="block md:hidden p-3.5 space-y-4 animate-in fade-in duration-300">
        
        {/* 1. Mobile Header App Bar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-lg shadow-inner shrink-0">
              📦
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-foreground tracking-tight truncate">
                  Gear & Vault
                </h1>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              </div>
              <p className="text-[11px] font-semibold text-foreground/50 truncate">
                {org?.name || 'Club Inventory'} • {items.length} items
              </p>
            </div>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={openLogDrawer}
              className="p-2.5 rounded-xl bg-surface border border-foreground/10 text-foreground/80 active:scale-95 transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
              title="Audit Logs"
            >
              <History className="w-4 h-4 text-primary" />
              <span className="text-[11px]">Logs</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-surface border border-foreground/10 text-foreground/70 active:scale-95 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Mobile Tactical Hero HUD Card */}
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-surface via-surface to-primary/5 border border-foreground/10 p-4 shadow-sm space-y-3.5">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          {/* Top Info Strip */}
          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="w-3 h-3" />
              Stock Overview
            </span>
            {summary && summary.estimatedTotalValue > 0 && (
              <span className="text-[11px] font-black text-foreground/60 font-mono">
                Est. ₹{summary.estimatedTotalValue.toLocaleString()}
              </span>
            )}
          </div>

          {/* Big Number Counter */}
          <div className="relative flex items-baseline justify-between gap-2">
            <div>
              <div className="text-3xl font-black text-primary tracking-tight font-mono">
                {summary?.totalQuantity ?? 0}
              </div>
              <div className="text-xs font-bold text-foreground/60 mt-0.5">
                Total Units across {summary?.totalCategories ?? 0} categories
              </div>
            </div>
            
            {canManage && (
              <button
                onClick={() => openAddModal()}
                className="px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black tracking-wide flex items-center gap-1.5 hover:opacity-90 active:scale-95 shadow-md shadow-primary/20 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Item
              </button>
            )}
          </div>

          {/* Interactive 3-Pill Stock Health Toggles */}
          <div className="relative grid grid-cols-3 gap-2 pt-1 border-t border-foreground/10">
            {/* In Stock */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'IN_STOCK' ? 'ALL' : 'IN_STOCK')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedStatus === 'IN_STOCK'
                  ? 'bg-emerald-500/20 border-emerald-500/40 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {summary?.inStockCount || 0}
              </div>
            </button>

            {/* Low Stock */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedStatus === 'LOW_STOCK'
                  ? 'bg-amber-500/20 border-amber-500/40 ring-2 ring-amber-500/30'
                  : 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Low
              </div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {summary?.lowStockCount || 0}
              </div>
            </button>

            {/* Out of Stock */}
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                selectedStatus === 'OUT_OF_STOCK'
                  ? 'bg-rose-500/20 border-rose-500/40 ring-2 ring-rose-500/30'
                  : 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Archive className="w-3 h-3" /> Out
              </div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {summary?.outOfStockCount || 0}
              </div>
            </button>
          </div>
        </div>

        {/* 3. Mobile Search & Filter Chips */}
        <div className="space-y-2">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search shuttles, balls, racquets, racks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-foreground/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-bold text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Scrolling Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedCategory === 'ALL'
                  ? 'bg-foreground text-background border-foreground shadow-sm'
                  : 'bg-surface border-foreground/5 text-foreground/60'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-75 font-mono">({items.length})</span>
            </button>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary text-black border-primary/30 shadow-sm'
                      : 'bg-surface border-foreground/5 text-foreground/60'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label.split(' ')[0]}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-black' : 'bg-foreground/5 text-foreground/50'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicator Tag */}
          {(selectedStatus !== 'ALL' || selectedCategory !== 'ALL' || searchTerm) && (
            <div className="flex items-center justify-between px-1 text-[11px] font-bold text-foreground/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>Showing filtered items:</span>
                {selectedStatus !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-foreground/10 text-foreground text-[10px] font-black uppercase">
                    {selectedStatus.replace('_', ' ')}
                  </span>
                )}
                {selectedCategory !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-black">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSearchTerm('');
                }}
                className="text-primary hover:underline text-[10px] font-black shrink-0"
              >
                Reset All
              </button>
            </div>
          )}
        </div>

        {/* 4. Mobile Inventory Cards Stream */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-3xl bg-surface border border-foreground/5 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/10" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-foreground/10 rounded-md w-3/4" />
                      <div className="h-3 bg-foreground/5 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-foreground/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-14 px-4 text-center space-y-3.5 bg-surface border border-foreground/5 rounded-[26px]">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-2xl">
                🏸
              </div>
              <div>
                <h3 className="text-sm font-black text-foreground">No Items Match Filter</h3>
                <p className="text-xs text-foreground/50 max-w-xs mx-auto mt-1">
                  Add shuttle boxes, court nets, medical kits, or adjust your active filters.
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => openAddModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-md shadow-primary/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Gear
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              const catObj = CATEGORIES.find((c) => c.id === item.category);
              const isOutOfStock = item.status === 'OUT_OF_STOCK' || item.quantity <= 0;
              const isLowStock = item.status === 'LOW_STOCK' && !isOutOfStock;
              const safeMax = Math.max(item.minThreshold * 2, 10);
              const fillPct = Math.min(100, Math.max(isOutOfStock ? 0 : 8, (item.quantity / safeMax) * 100));

              return (
                <div
                  key={`mobile-${item.itemUuid}`}
                  className="p-4 rounded-[24px] bg-surface border border-foreground/10 shadow-sm space-y-3 relative overflow-hidden"
                >
                  {/* Top Bar: Icon, Name, Category & Status Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${
                        catObj?.color || 'from-primary/20 to-primary/10 text-primary'
                      } border border-foreground/5 shadow-inner`}>
                        {catObj?.icon || '📦'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-foreground truncate leading-tight">
                          {item.itemName}
                        </h3>
                        <div className="text-[11px] font-medium text-foreground/50 truncate flex items-center gap-1.5 mt-0.5">
                          <span>{catObj?.label || item.category}</span>
                          {item.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-foreground/70 font-semibold truncate">
                                <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                                {item.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      isOutOfStock
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : isLowStock
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isOutOfStock ? 'Depleted' : isLowStock ? 'Low Stock' : 'Ready'}
                    </span>
                  </div>

                  {/* Stock Gauge & Quantity Display */}
                  <div className="p-3 rounded-2xl bg-background/80 border border-foreground/5 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="text-[11px] font-bold text-foreground/50 flex items-center gap-1">
                        <span>Current Available:</span>
                      </div>
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className={`text-xl font-black ${
                          isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-primary'
                        }`}>
                          {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-foreground/50">
                          {item.unit || 'Units'}
                        </span>
                      </div>
                    </div>

                    {/* Gauge Bar */}
                    <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOutOfStock ? 'bg-rose-500 w-0' : isLowStock ? 'bg-amber-400' : 'bg-primary'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-foreground/40 font-semibold">
                      <span>Alert at ≤ {item.minThreshold} {item.unit || 'units'}</span>
                      {item.unitCost && <span>₹{item.unitCost} / {item.unit || 'unit'}</span>}
                    </div>
                  </div>

                  {/* Mobile Quick Action Buttons & Steppers */}
                  {canManage ? (
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {/* Left: Quick Decrement & Increment Steppers */}
                      <div className="flex items-center gap-1.5 bg-background border border-foreground/10 p-1 rounded-xl">
                        <button
                          onClick={() => handleQuickChange(item, -1)}
                          disabled={item.quantity <= 0}
                          className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono font-black text-sm flex items-center justify-center hover:bg-rose-500/20 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
                          title="Consume 1 unit"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickChange(item, 1)}
                          className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black text-sm flex items-center justify-center hover:bg-emerald-500/20 active:scale-90 transition-all"
                          title="Restock 1 unit"
                        >
                          +1
                        </button>
                      </div>

                      {/* Right: Log Usage & Edit / Delete Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openAdjustModal(item, 'CONSUMED')}
                          className="px-3 py-2 rounded-xl bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-extrabold transition-all active:scale-95 flex items-center gap-1"
                        >
                          <span>Log Usage</span>
                        </button>
                        <button
                          onClick={() => openAddModal(item)}
                          className="p-2 rounded-xl bg-surface border border-foreground/10 text-foreground/60 hover:text-foreground active:scale-95 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.itemUuid)}
                          className="p-2 rounded-xl bg-surface border border-foreground/10 text-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-0.5 text-right">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                        Club Managed Stock
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Floating Quick Action Button on Mobile */}
        {canManage && items.length > 3 && (
          <div className="fixed bottom-20 right-4 z-40">
            <button
              onClick={() => openAddModal()}
              className="px-4 py-3 rounded-full bg-primary text-black font-black text-xs tracking-wide shadow-2xl shadow-primary/40 flex items-center gap-2 active:scale-90 hover:opacity-90 transition-all border border-black/10"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Item</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP VIEW (EXACT SAME AS ORIGINAL - UNTOUCHED FOR DESKTOP SCREENS)  */}
      {/* ========================================================================= */}
      <div className="hidden md:block p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* 1. CLUB GEAR VAULT / HERO CARD (Desktop) */}
        <div className="relative overflow-hidden rounded-[36px] bg-surface border border-foreground/10 p-7 shadow-sm">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Top Bar inside Card */}
          <div className="relative flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center text-sm shadow-inner">
                📦
              </span>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground/50">Club Gear & Supplies</h2>
                <div className="text-sm font-extrabold text-foreground truncate max-w-md">
                  {org?.name || 'Club Inventory'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={openLogDrawer}
                className="px-3 py-1.5 rounded-xl bg-surface border border-foreground/10 text-foreground/70 hover:text-foreground text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Stock Movement Logs"
              >
                <History className="w-3.5 h-3.5" />
                <span>Movement Logs</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-xl bg-surface border border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
                title="Refresh Inventory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Large Total Units Display */}
          <div className="relative py-3 space-y-1">
            <div className="text-[11px] font-black uppercase tracking-widest text-foreground/50 flex items-center gap-1.5">
              <span>Total Available Equipment & Supplies</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                {summary?.totalQuantity || 0}
              </span>
              <span className="text-base font-extrabold text-foreground/50">
                Units in Stock across {summary?.totalCategories || 0} categories
              </span>
            </div>
          </div>

          {/* 3-Column Stock Health Status */}
          <div className="relative grid grid-cols-3 gap-2.5 pt-3 border-t border-foreground/10">
            {/* In Stock */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> In Stock
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {summary?.inStockCount || 0} items
              </div>
            </div>

            {/* Low Stock */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-0.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Low Stock
              </div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                {summary?.lowStockCount || 0} items
              </div>
            </div>

            {/* Out of Stock */}
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-0.5">
              <div className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Archive className="w-3 h-3" /> Out of Stock
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                {summary?.outOfStockCount || 0} items
              </div>
            </div>
          </div>

          {/* Quick Action Buttons inside Hero Card */}
          {canManage ? (
            <div className="relative grid grid-cols-2 gap-2.5 pt-4">
              <button
                onClick={() => openAddModal()}
                className="py-3 px-4 rounded-2xl bg-primary text-black text-sm font-black tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Add New Item
              </button>
              <button
                onClick={openLogDrawer}
                className="py-3 px-4 rounded-2xl bg-surface border border-foreground/10 text-foreground text-sm font-black tracking-wide flex items-center justify-center gap-2 hover:bg-foreground/5 transition-all active:scale-[0.98]"
              >
                <BarChart3 className="w-4 h-4 text-primary" /> View History
              </button>
            </div>
          ) : (
            <div className="relative grid grid-cols-2 gap-2.5 pt-4">
              <div className="py-2.5 px-3 rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground/60 text-xs font-bold flex items-center justify-center gap-1.5 text-center">
                <Lock className="w-3.5 h-3.5" /> Member Catalog (Read-Only)
              </div>
              <button
                onClick={openLogDrawer}
                className="py-2.5 px-3 rounded-2xl bg-surface border border-foreground/10 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-foreground/5 transition-all"
              >
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Movement History
              </button>
            </div>
          )}
        </div>

        {/* 2. SEARCH & FILTER CONTROLS (Desktop) */}
        <div className="space-y-2.5">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search shuttles, gear, racquets, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-foreground/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Category Chips Scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-surface border border-foreground/5 text-foreground/60 hover:text-foreground'
              }`}
            >
              All Supplies
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-black border-primary/30 shadow-sm'
                    : 'bg-surface border-foreground/5 text-foreground/60 hover:text-foreground'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'IN_STOCK', label: 'In Stock' },
              { id: 'LOW_STOCK', label: 'Low Stock ⚠️' },
              { id: 'OUT_OF_STOCK', label: 'Out of Stock ❌' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface border border-foreground/5 text-foreground/60 hover:text-foreground'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. INVENTORY ITEMS GRID (Desktop) */}
        <div>
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 bg-surface border border-foreground/5 rounded-[24px]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-foreground/50">Loading club inventory...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-4 bg-surface border border-foreground/5 rounded-[28px]">
              <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-3xl">
                🏸
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">No Inventory Items Found</h3>
                <p className="text-xs text-foreground/50 max-w-sm mx-auto mt-1">
                  Add shuttle boxes, court nets, medical kits, and shared racquets to track club stock effortlessly.
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => openAddModal()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" /> Add First Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const catObj = CATEGORIES.find((c) => c.id === item.category);
                const isOutOfStock = item.status === 'OUT_OF_STOCK' || item.quantity <= 0;
                const isLowStock = item.status === 'LOW_STOCK' && !isOutOfStock;

                return (
                  <div
                    key={`desktop-${item.itemUuid}`}
                    className="p-5 rounded-[24px] bg-surface border border-foreground/5 space-y-3.5 shadow-sm hover:border-foreground/15 transition-all group relative overflow-hidden"
                  >
                    {/* Header: Icon, Name & Status Pill */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${
                          catObj?.color || 'from-primary/20 to-primary/10 text-primary'
                        } border border-foreground/5 shadow-inner`}>
                          {catObj?.icon || '📦'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm text-foreground truncate" title={item.itemName}>
                            {item.itemName}
                          </h4>
                          <div className="text-[11px] font-medium text-foreground/40 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{catObj?.label || item.category}</span>
                            {item.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-foreground/60 font-semibold">
                                  <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                                  {item.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        isOutOfStock
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : isLowStock
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'Ready'}
                      </span>
                    </div>

                    {/* Quantity & Stock Level Meter */}
                    <div className="bg-background/60 rounded-2xl p-3 border border-foreground/5 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-foreground/50">Current Stock</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-black font-mono ${
                            isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-primary'
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs font-bold text-foreground/40 font-mono">
                            {item.unit || 'Units'}
                          </span>
                        </div>
                      </div>

                      {/* Stock Level Bar */}
                      <div className="h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOutOfStock ? 'bg-rose-500 w-0' : isLowStock ? 'bg-amber-400' : 'bg-primary'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(8, (item.quantity / Math.max(item.minThreshold * 2, 10)) * 100))}%`
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-foreground/30 font-medium font-mono">
                        <span>Min Threshold: {item.minThreshold}</span>
                        {item.unitCost && <span>₹{item.unitCost} / {item.unit || 'unit'}</span>}
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    {canManage ? (
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickChange(item, -1)}
                            disabled={item.quantity <= 0}
                            className="px-2.5 py-1.5 rounded-xl bg-background border border-foreground/10 text-xs font-black text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            title="Use 1 unit"
                          >
                            -1 {item.unit?.slice(0, 4) || ''}
                          </button>
                          <button
                            onClick={() => handleQuickChange(item, 1)}
                            className="px-2.5 py-1.5 rounded-xl bg-background border border-foreground/10 text-xs font-black text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
                            title="Add 1 unit"
                          >
                            +1 {item.unit?.slice(0, 4) || ''}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openAdjustModal(item, 'CONSUMED')}
                            className="px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-bold transition-colors"
                          >
                            Log Usage
                          </button>
                          <button
                            onClick={() => openAddModal(item)}
                            className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                            title="Edit Item"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.itemUuid)}
                            className="p-2 rounded-xl text-foreground/20 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 text-right">
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                          Club Stocked Equipment
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: ADD / EDIT INVENTORY ITEM (RESPONSIVE & MOBILE-OPTIMIZED)       */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Drag Handle Bar on Mobile */}
            <div className="sm:hidden w-full pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
            </div>

            {/* Header */}
            <div className="px-5 sm:px-7 pt-2 sm:pt-6 pb-3 border-b border-foreground/5 space-y-1 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
                  </h3>
                  <p className="text-xs text-foreground/50 font-medium">
                    {editingItem
                      ? 'Update item details and minimum stock alert threshold.'
                      : 'Add shared balls, shuttle tubes, or medical gear to club vault.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveItem} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-4">
                
                {/* Category Grid */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1.5">
                    Category *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormCategory(cat.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all text-center border flex flex-col items-center gap-1 ${
                          formCategory === cat.id
                            ? 'bg-primary/15 text-primary border-primary/40 shadow-sm scale-[1.02]'
                            : 'bg-background/60 border-foreground/5 text-foreground/70 hover:bg-foreground/5'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate w-full text-[9px] font-black">{cat.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yonex Aerosensa 30 Feather Shuttles"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>

                {/* Quantity & Unit & Threshold */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-black text-foreground focus:outline-none focus:border-primary shadow-inner font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Unit
                    </label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-2.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner cursor-pointer"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Min Alert Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formMinThreshold}
                      onChange={(e) => setFormMinThreshold(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2 text-sm font-black text-foreground focus:outline-none focus:border-primary shadow-inner font-mono"
                    />
                  </div>
                </div>

                {/* Location & Unit Cost */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Court 1 Locker, Cabinet A"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                      Unit Cost (₹ INR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formUnitCost}
                      onChange={(e) => setFormUnitCost(e.target.value)}
                      className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner font-mono"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Speed 77 for winter matches, club sponsored"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              </div>

              {/* Fixed Sticky Footer */}
              <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-foreground/10 px-5 sm:px-7 pt-3.5 pb-6 sm:pb-3.5 flex items-center justify-between gap-3 shrink-0 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-foreground/15 text-xs font-black text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-2xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                  {editingItem ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: QUICK STOCK ADJUSTMENT / USAGE LOG (MOBILE-OPTIMIZED)          */}
      {/* ========================================================================= */}
      {isAdjustModalOpen && selectedItemForAdjust && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Drag Handle Bar on Mobile */}
            <div className="sm:hidden w-full pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
            </div>

            {/* Header */}
            <div className="px-5 sm:px-7 pt-2 sm:pt-6 pb-3 border-b border-foreground/5 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground">
                    Log Stock Movement
                  </h3>
                  <p className="text-xs text-foreground/50 font-medium">
                    {selectedItemForAdjust.itemName} • In Stock: <span className="text-primary font-bold font-mono">{selectedItemForAdjust.quantity} {selectedItemForAdjust.unit}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Movement Type Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-background p-1.5 rounded-2xl border" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setAdjustChangeType('CONSUMED')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                    adjustChangeType === 'CONSUMED'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                      : 'text-foreground/50 hover:text-rose-400'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" /> Used / Out
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustChangeType('RESTOCK')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                    adjustChangeType === 'RESTOCK'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
                      : 'text-foreground/50 hover:text-emerald-400'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Restock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustChangeType('DAMAGED')}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 ${
                    adjustChangeType === 'DAMAGED'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                      : 'text-foreground/50 hover:text-amber-400'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Damaged
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleStockAdjustment} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 space-y-4">
                
                {/* Quantity to adjust */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Quantity ({selectedItemForAdjust.unit || 'Units'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-2xl font-black text-foreground focus:outline-none focus:border-primary shadow-inner font-mono"
                  />

                  {/* Preset Stepper chips */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-wider mr-1">Quick:</span>
                    {[1, 2, 5, 10, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAdjustAmount(String(num))}
                        className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[11px] font-mono font-black text-foreground/70 transition-colors"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Member / Coach Picker with Photos */}
                <div className="relative">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Issued To / Handled By
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                    className="w-full bg-background border border-foreground/10 hover:border-primary/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground focus:outline-none transition-all flex items-center justify-between gap-2 shadow-inner"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {(() => {
                        const selMember = members.find((m) => m.organizationMemberUuid === adjustMemberUuid);
                        if (selMember) {
                          return (
                            <>
                              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                                {selMember.photo ? (
                                  <img
                                    src={UserService.getPhotoUrl(selMember.photo)}
                                    alt={selMember.fullName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <span>{selMember.fullName?.charAt(0) || '👤'}</span>
                                )}
                              </div>
                              <div className="text-left truncate">
                                <div className="font-extrabold text-foreground truncate">{selMember.fullName}</div>
                                {selMember.phone && <div className="text-[10px] text-foreground/40 font-mono">+91 {selMember.phone}</div>}
                              </div>
                            </>
                          );
                        }
                        return (
                          <>
                            <div className="w-7 h-7 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center text-xs text-foreground/40 shrink-0">
                              👤
                            </div>
                            <div className="text-left text-foreground/60 font-medium truncate">
                              General Club Usage (No Specific Member)
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMemberDropdownOpen && (
                    <div className="mt-1.5 w-full bg-surface border border-foreground/10 rounded-2xl shadow-2xl p-2 space-y-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                      {members.length > 4 && (
                        <div className="relative mb-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                          <input
                            type="text"
                            placeholder="Search athlete or coach..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="w-full bg-background border border-foreground/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}

                      <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustMemberUuid('');
                            setIsMemberDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                            !adjustMemberUuid ? 'bg-primary/15 text-primary font-bold' : 'hover:bg-foreground/5 text-foreground/70'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center text-xs text-foreground/40 shrink-0">
                              👤
                            </div>
                            <span className="truncate">General Club Usage</span>
                          </div>
                          {!adjustMemberUuid && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>

                        {members
                          .filter((m) =>
                            m.fullName?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                            m.phone?.includes(memberSearchQuery)
                          )
                          .map((m) => {
                            const isSelected = adjustMemberUuid === m.organizationMemberUuid;
                            return (
                              <button
                                key={m.organizationMemberUuid}
                                type="button"
                                onClick={() => {
                                  setAdjustMemberUuid(m.organizationMemberUuid);
                                  setIsMemberDropdownOpen(false);
                                }}
                                className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                                  isSelected ? 'bg-primary/15 text-primary font-bold' : 'hover:bg-foreground/5 text-foreground'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/20 flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                                    {m.photo ? (
                                      <img
                                        src={UserService.getPhotoUrl(m.photo)}
                                        alt={m.fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <span>{m.fullName?.charAt(0) || '👤'}</span>
                                    )}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-extrabold text-foreground truncate">{m.fullName}</div>
                                    {m.phone && <div className="text-[10px] text-foreground/40 font-mono">+91 {m.phone}</div>}
                                  </div>
                                </div>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reason / Notes */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                    Reason / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Evening doubles tournament match on Court 2"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              </div>

              {/* Fixed Sticky Footer */}
              <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-foreground/10 px-5 sm:px-7 pt-3.5 pb-6 sm:pb-3.5 flex items-center justify-between gap-3 shrink-0 shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-foreground/15 text-xs font-black text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-2xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: STOCK MOVEMENT AUDIT LOGS (MOBILE-OPTIMIZED)                    */}
      {/* ========================================================================= */}
      {isLogDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-surface border border-foreground/10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            
            {/* Drag Handle Bar on Mobile */}
            <div className="sm:hidden w-full pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-foreground/20" />
            </div>

            {/* Header */}
            <div className="px-5 sm:px-7 pt-2 sm:pt-6 pb-3 border-b border-foreground/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-sm">
                  📜
                </span>
                <div>
                  <h3 className="text-base font-black text-foreground">Stock Movement Audit Trail</h3>
                  <p className="text-xs text-foreground/50 font-medium">History of restocks and equipment usage</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogDrawerOpen(false)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Logs Feed */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 divide-y divide-foreground/5 space-y-2">
              {logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/40">
                  No stock movement history recorded yet.
                </div>
              ) : (
                logs.map((log) => {
                  const isPositive = log.quantityChange > 0;
                  return (
                    <div key={log.logUuid} className="pt-2.5 pb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-foreground truncate">
                            {log.itemName || 'Inventory Item'}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            log.changeType === 'RESTOCK'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : log.changeType === 'DAMAGED'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {log.changeType}
                          </span>
                        </div>
                        <div className="text-[11px] text-foreground/40 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {log.memberName && <span className="text-emerald-400 font-semibold">{log.memberName} •</span>}
                          {log.notes && <span>{log.notes} •</span>}
                          <span>{log.createdAt ? String(log.createdAt).slice(0, 10) : ''}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-black text-sm ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPositive ? '+' : ''}{log.quantityChange}
                        </div>
                        <div className="text-[10px] text-foreground/30 font-mono">
                          Balance: {log.quantityAfter}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-foreground/10 px-5 sm:px-7 py-3.5 flex justify-end shrink-0 shadow-lg">
              <button
                onClick={() => setIsLogDrawerOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-foreground text-background text-xs font-black hover:bg-foreground/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
