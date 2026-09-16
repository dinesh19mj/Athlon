import { api } from './client';

export interface OrganizerInventoryItem {
  itemId?: number;
  itemUuid: string;
  organizationId?: number;
  organizationUuid: string;
  tournamentUuid?: string;
  itemName: string;
  category: string; // MATCH_GEAR, TROPHIES_AWARDS, PLAYER_KITS, COURT_ASSETS, BRANDING_MEDIA, FIRST_AID_SAFETY, OTHER
  quantity: number;
  minThreshold: number;
  unit: string;
  location?: string;
  unitCost?: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  conditionStatus?: string;
  isRental?: boolean;
  returnDueDate?: string;
  imageUrl?: string;
  notes?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerInventoryLog {
  logId?: number;
  logUuid: string;
  itemId?: number;
  itemUuid: string;
  itemName?: string;
  itemCategory?: string;
  unit?: string;
  organizationId?: number;
  organizationUuid: string;
  tournamentUuid?: string;
  changeType: 'RESTOCK' | 'CONSUMED_MATCH' | 'ALLOCATED_TO_COURT' | 'DISTRIBUTED_TO_TEAM' | 'DAMAGED_LOST' | 'RETURNED' | 'ADJUSTMENT';
  quantityChange: number;
  quantityAfter: number;
  courtNumber?: string;
  recipientName?: string;
  memberUuid?: string;
  loggedByName?: string;
  notes?: string;
  createdAt?: string;
}

export interface OrganizerInventorySummary {
  totalCategories: number;
  totalQuantity: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  estimatedTotalValue: number;
  quantityByCategory: Record<string, number>;
}

export interface CreateOrganizerInventoryPayload {
  organizationUuid: string;
  tournamentUuid?: string;
  itemName: string;
  category: string;
  quantity: number;
  minThreshold?: number;
  unit?: string;
  location?: string;
  unitCost?: number;
  conditionStatus?: string;
  isRental?: boolean;
  returnDueDate?: string;
  imageUrl?: string;
  notes?: string;
}

export interface UpdateOrganizerInventoryPayload {
  itemUuid: string;
  tournamentUuid?: string;
  itemName?: string;
  category?: string;
  quantity?: number;
  minThreshold?: number;
  unit?: string;
  location?: string;
  unitCost?: number;
  status?: string;
  conditionStatus?: string;
  isRental?: boolean;
  returnDueDate?: string;
  imageUrl?: string;
  notes?: string;
}

export interface AdjustOrganizerStockPayload {
  itemUuid: string;
  changeType: 'RESTOCK' | 'CONSUMED_MATCH' | 'ALLOCATED_TO_COURT' | 'DISTRIBUTED_TO_TEAM' | 'DAMAGED_LOST' | 'RETURNED' | 'ADJUSTMENT';
  quantityChange: number;
  tournamentUuid?: string;
  courtNumber?: string;
  recipientName?: string;
  memberUuid?: string;
  notes?: string;
}

const LOCAL_STORAGE_KEY_ITEMS = 'athlon_organizer_inventory_items_';
const LOCAL_STORAGE_KEY_LOGS = 'athlon_organizer_inventory_logs_';

// Helper to get local fallback items
function getLocalItems(orgUuid: string): OrganizerInventoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS + orgUuid);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItems(orgUuid: string, items: OrganizerInventoryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS + orgUuid, JSON.stringify(items));
  } catch {}
}

function getLocalLogs(orgUuid: string): OrganizerInventoryLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS + orgUuid);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLogs(orgUuid: string, logs: OrganizerInventoryLog[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS + orgUuid, JSON.stringify(logs));
  } catch {}
}

export const OrganizerInventoryService = {
  getItems: async (orgUuid: string, category?: string, status?: string, tournamentUuid?: string): Promise<OrganizerInventoryItem[]> => {
    try {
      let url = `/api/identity/organizer/inventory/org/${orgUuid}?`;
      if (category && category !== 'ALL') url += `category=${category}&`;
      if (status && status !== 'ALL') url += `status=${status}&`;
      if (tournamentUuid && tournamentUuid !== 'ALL') url += `tournamentUuid=${tournamentUuid}&`;
      const res = await api.get<any>(url);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (list.length > 0) {
        saveLocalItems(orgUuid, list);
        return list;
      }
    } catch (err) {
      console.warn('OrganizerInventoryService.getItems fallback to cache/mock', err);
    }

    // Local fallback from storage
    let items = getLocalItems(orgUuid);

    // Remove any previous demo seeded items
    items = items.filter((i) => !i.itemUuid.startsWith('tourn-inv-'));
    saveLocalItems(orgUuid, items);

    if (category && category !== 'ALL') {
      items = items.filter((i) => i.category === category);
    }
    if (status && status !== 'ALL') {
      items = items.filter((i) => i.status === status);
    }
    if (tournamentUuid && tournamentUuid !== 'ALL') {
      items = items.filter((i) => i.tournamentUuid === tournamentUuid);
    }

    return items;
  },

  createItem: async (payload: CreateOrganizerInventoryPayload): Promise<OrganizerInventoryItem> => {
    try {
      const res = await api.post<any>('/api/identity/organizer/inventory/add', payload);
      if (res?.data || res?.itemUuid) return res?.data || res;
    } catch (err) {
      console.warn('OrganizerInventoryService.createItem fallback to local', err);
    }

    const newItem: OrganizerInventoryItem = {
      itemUuid: 'org-inv-' + Date.now(),
      organizationUuid: payload.organizationUuid,
      tournamentUuid: payload.tournamentUuid,
      itemName: payload.itemName,
      category: payload.category,
      quantity: payload.quantity,
      minThreshold: payload.minThreshold || 5,
      unit: payload.unit || 'Units',
      location: payload.location,
      unitCost: payload.unitCost,
      conditionStatus: (payload.conditionStatus as any) || 'NEW',
      isRental: payload.isRental || false,
      returnDueDate: payload.returnDueDate,
      imageUrl: payload.imageUrl,
      notes: payload.notes,
      status: payload.quantity <= 0 ? 'OUT_OF_STOCK' : payload.quantity <= (payload.minThreshold || 5) ? 'LOW_STOCK' : 'IN_STOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = getLocalItems(payload.organizationUuid);
    current.unshift(newItem);
    saveLocalItems(payload.organizationUuid, current);

    // Add log
    if (newItem.quantity > 0) {
      const logs = getLocalLogs(payload.organizationUuid);
      logs.unshift({
        logUuid: 'log-' + Date.now(),
        itemUuid: newItem.itemUuid,
        itemName: newItem.itemName,
        itemCategory: newItem.category,
        unit: newItem.unit,
        organizationUuid: payload.organizationUuid,
        tournamentUuid: payload.tournamentUuid,
        changeType: 'RESTOCK',
        quantityChange: newItem.quantity,
        quantityAfter: newItem.quantity,
        loggedByName: 'Organizer Admin',
        notes: 'Initial tournament inventory addition',
        createdAt: new Date().toISOString(),
      });
      saveLocalLogs(payload.organizationUuid, logs);
    }

    return newItem;
  },

  updateItem: async (payload: UpdateOrganizerInventoryPayload): Promise<OrganizerInventoryItem> => {
    try {
      const res = await api.post<any>('/api/identity/organizer/inventory/update', payload);
      if (res?.data || res?.itemUuid) return res?.data || res;
    } catch (err) {
      console.warn('OrganizerInventoryService.updateItem fallback to local', err);
    }

    // Local update
    // Find item across storages
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LOCAL_STORAGE_KEY_ITEMS)) {
        const orgUuid = key.replace(LOCAL_STORAGE_KEY_ITEMS, '');
        const items = getLocalItems(orgUuid);
        const idx = items.findIndex((it) => it.itemUuid === payload.itemUuid);
        if (idx !== -1) {
          const prev = items[idx];
          const newQty = payload.quantity !== undefined ? payload.quantity : prev.quantity;
          const minTh = payload.minThreshold !== undefined ? payload.minThreshold : prev.minThreshold;
          const updated: OrganizerInventoryItem = {
            ...prev,
            ...payload,
            quantity: newQty,
            minThreshold: minTh,
            status: newQty <= 0 ? 'OUT_OF_STOCK' : newQty <= minTh ? 'LOW_STOCK' : 'IN_STOCK',
            updatedAt: new Date().toISOString(),
          };
          items[idx] = updated;
          saveLocalItems(orgUuid, items);
          return updated;
        }
      }
    }

    throw new Error('Item not found');
  },

  adjustStock: async (payload: AdjustOrganizerStockPayload): Promise<OrganizerInventoryItem> => {
    try {
      const res = await api.post<any>('/api/identity/organizer/inventory/stock/adjust', payload);
      if (res?.data || res?.itemUuid) return res?.data || res;
    } catch (err) {
      console.warn('OrganizerInventoryService.adjustStock fallback to local', err);
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LOCAL_STORAGE_KEY_ITEMS)) {
        const orgUuid = key.replace(LOCAL_STORAGE_KEY_ITEMS, '');
        const items = getLocalItems(orgUuid);
        const idx = items.findIndex((it) => it.itemUuid === payload.itemUuid);
        if (idx !== -1) {
          const prev = items[idx];
          const change = payload.quantityChange;
          const newQty = Math.max(0, prev.quantity + change);
          const updated: OrganizerInventoryItem = {
            ...prev,
            quantity: newQty,
            status: newQty <= 0 ? 'OUT_OF_STOCK' : newQty <= prev.minThreshold ? 'LOW_STOCK' : 'IN_STOCK',
            updatedAt: new Date().toISOString(),
          };
          items[idx] = updated;
          saveLocalItems(orgUuid, items);

          // Record log
          const logs = getLocalLogs(orgUuid);
          logs.unshift({
            logUuid: 'log-' + Date.now(),
            itemUuid: prev.itemUuid,
            itemName: prev.itemName,
            itemCategory: prev.category,
            unit: prev.unit,
            organizationUuid: orgUuid,
            tournamentUuid: payload.tournamentUuid || prev.tournamentUuid,
            changeType: payload.changeType,
            quantityChange: change,
            quantityAfter: newQty,
            courtNumber: payload.courtNumber,
            recipientName: payload.recipientName,
            loggedByName: 'Organizer Staff',
            notes: payload.notes || `Stock adjusted via ${payload.changeType}`,
            createdAt: new Date().toISOString(),
          });
          saveLocalLogs(orgUuid, logs);

          return updated;
        }
      }
    }

    throw new Error('Item not found for stock adjustment');
  },

  deleteItem: async (itemUuid: string): Promise<void> => {
    try {
      await api.post<void>(`/api/identity/organizer/inventory/delete/${itemUuid}`, {});
      return;
    } catch (err) {
      console.warn('OrganizerInventoryService.deleteItem fallback to local', err);
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LOCAL_STORAGE_KEY_ITEMS)) {
        const orgUuid = key.replace(LOCAL_STORAGE_KEY_ITEMS, '');
        const items = getLocalItems(orgUuid);
        const filtered = items.filter((it) => it.itemUuid !== itemUuid);
        saveLocalItems(orgUuid, filtered);
      }
    }
  },

  getLogs: async (orgUuid: string, itemUuid?: string, tournamentUuid?: string): Promise<OrganizerInventoryLog[]> => {
    try {
      let url = `/api/identity/organizer/inventory/logs/org/${orgUuid}?`;
      if (itemUuid) url += `itemUuid=${itemUuid}&`;
      if (tournamentUuid) url += `tournamentUuid=${tournamentUuid}&`;
      const res = await api.get<any>(url);
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('OrganizerInventoryService.getLogs fallback to cache', err);
    }

    let logs = getLocalLogs(orgUuid);
    if (itemUuid) logs = logs.filter((l) => l.itemUuid === itemUuid);
    if (tournamentUuid) logs = logs.filter((l) => l.tournamentUuid === tournamentUuid);
    return logs;
  },

  getSummary: async (orgUuid: string, tournamentUuid?: string): Promise<OrganizerInventorySummary> => {
    try {
      let url = `/api/identity/organizer/inventory/summary/org/${orgUuid}?`;
      if (tournamentUuid) url += `tournamentUuid=${tournamentUuid}`;
      const res = await api.get<any>(url);
      if (res?.data || res?.totalCategories !== undefined) return res?.data || res;
    } catch (err) {
      console.warn('OrganizerInventoryService.getSummary fallback to local calculation', err);
    }

    const items = await OrganizerInventoryService.getItems(orgUuid, undefined, undefined, tournamentUuid);
    let totalQuantity = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let estimatedTotalValue = 0;
    const quantityByCategory: Record<string, number> = {};

    items.forEach((item) => {
      const qty = item.quantity || 0;
      totalQuantity += qty;
      if (item.status === 'OUT_OF_STOCK' || qty <= 0) outOfStockCount++;
      else if (item.status === 'LOW_STOCK') lowStockCount++;
      else inStockCount++;

      if (item.unitCost && qty > 0) {
        estimatedTotalValue += item.unitCost * qty;
      }
      quantityByCategory[item.category] = (quantityByCategory[item.category] || 0) + qty;
    });

    return {
      totalCategories: items.length,
      totalQuantity,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      estimatedTotalValue,
      quantityByCategory,
    };
  },
};
