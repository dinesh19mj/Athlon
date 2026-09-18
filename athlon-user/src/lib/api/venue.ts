import { fetchClient } from './client';

export type VenueType = 'INDOOR' | 'OUTDOOR' | 'MIXED';
export type VenueStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'TEMPORARILY_CLOSED';
export type FacilityType = 'COURT' | 'TURF' | 'FIELD' | 'GROUND' | 'PITCH' | 'PRACTICE_NET' | 'TRACK' | 'POOL' | 'TABLE' | 'HALL' | 'ARENA' | 'MULTI_PURPOSE' | 'OTHER';
export type FacilityStatus = 'ACTIVE' | 'MAINTENANCE' | 'TEMPORARILY_CLOSED' | 'INACTIVE';
export type SurfaceType = 'WOODEN' | 'SYNTHETIC' | 'ACRYLIC' | 'CLAY' | 'NATURAL_GRASS' | 'ARTIFICIAL_TURF' | 'CONCRETE' | 'RUBBER' | 'OTHER';
export type PricingType = 'STANDARD' | 'PEAK' | 'OFF_PEAK' | 'WEEKEND' | 'HOLIDAY' | 'CUSTOM';
export type BookingStatus = 'PENDING' | 'HELD' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUND_PENDING' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
export type BookingSource = 'ATHLON_APP' | 'VENUE_ADMIN' | 'WALK_IN' | 'PHONE' | 'ACADEMY' | 'CLUB' | 'TOURNAMENT' | 'COACH' | 'SYSTEM';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER';
export type BlockType = 'OWNER_BLOCK' | 'MAINTENANCE' | 'PRIVATE_EVENT' | 'ACADEMY' | 'CLUB' | 'TOURNAMENT' | 'COACH' | 'OTHER';
export type ReservationType = 'ACADEMY_BATCH' | 'CLUB' | 'COACH' | 'CUSTOMER' | 'TOURNAMENT' | 'PRIVATE_EVENT' | 'MAINTENANCE' | 'INTERNAL' | 'OTHER';
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type ReservationStatus = 'ACTIVE' | 'PAUSED' | 'ENDED' | 'CANCELLED';
export type ExceptionType = 'CANCELLED' | 'TIME_CHANGED' | 'FACILITY_CHANGED' | 'CUSTOM';

export interface OperatingHour {
  id?: number;
  dayOfWeek: string;
  openingTime: string;
  closingTime: string;
  isClosed?: boolean;
}

export interface Amenity {
  id?: number;
  amenityName: string;
  iconName?: string;
  description?: string;
}

export interface VenueImage {
  id?: number;
  imageUrl: string;
  caption?: string;
  displayOrder?: number;
  isCover?: boolean;
}

export interface VenueDto {
  venueId: number;
  venueUuid: string;
  organizationId?: number;
  organizationUuid?: string;
  name: string;
  description?: string;
  venueType: VenueType;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  openingStatus?: string;
  bookingEnabled: boolean;
  status: VenueStatus;
  rulesAndRegulations?: string;
  cancellationPolicy?: string;
  operatingHours?: OperatingHour[];
  amenities?: Amenity[];
  images?: VenueImage[];
  totalFacilities?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilitySport {
  id?: number;
  sportId?: number;
  sportName: string;
  isPrimary?: boolean;
}

export interface FacilityAvailabilityRule {
  id?: number;
  dayOfWeek: string;
  availableFrom: string;
  availableTo: string;
  slotDurationMinutes?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface FacilityPricingRule {
  id?: number;
  pricingType: PricingType;
  dayOfWeek?: string;
  startTime: string;
  endTime: string;
  price: number;
  durationMinutes?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  priority?: number;
  isActive?: boolean;
}

export interface FacilityDto {
  facilityId: number;
  facilityUuid: string;
  venueId: number;
  venueUuid: string;
  venueName?: string;
  name: string;
  description?: string;
  facilityType: FacilityType;
  indoorOutdoor: string;
  surfaceType?: SurfaceType;
  capacity?: number;
  bookingEnabled: boolean;
  slotDurationMinutes: number;
  minimumBookingMinutes: number;
  maximumBookingMinutes: number;
  advanceBookingDays: number;
  cancellationEnabled: boolean;
  status: FacilityStatus;
  sports?: FacilitySport[];
  availabilityRules?: FacilityAvailabilityRule[];
  pricingRules?: FacilityPricingRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SlotDto {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'BOOKED' | 'HELD' | 'BLOCKED' | 'MAINTENANCE' | 'RESERVED' | 'CLOSED';
  price: number;
  pricingType: PricingType;
  reason?: string;
  bookingUuid?: string;
  bookingNumber?: string;
  blockUuid?: string;
  customerName?: string;
  sportName?: string;
}

export interface FacilityAvailabilityResponse {
  facilityId: number;
  facilityUuid: string;
  facilityName: string;
  venueId: number;
  venueUuid: string;
  date: string;
  slotDurationMinutes: number;
  slots: SlotDto[];
}

export interface VenueDailyAvailabilityResponse {
  venueId: number;
  venueUuid: string;
  venueName: string;
  date: string;
  facilities: FacilityAvailabilityResponse[];
}

export interface BookingStatusHistory {
  id?: number;
  previousStatus?: BookingStatus;
  newStatus: BookingStatus;
  reason?: string;
  changedBy?: number;
  changedAt?: string;
}

export interface BookingPayment {
  paymentId?: number;
  paymentUuid?: string;
  bookingId?: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  paidAt?: string;
  recordedBy?: number;
  notes?: string;
}

export interface BookingDto {
  bookingId: number;
  bookingUuid: string;
  bookingNumber: string;
  venueId: number;
  venueUuid: string;
  venueName?: string;
  facilityId: number;
  facilityUuid: string;
  facilityName?: string;
  customerUserId?: number;
  customerUserUuid?: string;
  guestName: string;
  guestPhone?: string;
  guestEmail?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  sportName?: string;
  baseAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingSource: BookingSource;
  holdExpiresAt?: string;
  cancellationReason?: string;
  cancelledBy?: number;
  cancelledAt?: string;
  notes?: string;
  statusHistories?: BookingStatusHistory[];
  payments?: BookingPayment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityBlockDto {
  id?: number;
  blockUuid: string;
  venueId: number;
  facilityId: number;
  facilityName?: string;
  blockType: BlockType;
  blockDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  notes?: string;
  createdBy?: number;
  createdAt?: string;
}

export interface FacilityMaintenanceDto {
  id?: number;
  maintenanceUuid: string;
  facilityId: number;
  facilityName?: string;
  maintenanceType: string;
  startDateTime: string;
  endDateTime: string;
  description?: string;
  status: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecurringReservationDto {
  recurringReservationId: number;
  recurringReservationUuid: string;
  venueId: number;
  facilityId: number;
  facilityName?: string;
  reservationType: ReservationType;
  referenceId?: string;
  title: string;
  recurrenceType: RecurrenceType;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  repeatInterval?: number;
  daysOfWeek: string;
  dayOfMonth?: number;
  untilCancelled?: boolean;
  status: ReservationStatus;
  notes?: string;
  exceptions?: {
    id?: number;
    occurrenceDate: string;
    exceptionType: ExceptionType;
    newStartTime?: string;
    newEndTime?: string;
    newFacilityId?: number;
    newFacilityName?: string;
    reason?: string;
  }[];
  createdAt?: string;
}

export interface RecurringConflictReportDto {
  hasConflicts: boolean;
  totalOccurrences: number;
  conflictingOccurrencesCount: number;
  conflicts: {
    date: string;
    startTime: string;
    endTime: string;
    conflictType: string;
    conflictDescription: string;
    referenceNumber: string;
  }[];
  validOccurrenceDates: string[];
}

export interface VenueReportSummaryDto {
  venueId: number;
  venueName: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  averageUtilizationPercentage: number;
  bookingsBySport: Record<string, number>;
  bookingsBySource: Record<string, number>;
  facilityPerformances: {
    facilityId: number;
    facilityName: string;
    totalBookings: number;
    revenue: number;
    utilizationPercentage: number;
  }[];
}

// ----------------------------------------------------
// API Client Functions
// ----------------------------------------------------

export const venueApi = {
  createVenue: (data: Partial<VenueDto>) =>
    fetchClient<{ success: boolean; data: VenueDto; message?: string }>('/api/identity/venues', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVenue: (venueUuid: string, data: Partial<VenueDto>) =>
    fetchClient<{ success: boolean; data: VenueDto; message?: string }>(`/api/identity/venues/${venueUuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getVenueByUuid: (venueUuid: string) =>
    fetchClient<{ success: boolean; data: VenueDto }>(`/api/identity/venues/${venueUuid}`),

  getVenuesByOrganization: (orgUuid: string) =>
    fetchClient<{ success: boolean; data: VenueDto[] }>(`/api/identity/venues/organization/${orgUuid}`),

  getPublicVenues: (city?: string) =>
    fetchClient<{ success: boolean; data: VenueDto[] }>(
      `/api/identity/venues/public${city ? `?city=${encodeURIComponent(city)}` : ''}`
    ),

  getVenueAvailability: (venueId: number, date: string) =>
    fetchClient<{ success: boolean; data: VenueDailyAvailabilityResponse }>(
      `/api/identity/venues/${venueId}/availability?date=${date}`
    ),

  getVenueReport: (venueId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchClient<{ success: boolean; data: VenueReportSummaryDto }>(`/api/identity/venues/${venueId}/report${qs}`);
  },
};

export const facilityApi = {
  createFacility: (data: any) =>
    fetchClient<{ success: boolean; data: FacilityDto; message?: string }>('/api/identity/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFacility: (facilityUuid: string, data: any) =>
    fetchClient<{ success: boolean; data: FacilityDto; message?: string }>(`/api/identity/facilities/${facilityUuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getFacilityByUuid: (facilityUuid: string) =>
    fetchClient<{ success: boolean; data: FacilityDto }>(`/api/identity/facilities/${facilityUuid}`),

  getFacilitiesByVenue: (venueId: number) =>
    fetchClient<{ success: boolean; data: FacilityDto[] }>(`/api/identity/facilities/venue/${venueId}`),

  getFacilityAvailability: (facilityId: number, date: string) =>
    fetchClient<{ success: boolean; data: FacilityAvailabilityResponse }>(
      `/api/identity/facilities/${facilityId}/availability?date=${date}`
    ),

  createBlock: (data: any) =>
    fetchClient<{ success: boolean; data: FacilityBlockDto; message?: string }>('/api/identity/facilities/blocks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBlocksByVenue: (venueId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchClient<{ success: boolean; data: FacilityBlockDto[] }>(`/api/identity/facilities/blocks/venue/${venueId}${qs}`);
  },

  deleteBlock: (blockUuid: string) =>
    fetchClient<{ success: boolean; message?: string }>(`/api/identity/facilities/blocks/${blockUuid}`, {
      method: 'DELETE',
    }),

  createMaintenance: (data: any) =>
    fetchClient<{ success: boolean; data: FacilityMaintenanceDto; message?: string }>('/api/identity/facilities/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMaintenanceByFacility: (facilityId: number) =>
    fetchClient<{ success: boolean; data: FacilityMaintenanceDto[] }>(`/api/identity/facilities/maintenance/facility/${facilityId}`),
};

export const bookingApi = {
  createBooking: (data: any) =>
    fetchClient<{ success: boolean; data: BookingDto; message?: string }>('/api/identity/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  holdSlot: (data: any) =>
    fetchClient<{ success: boolean; data: BookingDto; message?: string }>('/api/identity/bookings/hold', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBookingByUuid: (bookingUuid: string) =>
    fetchClient<{ success: boolean; data: BookingDto }>(`/api/identity/bookings/${bookingUuid}`),

  getBookingsByVenue: (venueId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchClient<{ success: boolean; data: BookingDto[] }>(`/api/identity/bookings/venue/${venueId}${qs}`);
  },

  getMyBookings: (userUuid?: string) => {
    const qs = userUuid ? `?userUuid=${encodeURIComponent(userUuid)}` : '';
    return fetchClient<{ success: boolean; data: BookingDto[] }>(`/api/identity/bookings/my-bookings${qs}`);
  },

  updateBookingStatus: (bookingUuid: string, status: BookingStatus, reason?: string) => {
    const params = new URLSearchParams({ status });
    if (reason) params.append('reason', reason);
    return fetchClient<{ success: boolean; data: BookingDto; message?: string }>(
      `/api/identity/bookings/${bookingUuid}/status?${params.toString()}`,
      { method: 'PUT' }
    );
  },

  cancelBooking: (bookingUuid: string, reason?: string) =>
    fetchClient<{ success: boolean; data: BookingDto; message?: string }>(`/api/identity/bookings/${bookingUuid}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  recordPayment: (bookingUuid: string, paymentData: any) =>
    fetchClient<{ success: boolean; data: BookingDto; message?: string }>(`/api/identity/bookings/${bookingUuid}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};

export const recurringReservationApi = {
  checkConflicts: (data: any) =>
    fetchClient<{ success: boolean; data: RecurringConflictReportDto }>('/api/identity/recurring-reservations/check-conflicts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createRecurringReservation: (data: any) =>
    fetchClient<{ success: boolean; data: RecurringReservationDto; message?: string }>('/api/identity/recurring-reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getByVenue: (venueId: number) =>
    fetchClient<{ success: boolean; data: RecurringReservationDto[] }>(`/api/identity/recurring-reservations/venue/${venueId}`),

  addException: (reservationId: number, data: any) =>
    fetchClient<{ success: boolean; data: RecurringReservationDto; message?: string }>(
      `/api/identity/recurring-reservations/${reservationId}/exceptions`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  updateStatus: (reservationId: number, status: ReservationStatus) =>
    fetchClient<{ success: boolean; data: RecurringReservationDto; message?: string }>(
      `/api/identity/recurring-reservations/${reservationId}/status?status=${status}`,
      { method: 'PUT' }
    ),
};

export const VenueService = venueApi;
export const FacilityService = facilityApi;
export const BookingService = bookingApi;
export const RecurringReservationService = recurringReservationApi;

