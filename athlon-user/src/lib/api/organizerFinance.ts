import { api } from './client';

export type OrganizerTransactionType = 'INCOME' | 'EXPENSE';
export type OrganizerPaymentStatus = 'COMPLETED' | 'PENDING' | 'PARTIAL' | 'REFUNDED' | 'CANCELLED';

export interface OrganizerFinance {
  financeUuid: string;
  organizationUuid: string;
  tournamentUuid?: string;
  tournamentName?: string;
  transactionType: OrganizerTransactionType;
  category: string;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  paymentStatus?: OrganizerPaymentStatus;
  paidToOrBy?: string;
  invoiceOrReceiptNo?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerFinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingReceivables: number;
  pendingPayables: number;
  transactionCount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  netByTournament: Record<string, number>;
}

export interface CreateOrganizerFinancePayload {
  organizationUuid: string;
  tournamentUuid?: string;
  tournamentName?: string;
  transactionType: OrganizerTransactionType;
  category: string;
  title: string;
  amount: number;
  transactionDate: string;
  paymentMethod?: string;
  paymentStatus?: OrganizerPaymentStatus;
  paidToOrBy?: string;
  invoiceOrReceiptNo?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateOrganizerFinancePayload {
  financeUuid: string;
  tournamentUuid?: string;
  tournamentName?: string;
  transactionType?: OrganizerTransactionType;
  category?: string;
  title?: string;
  amount?: number;
  transactionDate?: string;
  paymentMethod?: string;
  paymentStatus?: OrganizerPaymentStatus;
  paidToOrBy?: string;
  invoiceOrReceiptNo?: string;
  receiptUrl?: string;
  notes?: string;
}

export const ORGANIZER_INCOME_CATEGORIES = [
  { id: 'REGISTRATION_FEES', label: 'Registration Fees', icon: '🎫', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'SPONSORSHIPS', label: 'Sponsorships & Brands', icon: '🤝', color: 'from-amber-500/20 to-amber-600/10 text-amber-400' },
  { id: 'TICKET_SALES', label: 'Passes / Tickets', icon: '🎟️', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'MERCHANDISE_CONCESSIONS', label: 'Merch & Stalls', icon: '👕', color: 'from-purple-500/20 to-purple-600/10 text-purple-400' },
  { id: 'PRIZE_GRANTS', label: 'Grants / Subsidies', icon: '🏛️', color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400' },
  { id: 'OTHER_INCOME', label: 'Other Revenue', icon: '💰', color: 'from-primary/20 to-primary/10 text-primary' }
];

export const ORGANIZER_EXPENSE_CATEGORIES = [
  { id: 'PRIZE_MONEY', label: 'Prize Money Pool', icon: '🏆', color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400' },
  { id: 'VENUE_COURT_RENTAL', label: 'Venue & Court Rental', icon: '🏟️', color: 'from-rose-500/20 to-rose-600/10 text-rose-400' },
  { id: 'UMPIRES_OFFICIALS', label: 'Umpires & Referees', icon: '⚖️', color: 'from-orange-500/20 to-orange-600/10 text-orange-400' },
  { id: 'EQUIPMENT_SHUTTLES', label: 'Shuttles & Balls', icon: '🏸', color: 'from-blue-500/20 to-blue-600/10 text-blue-400' },
  { id: 'MARKETING_STREAMING', label: 'Media & Live Stream', icon: '📡', color: 'from-purple-500/20 to-purple-600/10 text-purple-400' },
  { id: 'HOSPITALITY_REFRESHMENTS', label: 'Catering & Water', icon: '🥤', color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400' },
  { id: 'LOGISTICS_PRINTING', label: 'Banners & Badges', icon: '🪧', color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400' },
  { id: 'OTHER_EXPENSE', label: 'Other Expenses', icon: '📦', color: 'from-slate-500/20 to-slate-600/10 text-slate-400' }
];

export const ORGANIZER_PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR', icon: '⚡' },
  { id: 'BANK_TRANSFER', label: 'NEFT / RTGS', icon: '🏦' },
  { id: 'CASH', label: 'Cash', icon: '💵' },
  { id: 'CARD', label: 'Card POS', icon: '💳' },
  { id: 'CHEQUE', label: 'Cheque', icon: '📄' }
];

export const OrganizerFinanceService = {
  getFinances: (
    orgUuid: string,
    params?: {
      tournamentUuid?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    let url = `/api/identity/organizer/finances/org/${orgUuid}?`;
    if (params?.tournamentUuid) url += `tournamentUuid=${encodeURIComponent(params.tournamentUuid)}&`;
    if (params?.type && params.type !== 'ALL') url += `type=${encodeURIComponent(params.type)}&`;
    if (params?.startDate) url += `startDate=${encodeURIComponent(params.startDate)}&`;
    if (params?.endDate) url += `endDate=${encodeURIComponent(params.endDate)}&`;
    return api.get<OrganizerFinance[]>(url);
  },

  createFinance: (payload: CreateOrganizerFinancePayload) =>
    api.post<OrganizerFinance>('/api/identity/organizer/finances/add', payload),

  updateFinance: (payload: UpdateOrganizerFinancePayload) =>
    api.post<OrganizerFinance>('/api/identity/organizer/finances/update', payload),

  deleteFinance: (financeUuid: string) =>
    api.post<void>(`/api/identity/organizer/finances/delete/${financeUuid}`, {}),

  getSummary: (
    orgUuid: string,
    params?: {
      tournamentUuid?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    let url = `/api/identity/organizer/finances/summary/org/${orgUuid}?`;
    if (params?.tournamentUuid) url += `tournamentUuid=${encodeURIComponent(params.tournamentUuid)}&`;
    if (params?.startDate) url += `startDate=${encodeURIComponent(params.startDate)}&`;
    if (params?.endDate) url += `endDate=${encodeURIComponent(params.endDate)}&`;
    return api.get<OrganizerFinanceSummary>(url);
  }
};
