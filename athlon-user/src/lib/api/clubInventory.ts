import { api } from './client';

export interface ClubInventoryItem {
  itemId?: number;
  itemUuid: string;
  organizationId?: number;
  organizationUuid: string;
  itemName: string;
  category: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  location?: string;
  unitCost?: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  imageUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubInventoryLog {
  logId?: number;
  logUuid: string;
  itemId?: number;
  itemUuid: string;
  itemName?: string;
  itemCategory?: string;
  organizationId?: number;
  organizationUuid: string;
  changeType: 'RESTOCK' | 'CONSUMED' | 'ADJUSTMENT' | 'DAMAGED';
  quantityChange: number;
  quantityAfter: number;
  memberUuid?: string;
  memberName?: string;
  notes?: string;
  createdAt?: string;
}

export interface InventorySummary {
  totalCategories: number;
  totalQuantity: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  estimatedTotalValue: number;
  quantityByCategory: Record<string, number>;
}

export interface CreateInventoryItemPayload {
  organizationUuid: string;
  itemName: string;
  category: string;
  quantity: number;
  minThreshold?: number;
  unit?: string;
  location?: string;
  unitCost?: number;
  imageUrl?: string;
  notes?: string;
}

export interface UpdateInventoryItemPayload {
  itemUuid: string;
  itemName?: string;
  category?: string;
  quantity?: number;
  minThreshold?: number;
  unit?: string;
  location?: string;
  unitCost?: number;
  status?: string;
  imageUrl?: string;
  notes?: string;
}

export interface AdjustStockPayload {
  itemUuid: string;
  changeType: 'RESTOCK' | 'CONSUMED' | 'ADJUSTMENT' | 'DAMAGED';
  quantityChange: number;
  memberUuid?: string;
  notes?: string;
}

export const ClubInventoryService = {
  getItems: (orgUuid: string, category?: string, status?: string) => {
    let url = `/api/identity/club/inventory/org/${orgUuid}?`;
    if (category && category !== 'ALL') url += `category=${category}&`;
    if (status && status !== 'ALL') url += `status=${status}&`;
    return api.get<ClubInventoryItem[]>(url);
  },

  createItem: (payload: CreateInventoryItemPayload) =>
    api.post<ClubInventoryItem>('/api/identity/club/inventory/add', payload),

  updateItem: (payload: UpdateInventoryItemPayload) =>
    api.post<ClubInventoryItem>('/api/identity/club/inventory/update', payload),

  adjustStock: (payload: AdjustStockPayload) =>
    api.post<ClubInventoryItem>('/api/identity/club/inventory/stock/adjust', payload),

  deleteItem: (itemUuid: string) =>
    api.post<void>(`/api/identity/club/inventory/delete/${itemUuid}`, {}),

  getLogs: (orgUuid: string, itemUuid?: string) => {
    let url = `/api/identity/club/inventory/logs/org/${orgUuid}?`;
    if (itemUuid) url += `itemUuid=${itemUuid}&`;
    return api.get<ClubInventoryLog[]>(url);
  },

  getSummary: (orgUuid: string) =>
    api.get<InventorySummary>(`/api/identity/club/inventory/summary/org/${orgUuid}`),
};
