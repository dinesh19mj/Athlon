import { api } from './client';

export interface TournamentAnnouncement {
  id: number;
  uuid: string;
  tournamentId?: number;
  tournamentUuid?: string;
  title: string;
  content: string;
  sport: string;
  matchFormat?: string;
  category?: string;
  categoryDetails?: string;
  posterUrl?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  venueName?: string;
  city?: string;
  district?: string;
  state?: string;
  address?: string;
  locationMapUrl?: string;
  entryFee?: string;
  prizePool?: string;
  organizerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  externalRegistrationUrl?: string;
  upiQrCodeUrl?: string;
  userUuid?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TournamentAnnouncementCreateData {
  title: string;
  content: string;
  sport?: string;
  matchFormat?: string;
  category?: string;
  categoryDetails?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  venueName?: string;
  city?: string;
  district?: string;
  state?: string;
  address?: string;
  locationMapUrl?: string;
  entryFee?: string;
  prizePool?: string;
  organizerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  externalRegistrationUrl?: string;
  userUuid?: string;
  poster?: File | null;
  upiQr?: File | null;
}

export const getAnnouncementPosterUrl = (posterPath?: string): string => {
  if (!posterPath) return '';
  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) return posterPath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const cleanPath = posterPath.startsWith('/') && posterPath.includes(':')
    ? posterPath.substring(1)
    : posterPath;
  return `${baseUrl}/api/tournament/announcements/getFile?filePath=${encodeURIComponent(cleanPath)}`;
};

export const TournamentAnnouncementService = {
  getAll: (sport?: string, city?: string, matchFormat?: string, category?: string) => {
    const params = new URLSearchParams();
    if (sport && sport !== 'all') params.append('sport', sport);
    if (city && city.trim()) params.append('city', city.trim());
    if (matchFormat && matchFormat.trim()) params.append('matchFormat', matchFormat.trim());
    if (category && category.trim()) params.append('category', category.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<{ data: TournamentAnnouncement[] }>(`/api/tournament/announcements/public/all${query}`);
  },

  getByUuid: (uuid: string) => {
    if (!uuid || !uuid.trim()) {
      return Promise.reject(new Error('Announcement UUID is required'));
    }
    return api.get<{ data: TournamentAnnouncement }>(`/api/tournament/announcements/getByUuid/${uuid}`);
  },

  getMyAnnouncements: (userUuid: string) => {
    if (!userUuid || !userUuid.trim()) {
      return Promise.resolve({ data: [] as TournamentAnnouncement[], success: true, message: '', timestamp: '' });
    }
    return api.get<{ data: TournamentAnnouncement[] }>(`/api/tournament/announcements/my-announcements/${userUuid}`);
  },

  create: (data: TournamentAnnouncementCreateData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.sport) formData.append('sport', data.sport);
    if (data.matchFormat) formData.append('matchFormat', data.matchFormat);
    if (data.category) formData.append('category', data.category);
    if (data.categoryDetails) formData.append('categoryDetails', data.categoryDetails);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.registrationDeadline) formData.append('registrationDeadline', data.registrationDeadline);
    if (data.venueName) formData.append('venueName', data.venueName);
    if (data.city) formData.append('city', data.city);
    if (data.district) formData.append('district', data.district);
    if (data.state) formData.append('state', data.state);
    if (data.address) formData.append('address', data.address);
    if (data.locationMapUrl) formData.append('locationMapUrl', data.locationMapUrl);
    if (data.entryFee) formData.append('entryFee', data.entryFee);
    if (data.prizePool) formData.append('prizePool', data.prizePool);
    if (data.organizerName) formData.append('organizerName', data.organizerName);
    if (data.contactPhone) formData.append('contactPhone', data.contactPhone);
    if (data.contactEmail) formData.append('contactEmail', data.contactEmail);
    if (data.whatsappNumber) formData.append('whatsappNumber', data.whatsappNumber);
    if (data.externalRegistrationUrl) formData.append('externalRegistrationUrl', data.externalRegistrationUrl);
    if (data.userUuid) formData.append('userUuid', data.userUuid);

    if (data.poster) {
      formData.append('poster', data.poster);
    }
    if (data.upiQr) {
      formData.append('upiQr', data.upiQr);
    }

    return api.post<{ data: TournamentAnnouncement }>('/api/tournament/announcements/create', formData);
  },

  update: (uuid: string, formData: FormData) => {
    return api.post<{ data: TournamentAnnouncement }>(`/api/tournament/announcements/update/${uuid}`, formData);
  },

  deactivate: (uuid: string) => {
    return api.post<{ data: void }>(`/api/tournament/announcements/deactivate/${uuid}`, {});
  },

  updateStatus: (uuid: string, status: 'OPEN' | 'CLOSED', userUuid: string) => {
    const params = new URLSearchParams({ status, userUuid });
    return api.post<{ data: TournamentAnnouncement }>(
      `/api/tournament/announcements/status/${uuid}?${params.toString()}`,
      {}
    );
  },
};
