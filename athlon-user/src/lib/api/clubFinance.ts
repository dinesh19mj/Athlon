import { api } from './client';

export interface ClubFinance {
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
  memberUuid?: string;
  memberName?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}

export interface CreateFinancePayload {
  organizationUuid: string;
  transactionType: 'EXPENSE' | 'INCOME';
  category: string;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  memberUuid?: string;
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateFinancePayload {
  financeUuid: string;
  transactionType?: 'EXPENSE' | 'INCOME';
  category?: string;
  title?: string;
  amount?: number;
  transactionDate?: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  memberUuid?: string;
  notes?: string;
  receiptUrl?: string;
}

export const ClubFinanceService = {
  getFinances: (orgUuid: string, type?: string, startDate?: string, endDate?: string) => {
    let url = `/api/identity/club/finances/org/${orgUuid}?`;
    if (type) url += `type=${type}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    return api.get<ClubFinance[]>(url);
  },

  createFinance: (payload: CreateFinancePayload) =>
    api.post<ClubFinance>('/api/identity/club/finances/add', payload),

  updateFinance: (payload: UpdateFinancePayload) =>
    api.post<ClubFinance>('/api/identity/club/finances/update', payload),

  deleteFinance: (financeUuid: string) =>
    api.post<void>(`/api/identity/club/finances/delete/${financeUuid}`, {}),

  getSummary: (orgUuid: string, startDate?: string, endDate?: string) => {
    let url = `/api/identity/club/finances/summary/org/${orgUuid}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    return api.get<FinanceSummary>(url);
  },
};
