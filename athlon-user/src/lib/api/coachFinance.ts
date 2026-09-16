import { api } from './client';

export interface CoachFinance {
  financeId?: number;
  financeUuid: string;
  organizationId?: number;
  organizationUuid: string;
  transactionType: 'INCOME' | 'EXPENSE';
  category: string;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  traineeUuid?: string;
  traineeName?: string;
  packageUuid?: string;
  packageName?: string;
  invoiceNumber?: string;
  feeStatus?: string;
  notes?: string;
  receiptUrl?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachFinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  pendingReceivables: number;
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}

export interface CreateCoachFinancePayload {
  organizationUuid: string;
  transactionType: 'INCOME' | 'EXPENSE';
  category: string;
  title: string;
  amount: number;
  transactionDate?: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  traineeUuid?: string;
  traineeName?: string;
  packageUuid?: string;
  packageName?: string;
  invoiceNumber?: string;
  feeStatus?: string;
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateCoachFinancePayload {
  financeUuid: string;
  transactionType?: 'INCOME' | 'EXPENSE';
  category?: string;
  title?: string;
  amount?: number;
  transactionDate?: string;
  paymentMethod?: string;
  paidToOrBy?: string;
  traineeUuid?: string;
  traineeName?: string;
  packageUuid?: string;
  packageName?: string;
  invoiceNumber?: string;
  feeStatus?: string;
  notes?: string;
  receiptUrl?: string;
}

export const CoachFinanceService = {
  getFinances: (orgUuid: string, type?: string, startDate?: string, endDate?: string) => {
    let url = `/api/identity/coach/finances/org/${orgUuid}?`;
    if (type && type !== 'ALL') url += `type=${type}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    return api.get<{ data: CoachFinance[] } | CoachFinance[]>(url);
  },

  getTraineeFinances: (orgUuid: string, traineeUuid: string) =>
    api.get<{ data: CoachFinance[] } | CoachFinance[]>(
      `/api/identity/coach/finances/trainee/${traineeUuid}?organizationUuid=${orgUuid}`
    ),

  createFinance: (payload: CreateCoachFinancePayload) =>
    api.post<{ data: CoachFinance } | CoachFinance>('/api/identity/coach/finances/add', payload),

  updateFinance: (payload: UpdateCoachFinancePayload) =>
    api.post<{ data: CoachFinance } | CoachFinance>('/api/identity/coach/finances/update', payload),

  deleteFinance: (financeUuid: string) =>
    api.post<void>(`/api/identity/coach/finances/delete/${financeUuid}`, {}),

  getSummary: (orgUuid: string, startDate?: string, endDate?: string) => {
    let url = `/api/identity/coach/finances/summary/org/${orgUuid}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    return api.get<{ data: CoachFinanceSummary } | CoachFinanceSummary>(url);
  },
};
