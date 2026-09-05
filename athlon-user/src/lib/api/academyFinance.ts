import { api } from './client';

export interface AcademyFinance {
  financeId?: number;
  financeUuid?: string;
  organizationId?: number;
  organizationUuid: string;
  transactionType: 'EXPENSE' | 'INCOME';
  category: string;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  studentUuid?: string;
  studentName?: string;
  batchUuid?: string;
  batchName?: string;
  invoiceNumber?: string;
  feeStatus?: 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED';
  notes?: string;
  receiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademyFinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  totalFeeCollected: number;
  pendingFeeAmount: number;
  transactionCount: number;
  studentFeePaymentCount: number;
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}

export interface CreateAcademyFinancePayload {
  organizationUuid: string;
  transactionType: 'EXPENSE' | 'INCOME';
  category: string;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  studentUuid?: string;
  studentName?: string;
  batchUuid?: string;
  batchName?: string;
  invoiceNumber?: string;
  feeStatus?: 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED';
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateAcademyFinancePayload {
  financeUuid: string;
  transactionType?: 'EXPENSE' | 'INCOME';
  category?: string;
  title?: string;
  amount?: number;
  transactionDate?: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  studentUuid?: string;
  studentName?: string;
  batchUuid?: string;
  batchName?: string;
  invoiceNumber?: string;
  feeStatus?: 'PAID' | 'PARTIAL' | 'PENDING' | 'REFUNDED';
  notes?: string;
  receiptUrl?: string;
}

export const AcademyFinanceService = {
  getFinances: async (
    orgUuid: string,
    type?: string,
    category?: string,
    studentUuid?: string,
    batchUuid?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AcademyFinance[]> => {
    let url = `/api/identity/academy/finances/org/${orgUuid}?`;
    if (type && type !== 'ALL') url += `type=${type}&`;
    if (category && category !== 'ALL') url += `category=${encodeURIComponent(category)}&`;
    if (studentUuid) url += `studentUuid=${studentUuid}&`;
    if (batchUuid && batchUuid !== 'ALL') url += `batchUuid=${batchUuid}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    const res = await api.get<any>(url);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  },

  createFinance: async (payload: CreateAcademyFinancePayload): Promise<AcademyFinance> => {
    const res = await api.post<any>('/api/identity/academy/finances/add', payload);
    return (res && res.data) ? res.data : res;
  },

  updateFinance: async (payload: UpdateAcademyFinancePayload): Promise<AcademyFinance> => {
    const res = await api.post<any>('/api/identity/academy/finances/update', payload);
    return (res && res.data) ? res.data : res;
  },

  deleteFinance: (financeUuid: string) =>
    api.post<void>(`/api/identity/academy/finances/delete/${financeUuid}`, {}),

  getSummary: async (orgUuid: string, startDate?: string, endDate?: string): Promise<AcademyFinanceSummary | null> => {
    let url = `/api/identity/academy/finances/summary/org/${orgUuid}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;

    const res = await api.get<any>(url);
    if (res && res.data) return res.data;
    return res || null;
  }
};
