import { fetchClient } from './client';

export type PaymentPurpose =
  | 'ATHLON_SUBSCRIPTION'
  | 'TOURNAMENT_REGISTRATION'
  | 'TEAM_EVENT_REGISTRATION'
  | 'CHAMPIONSHIP_REGISTRATION'
  | 'ACADEMY_FEE'
  | 'CLUB_MEMBERSHIP'
  | 'VENUE_BOOKING'
  | 'COACH_BOOKING'
  | 'OTHER';

export type PaymentMode = 'ONLINE_ONLY' | 'OFFLINE_ONLY' | 'BOTH' | 'FREE';

export type OfflinePaymentMethod =
  | 'CASH_AT_VENUE'
  | 'DIRECT_UPI'
  | 'BANK_TRANSFER'
  | 'CHEQUE_DD'
  | 'OTHER';

export type OfflinePaymentStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'COLLECTED_AT_DESK'
  | 'REJECTED';

export type OnboardingStatus =
  | 'NOT_STARTED'
  | 'ACCOUNT_CREATED'
  | 'DETAILS_REQUIRED'
  | 'UNDER_REVIEW'
  | 'ACTIVE'
  | 'RESTRICTED'
  | 'REJECTED'
  | 'DISABLED';

export interface CreatePaymentOrderPayload {
  purpose: PaymentPurpose;
  referenceId: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  idempotencyKey?: string;
}

export interface PaymentOrderDto {
  paymentOrderId: string;
  paymentNumber: string;
  purpose: PaymentPurpose;
  referenceId: string;
  amount: number;
  currency: string;
  status: string;
  providerOrderId: string;
  razorpayKeyId: string;
  businessTitle: string;
  description: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  paymentStatus: string;
  paymentNumber: string;
  providerPaymentId: string;
  message: string;
  completedAt: string;
}

export interface OnboardingStatusDto {
  organizationId: string;
  recipientType: string;
  onboardingStatus: OnboardingStatus;
  providerAccountId?: string;
  paymentsEnabled: boolean;
  settlementsEnabled: boolean;
  businessName?: string;
  maskedBankAccount?: string;
  bankName?: string;
  lastSyncedAt?: string;
}

export interface OrganizationPaymentConfigDto {
  organizationId: string;
  recipientType?: string;
  businessName?: string;
  defaultPaymentMode: PaymentMode;
  onlineOnboardingStatus?: OnboardingStatus;
  paymentsEnabled?: boolean;
  settlementsEnabled?: boolean;
  maskedBankAccount?: string;
  bankName?: string;
  offlineUpiId?: string;
  offlineUpiQrUrl?: string;
  offlineAccountHolder?: string;
  offlineAccountNumber?: string;
  offlineIfscCode?: string;
  offlineBankName?: string;
  offlineInstructions?: string;
  offlineCashAllowed?: boolean;
  offlineUpiAllowed?: boolean;
  offlineBankTransferAllowed?: boolean;
  updatedAt?: string;
}

export interface OfflinePaymentSubmitPayload {
  organizationId: string;
  purpose: PaymentPurpose;
  entityId: string;
  entityName?: string;
  payerId: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  amount: number;
  currency?: string;
  paymentMethod: OfflinePaymentMethod;
  utrNumber?: string;
  receiptUrl?: string;
  payerNotes?: string;
}

export interface OfflinePaymentVerifyPayload {
  recordId: string;
  status: OfflinePaymentStatus;
  staffId?: string;
  staffName?: string;
  staffReceiptNumber?: string;
  staffNotes?: string;
  rejectionReason?: string;
}

export interface OfflinePaymentRecordDto {
  id: string;
  organizationId: string;
  purpose: PaymentPurpose;
  entityId: string;
  entityName?: string;
  payerId: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  amount: number;
  currency: string;
  paymentMethod: OfflinePaymentMethod;
  utrNumber?: string;
  receiptUrl?: string;
  payerNotes?: string;
  status: OfflinePaymentStatus;
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  staffReceiptNumber?: string;
  staffNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const PaymentApi = {
  /**
   * Start or continue self-service payment onboarding for an organization
   */
  startOnboarding: async (payload: {
    organizationId: string;
    recipientType?: string;
    businessName?: string;
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; data: OnboardingStatusDto }> => {
    return fetchClient('/api/payments/onboarding/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch current onboarding and settlement capability status
   */
  getOnboardingStatus: async (organizationId: string): Promise<{ success: boolean; data: OnboardingStatusDto }> => {
    return fetchClient(`/api/payments/onboarding/status/${organizationId}`, {
      method: 'GET',
    });
  },

  /**
   * Toggle online payment collection
   */
  togglePaymentsEnabled: async (organizationId: string, enabled: boolean): Promise<{ success: boolean; data: OnboardingStatusDto }> => {
    return fetchClient(`/api/payments/onboarding/toggle/${organizationId}?enabled=${enabled}`, {
      method: 'PUT',
    });
  },

  /**
   * Fetch comprehensive payment config (mode, online status & offline settings)
   */
  getPaymentConfig: async (organizationId: string): Promise<{ success: boolean; data: OrganizationPaymentConfigDto }> => {
    return fetchClient(`/api/payments/config/org/${organizationId}`, {
      method: 'GET',
    });
  },

  /**
   * Update payment config (acceptance mode, offline UPI, Bank, cash instructions)
   */
  updatePaymentConfig: async (
    organizationId: string,
    payload: Partial<OrganizationPaymentConfigDto>
  ): Promise<{ success: boolean; data: OrganizationPaymentConfigDto }> => {
    return fetchClient(`/api/payments/config/org/${organizationId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Create an authoritative payment order
   */
  createOrder: async (payload: CreatePaymentOrderPayload): Promise<{ success: boolean; data: PaymentOrderDto }> => {
    return fetchClient('/api/payments/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Verify server-side payment signature on callback
   */
  verifyPayment: async (payload: VerifyPaymentPayload): Promise<{ success: boolean; data: VerifyPaymentResult }> => {
    return fetchClient('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch payment order by reference
   */
  getOrder: async (paymentNumber: string): Promise<{ success: boolean; data: PaymentOrderDto }> => {
    return fetchClient(`/api/payments/orders/${paymentNumber}`, {
      method: 'GET',
    });
  },

  /**
   * Submit offline payment / register as pay at desk
   */
  submitOfflinePayment: async (payload: OfflinePaymentSubmitPayload): Promise<{ success: boolean; data: OfflinePaymentRecordDto }> => {
    return fetchClient('/api/payments/offline/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Staff verifies, collects cash at desk, or rejects offline payment
   */
  verifyOfflinePayment: async (payload: OfflinePaymentVerifyPayload): Promise<{ success: boolean; data: OfflinePaymentRecordDto }> => {
    return fetchClient('/api/payments/offline/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch offline ledger for an organization
   */
  getOrganizationOfflineLedger: async (
    organizationId: string,
    status?: OfflinePaymentStatus
  ): Promise<{ success: boolean; data: OfflinePaymentRecordDto[] }> => {
    const query = status ? `?status=${status}` : '';
    return fetchClient(`/api/payments/offline/organization/${organizationId}${query}`, {
      method: 'GET',
    });
  },

  /**
   * Fetch offline records for a specific entity
   */
  getEntityOfflineRecords: async (
    entityId: string,
    purpose: PaymentPurpose = 'TOURNAMENT_REGISTRATION'
  ): Promise<{ success: boolean; data: OfflinePaymentRecordDto[] }> => {
    return fetchClient(`/api/payments/offline/entity/${entityId}?purpose=${purpose}`, {
      method: 'GET',
    });
  },
};
