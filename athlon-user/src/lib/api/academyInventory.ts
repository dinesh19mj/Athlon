import { api } from './client';

export interface AcademyInventoryItem {
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

export interface AcademyInventoryLog {
  logId?: number;
  logUuid: string;
  itemId?: number;
  itemUuid: string;
  itemName?: string;
  itemCategory?: string;
  unit?: string;
  organizationId?: number;
  organizationUuid: string;
  changeType: 'RESTOCK' | 'CONSUMED' | 'ADJUSTMENT' | 'DAMAGED';
  quantityChange: number;
  quantityAfter: number;
  memberUuid?: string;
  loggedByName?: string;
  notes?: string;
  createdAt?: string;
}

export interface AcademyInventorySummary {
  totalCategories: number;
  totalQuantity: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  estimatedTotalValue: number;
  quantityByCategory: Record<string, number>;
}

export interface CreateAcademyInventoryPayload {
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

export interface UpdateAcademyInventoryPayload {
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

export interface AdjustAcademyInventoryStockPayload {
  itemUuid: string;
  changeType: 'RESTOCK' | 'CONSUMED' | 'ADJUSTMENT' | 'DAMAGED';
  quantityChange: number;
  memberUuid?: string;
  notes?: string;
}

export const AcademyInventoryService = {
  getItems: async (orgUuid: string, category?: string, status?: string): Promise<AcademyInventoryItem[]> => {
    let url = `/api/identity/academy/inventory/org/${orgUuid}?`;
    if (category && category !== 'ALL') url += `category=${category}&`;
    if (status && status !== 'ALL') url += `status=${status}&`;
    const res = await api.get<any>(url);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  createItem: async (payload: CreateAcademyInventoryPayload): Promise<AcademyInventoryItem> => {
    const res = await api.post<any>('/api/identity/academy/inventory/add', payload);
    return res?.data || res;
  },

  updateItem: async (payload: UpdateAcademyInventoryPayload): Promise<AcademyInventoryItem> => {
    const res = await api.post<any>('/api/identity/academy/inventory/update', payload);
    return res?.data || res;
  },

  adjustStock: async (payload: AdjustAcademyInventoryStockPayload): Promise<AcademyInventoryItem> => {
    const res = await api.post<any>('/api/identity/academy/inventory/stock/adjust', payload);
    return res?.data || res;
  },

  deleteItem: async (itemUuid: string): Promise<void> => {
    await api.post<void>(`/api/identity/academy/inventory/delete/${itemUuid}`, {});
  },

  getLogs: async (orgUuid: string, itemUuid?: string): Promise<AcademyInventoryLog[]> => {
    let url = `/api/identity/academy/inventory/logs/org/${orgUuid}`;
    if (itemUuid) url += `?itemUuid=${itemUuid}`;
    const res = await api.get<any>(url);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  getSummary: async (orgUuid: string): Promise<AcademyInventorySummary> => {
    const res = await api.get<any>(`/api/identity/academy/inventory/summary/org/${orgUuid}`);
    return (
      res?.data ||
      res || {
        totalCategories: 0,
        totalQuantity: 0,
        inStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        estimatedTotalValue: 0,
        quantityByCategory: {},
      }
    );
  },
};
