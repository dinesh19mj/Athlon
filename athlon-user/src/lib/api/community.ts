import { api } from './client';

export type CommunityRole = 'OWNER' | 'ADMIN' | 'COORDINATOR' | 'CAPTAIN' | 'TREASURER' | 'MEMBER';
export type CommunityMemberStatus = 'ACTIVE' | 'REQUESTED' | 'INVITED' | 'REJECTED' | 'LEFT' | 'REMOVED' | 'SUSPENDED';
export type CommunityVisibility = 'PUBLIC' | 'APPROVAL_REQUIRED' | 'PRIVATE_INVITE';
export type CommunityPlanType = 'COMMUNITY_FREE' | 'COMMUNITY_PRO';
export type SessionRsvpStatus = 'GOING' | 'MAYBE' | 'NOT_GOING';
export type SessionAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CommunityPostType = 'TEXT' | 'PHOTO' | 'ANNOUNCEMENT' | 'SESSION' | 'MATCH_RESULT' | 'TOURNAMENT' | 'ACHIEVEMENT' | 'POLL';
export type ExpenseCategory = 'SHUTTLES' | 'BALLS' | 'COURT_RENTAL' | 'EQUIPMENT' | 'REFRESHMENTS' | 'JERSEYS' | 'TOURNAMENT_ENTRY' | 'AWARDS' | 'OTHER';

export interface CommunityResponse {
  communityUuid?: string;
  orgUuid?: string;
  organizationUuid?: string;
  organizationId?: number;
  name: string;
  slug?: string;
  description?: string;
  primarySport: string;
  additionalSports?: string;
  secondarySports?: string;
  city?: string;
  area?: string;
  location?: string;
  venueName?: string;
  venueUuid?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  bannerUrl?: string;
  visibility: CommunityVisibility;
  planType: CommunityPlanType;
  memberCount: number;
  sessionsCount?: number;
  matchesCount?: number;
  tournamentsCount?: number;
  totalSessionsHosted?: number;
  isOfficialOrg?: boolean;
  currentUserRole?: CommunityRole;
  currentUserStatus?: CommunityMemberStatus;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateCommunityRequest {
  name: string;
  description?: string;
  primarySport: string;
  secondarySports?: string[];
  city?: string;
  area?: string;
  venueName?: string;
  venueUuid?: string;
  logoUrl?: string;
  bannerUrl?: string;
  visibility?: CommunityVisibility;
}

export interface CommunityMemberDto {
  memberId?: number;
  communityMemberId?: number;
  communityMemberUuid?: string;
  communityUuid?: string;
  userUuid: string;
  userId?: number;
  fullName: string;
  userName?: string;
  photoUrl?: string;
  userAvatar?: string;
  phone?: string;
  role: CommunityRole;
  status: CommunityMemberStatus;
  skillLevel?: string;
  sessionsJoined?: number;
  sessionsAttended?: number;
  matchesPlayed?: number;
  attendancePercentage?: number;
  requestMessage?: string;
  joinedAt?: string;
}

export interface SessionRsvpDto {
  rsvpId: number;
  userUuid: string;
  userId?: number;
  fullName: string;
  avatarUrl?: string;
  status: SessionRsvpStatus;
  guestsCount: number;
  comment?: string;
  createdAt: string;
}

export interface SessionResponse {
  sessionUuid: string;
  communityUuid: string;
  communityName?: string;
  title: string;
  description?: string;
  sport: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  courtDetails?: string;
  courtName?: string;
  city?: string;
  state?: string;
  googleMapUrl?: string;
  locationAddress?: string;
  genderCategory?: 'BOTH' | 'MALE' | 'FEMALE' | 'ANY' | string;
  maxMalePlayers?: number;
  maxFemalePlayers?: number;
  maxParticipants?: number;
  maxPlayers?: number;
  goingCount?: number;
  confirmedPlayersCount?: number;
  maybeCount?: number;
  skillLevelRequired?: string;
  skillLevel?: string;
  costPerPerson?: number;
  costPerPlayer?: number;
  currency?: string;
  status: SessionStatus;
  currentUserRsvp?: SessionRsvpStatus;
  rsvps: SessionRsvpDto[];
  createdAt: string;
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
  sport: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  venueUuid?: string;
  courtDetails?: string;
  courtName?: string;
  city?: string;
  state?: string;
  googleMapUrl?: string;
  locationAddress?: string;
  genderCategory?: 'BOTH' | 'MALE' | 'FEMALE' | 'ANY' | string;
  maxMalePlayers?: number;
  maxFemalePlayers?: number;
  maxParticipants?: number;
  maxPlayers?: number;
  skillLevelRequired?: string;
  skillLevel?: string;
  costPerPerson?: number;
  costPerPlayer?: number;
}

export interface SessionRsvpRequest {
  status: SessionRsvpStatus;
  guestsCount?: number;
  comment?: string;
}

export interface MarkAttendanceRequest {
  userUuid: string;
  status: SessionAttendanceStatus;
  notes?: string;
}

export interface CommunityPostComment {
  commentId: number;
  postId: number;
  userUuid: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  postId: number;
  communityUuid: string;
  userUuid: string;
  userName: string;
  userAvatar?: string;
  type: CommunityPostType;
  content?: string;
  mediaUrls?: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  referenceUuid?: string;
  createdAt: string;
}

export interface CreatePostRequest {
  type?: CommunityPostType;
  content?: string;
  mediaUrls?: string[];
  referenceUuid?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CommunityAnnouncement {
  announcementId: number;
  communityUuid: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPinned: boolean;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPinned?: boolean;
}

export interface CommunityPollOption {
  optionId: number;
  pollId: number;
  optionText: string;
  displayOrder: number;
  votesCount: number;
}

export interface CommunityPoll {
  pollId: number;
  communityUuid: string;
  question: string;
  allowMultipleChoices: boolean;
  expiresAt?: string;
  isClosed: boolean;
  totalVotes: number;
  options: CommunityPollOption[];
  userVotedOptionIds: number[];
  createdAt: string;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  allowMultipleChoices?: boolean;
  expiresAt?: string;
}

export interface VotePollRequest {
  optionIds: number[];
}

export interface CommunityTeam {
  teamId: number;
  communityUuid: string;
  name: string;
  sport: string;
  captainUserUuid?: string;
  captainName?: string;
  logoUrl?: string;
  totalMatches: number;
  matchesWon: number;
  matchesLost: number;
  createdAt: string;
}

export interface CreateTeamRequest {
  name: string;
  sport: string;
  captainUserUuid?: string;
  logoUrl?: string;
}

export interface CommunityMatch {
  matchId: number;
  communityUuid: string;
  matchDate: string;
  sport: string;
  teamAId?: number;
  teamBId?: number;
  teamAName: string;
  teamBName: string;
  scoreA?: string;
  scoreB?: string;
  winnerTeamId?: number;
  notes?: string;
  venueName?: string;
  recordedByUserName: string;
  createdAt: string;
}

export interface RecordMatchRequest {
  matchDate: string;
  sport: string;
  teamAId?: number;
  teamBId?: number;
  teamAName: string;
  teamBName: string;
  scoreA?: string;
  scoreB?: string;
  winnerTeamId?: number;
  notes?: string;
  venueName?: string;
}

export interface CommunityExpense {
  expenseId: number;
  communityUuid: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  paidByUserName?: string;
  expenseDate: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  description: string;
  paidByUserName?: string;
  expenseDate: string;
  receiptUrl?: string;
}

export interface ResolveJoinRequest {
  status: CommunityMemberStatus;
}

export const CommunityService = {
  // Discovery & CRUD
  createCommunity: (data: CreateCommunityRequest) =>
    api.post<CommunityResponse>('/api/identity/community/createCommunity', data),

  getCommunity: (communityUuid: string) =>
    api.get<CommunityResponse>(`/api/identity/community/getCommunityByUuid/${communityUuid}`),

  listCommunities: (params?: { sport?: string; city?: string; query?: string }) => {
    const search = new URLSearchParams();
    if (params?.sport) search.set('sport', params.sport);
    if (params?.city) search.set('city', params.city);
    if (params?.query) search.set('query', params.query);
    const qs = search.toString();
    return api.get<CommunityResponse[]>(`/api/identity/community/getAllCommunities${qs ? `?${qs}` : ''}`);
  },

  getMyCommunities: () =>
    api.get<CommunityResponse[]>('/api/identity/community/getMyCommunities'),

  updatePlan: (communityUuid: string, planType: CommunityPlanType) =>
    api.post<CommunityResponse>(`/api/identity/community/updatePlan/${communityUuid}?planType=${planType}`, {}),

  // Membership
  joinCommunity: (communityUuid: string, requestMessage?: string) => {
    const qs = requestMessage ? `?requestMessage=${encodeURIComponent(requestMessage)}` : '';
    return api.post<CommunityMemberDto>(`/api/identity/community/joinCommunity/${communityUuid}${qs}`, {});
  },

  leaveCommunity: (communityUuid: string) =>
    api.post<void>(`/api/identity/community/leaveCommunity/${communityUuid}`, {}),

  getMembers: (communityUuid: string) =>
    api.get<CommunityMemberDto[]>(`/api/identity/community/getCommunityMembers/${communityUuid}`),

  resolveJoinRequest: (communityUuid: string, targetUserUuid: string, status: CommunityMemberStatus) =>
    api.post<CommunityMemberDto>(`/api/identity/community/resolveJoinRequest/${communityUuid}/${targetUserUuid}`, { status }),

  removeMember: (communityUuid: string, targetUserUuid: string) =>
    api.delete<void>(`/api/identity/community/removeCommunityMember/${communityUuid}/${targetUserUuid}`),

  updateMemberRole: (communityUuid: string, targetUserUuid: string, role: CommunityRole) =>
    api.put<CommunityMemberDto>(`/api/identity/community/updateCommunityMemberRole/${communityUuid}/${targetUserUuid}?role=${role}`, {}),

  // Sessions
  createSession: (communityUuid: string, data: CreateSessionRequest) =>
    api.post<SessionResponse>(`/api/identity/community/createSession/${communityUuid}`, data),

  getSessions: (communityUuid: string) =>
    api.get<SessionResponse[]>(`/api/identity/community/getSessions/${communityUuid}`),

  getAllSessions: () =>
    api.get<SessionResponse[]>(`/api/identity/community/allSessions`),

  getSession: (sessionUuid: string) =>
    api.get<SessionResponse>(`/api/identity/community/getSessionByUuid/${sessionUuid}`),

  rsvpSession: (sessionUuid: string, data: SessionRsvpRequest) =>
    api.post<SessionResponse>(`/api/identity/community/rsvpSession/${sessionUuid}`, data),

  markAttendance: (sessionUuid: string, data: MarkAttendanceRequest) =>
    api.post<void>(`/api/identity/community/markAttendance/${sessionUuid}`, data),

  deleteSession: (sessionUuid: string) =>
    api.delete<void>(`/api/identity/community/deleteSession/${sessionUuid}`),

  // Feed & Posts
  createPost: (communityUuid: string, data: CreatePostRequest) =>
    api.post<CommunityPost>(`/api/identity/community/createPost/${communityUuid}`, data),

  getFeed: (communityUuid: string) =>
    api.get<CommunityPost[]>(`/api/identity/community/getFeed/${communityUuid}`),

  reactToPost: (postId: number, reactionType: string) =>
    api.post<void>(`/api/identity/community/reactToPost/${postId}?reactionType=${encodeURIComponent(reactionType)}`, {}),

  addComment: (postId: number, data: CreateCommentRequest) =>
    api.post<CommunityPostComment>(`/api/identity/community/addComment/${postId}`, data),

  getComments: (postId: number) =>
    api.get<CommunityPostComment[]>(`/api/identity/community/getPostComments/${postId}`),

  // Announcements
  createAnnouncement: (communityUuid: string, data: CreateAnnouncementRequest) =>
    api.post<CommunityAnnouncement>(`/api/identity/community/createAnnouncement/${communityUuid}`, data),

  getAnnouncements: (communityUuid: string) =>
    api.get<CommunityAnnouncement[]>(`/api/identity/community/getAnnouncements/${communityUuid}`),

  // Polls
  createPoll: (communityUuid: string, data: CreatePollRequest) =>
    api.post<CommunityPoll>(`/api/identity/community/createPoll/${communityUuid}`, data),

  getPolls: (communityUuid: string) =>
    api.get<CommunityPoll[]>(`/api/identity/community/getPolls/${communityUuid}`),

  votePoll: (pollId: number, optionIds: number[]) =>
    api.post<void>(`/api/identity/community/votePoll/${pollId}`, { optionIds }),

  // Teams, Matches, Expenses
  createTeam: (communityUuid: string, data: CreateTeamRequest) =>
    api.post<CommunityTeam>(`/api/identity/community/createTeam/${communityUuid}`, data),

  getTeams: (communityUuid: string) =>
    api.get<CommunityTeam[]>(`/api/identity/community/getTeams/${communityUuid}`),

  recordMatch: (communityUuid: string, data: RecordMatchRequest) =>
    api.post<CommunityMatch>(`/api/identity/community/recordMatch/${communityUuid}`, data),

  getMatches: (communityUuid: string) =>
    api.get<CommunityMatch[]>(`/api/identity/community/getMatches/${communityUuid}`),

  createExpense: (communityUuid: string, data: CreateExpenseRequest) =>
    api.post<CommunityExpense>(`/api/identity/community/createExpense/${communityUuid}`, data),

  getExpenses: (communityUuid: string) =>
    api.get<CommunityExpense[]>(`/api/identity/community/getExpenses/${communityUuid}`),
};
