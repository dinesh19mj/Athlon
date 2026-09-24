package com.athlon.identityservice.community.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.community.dto.CommunityMemberDto;
import com.athlon.identityservice.community.dto.CommunityResponse;
import com.athlon.identityservice.community.dto.CreateAnnouncementRequest;
import com.athlon.identityservice.community.dto.CreateCommentRequest;
import com.athlon.identityservice.community.dto.CreateCommunityRequest;
import com.athlon.identityservice.community.dto.CreateExpenseRequest;
import com.athlon.identityservice.community.dto.CreatePollRequest;
import com.athlon.identityservice.community.dto.CreatePostRequest;
import com.athlon.identityservice.community.dto.CreateSessionRequest;
import com.athlon.identityservice.community.dto.CreateTeamRequest;
import com.athlon.identityservice.community.dto.MarkAttendanceRequest;
import com.athlon.identityservice.community.dto.RecordMatchRequest;
import com.athlon.identityservice.community.dto.ResolveJoinRequest;
import com.athlon.identityservice.community.dto.SessionResponse;
import com.athlon.identityservice.community.dto.SessionRsvpRequest;
import com.athlon.identityservice.community.dto.VotePollRequest;
import com.athlon.identityservice.community.entity.CommunityAnnouncement;
import com.athlon.identityservice.community.entity.CommunityExpense;
import com.athlon.identityservice.community.entity.CommunityMatch;
import com.athlon.identityservice.community.entity.CommunityPoll;
import com.athlon.identityservice.community.entity.CommunityPost;
import com.athlon.identityservice.community.entity.CommunityPostComment;
import com.athlon.identityservice.community.entity.CommunityTeam;
import com.athlon.identityservice.community.service.CommunityService;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/community")
public class CommunityController {

    @Autowired
    private CommunityService communityService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserProfileRepository userProfileRepository;

    public CommunityController() {
    }

    // ──────────────────────────────────────────
    // Authentication & Profile Context Helpers
    // ──────────────────────────────────────────

    private Long parseUserId(String userIdHeader, String userUuidHeader) {
        if (userIdHeader != null && !userIdHeader.trim().isEmpty() && !"undefined".equalsIgnoreCase(userIdHeader) && !"null".equalsIgnoreCase(userIdHeader)) {
            try {
                return Long.parseLong(userIdHeader.trim());
            } catch (Exception ignored) {}
        }
        if (userUuidHeader != null && !userUuidHeader.trim().isEmpty() && !"undefined".equalsIgnoreCase(userUuidHeader) && !"null".equalsIgnoreCase(userUuidHeader)) {
            try {
                UUID uuid = UUID.fromString(userUuidHeader.trim());
                Long uid = userRepository.findByUserUuid(uuid)
                        .map(User::getUserId)
                        .orElse(null);
                if (uid != null) return uid;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private UUID parseUserUuid(String userUuidHeader, String userIdHeader) {
        if (userUuidHeader != null && !userUuidHeader.trim().isEmpty() && !"undefined".equalsIgnoreCase(userUuidHeader) && !"null".equalsIgnoreCase(userUuidHeader)) {
            try {
                return UUID.fromString(userUuidHeader.trim());
            } catch (Exception ignored) {}
        }
        if (userIdHeader != null && !userIdHeader.trim().isEmpty() && !"undefined".equalsIgnoreCase(userIdHeader) && !"null".equalsIgnoreCase(userIdHeader)) {
            try {
                Long uid = Long.parseLong(userIdHeader.trim());
                UUID uuid = userRepository.findById(uid)
                        .map(User::getUserUuid)
                        .orElse(null);
                if (uuid != null) return uuid;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String getUserName(UUID userUuid, Long userId) {
        if (userUuid != null) {
            UserProfile profile = userProfileRepository.findByUserUuid(userUuid).orElse(null);
            if (profile != null) {
                String full = (profile.getFirstName() + " " + (profile.getLastName() != null ? profile.getLastName() : "")).trim();
                if (!full.isEmpty()) return full;
            }
        }
        if (userId != null) {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                String full = (profile.getFirstName() + " " + (profile.getLastName() != null ? profile.getLastName() : "")).trim();
                if (!full.isEmpty()) return full;
            }
        }
        return "Athlete";
    }

    private String getUserAvatar(UUID userUuid, Long userId) {
        if (userUuid != null) {
            UserProfile profile = userProfileRepository.findByUserUuid(userUuid).orElse(null);
            if (profile != null) {
                return profile.getPhoto();
            }
        }
        if (userId != null) {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                return profile.getPhoto();
            }
        }
        return null;
    }

    // ==========================================
    // 1. Community Discovery & Lifecycle
    // ==========================================

    @PostMapping("/createCommunity")
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @Valid @RequestBody CreateCommunityRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing: Valid user UUID required");
        }
        String userName = getUserName(userUuid, userId);

        CommunityResponse response = communityService.createCommunity(request, userId, userUuid, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Community created successfully", response));
    }

    @GetMapping("/getAllCommunities")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getAllCommunities(
            @RequestParam(value = "sport", required = false) String sport,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "query", required = false) String query,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        List<CommunityResponse> response = communityService.searchDiscoverCommunities(sport, city, query, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Communities retrieved successfully", response));
    }

    @GetMapping("/getMyCommunities")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getMyCommunities(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing: Valid user login required");
        }
        List<CommunityResponse> response = communityService.getMyCommunities(userUuid);
        return ResponseEntity.ok(ApiResponse.success("User communities retrieved successfully", response));
    }

    @GetMapping("/getCommunityByUuid/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunityByUuid(
            @PathVariable("communityUuid") UUID communityUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        CommunityResponse response = communityService.getCommunityByUuid(communityUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Community profile retrieved successfully", response));
    }

    @PostMapping("/updatePlan/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityResponse>> updatePlan(
            @PathVariable("communityUuid") UUID communityUuid,
            @RequestParam("planType") com.athlon.identityservice.community.enums.CommunityPlanType planType,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing: Valid user login required");
        }
        CommunityResponse response = communityService.updatePlan(communityUuid, planType, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Community plan updated successfully", response));
    }

    // ==========================================
    // 2. Membership & Join Requests
    // ==========================================

    @PostMapping("/joinCommunity/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityMemberDto>> joinCommunity(
            @PathVariable("communityUuid") UUID communityUuid,
            @RequestParam(value = "requestMessage", required = false) String requestMessage,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing: Valid user login required");
        }
        String userName = getUserName(userUuid, userId);
        String avatar = getUserAvatar(userUuid, userId);

        CommunityMemberDto member = communityService.joinCommunity(communityUuid, userUuid, userId, userName, avatar, requestMessage);
        return ResponseEntity.ok(ApiResponse.success("Join request processed successfully", member));
    }

    @PostMapping("/leaveCommunity/{communityUuid}")
    public ResponseEntity<ApiResponse<Void>> leaveCommunity(
            @PathVariable("communityUuid") UUID communityUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing: Valid user login required");
        }
        communityService.leaveCommunity(communityUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Left community successfully", null));
    }

    @GetMapping("/getCommunityMembers/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityMemberDto>>> getCommunityMembers(
            @PathVariable("communityUuid") UUID communityUuid
    ) {
        List<CommunityMemberDto> members = communityService.getCommunityMembers(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Community members retrieved successfully", members));
    }

    @PostMapping("/resolveJoinRequest/{communityUuid}/{targetUserUuid}")
    public ResponseEntity<ApiResponse<CommunityMemberDto>> resolveJoinRequest(
            @PathVariable("communityUuid") UUID communityUuid,
            @PathVariable("targetUserUuid") UUID targetUserUuid,
            @Valid @RequestBody ResolveJoinRequest resolveRequest,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID adminUserUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (adminUserUuid == null) {
            throw new BadRequestException("Admin authentication context missing");
        }
        CommunityMemberDto member = communityService.resolveJoinRequest(communityUuid, targetUserUuid, resolveRequest, adminUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Join request resolved successfully", member));
    }

    @DeleteMapping("/removeCommunityMember/{communityUuid}/{targetUserUuid}")
    public ResponseEntity<ApiResponse<Void>> removeCommunityMember(
            @PathVariable("communityUuid") UUID communityUuid,
            @PathVariable("targetUserUuid") UUID targetUserUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID adminUserUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (adminUserUuid == null) {
            throw new BadRequestException("Admin authentication context missing");
        }
        communityService.removeMember(communityUuid, targetUserUuid, adminUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Member removed successfully", null));
    }

    @PutMapping("/updateCommunityMemberRole/{communityUuid}/{targetUserUuid}")
    public ResponseEntity<ApiResponse<CommunityMemberDto>> updateCommunityMemberRole(
            @PathVariable("communityUuid") UUID communityUuid,
            @PathVariable("targetUserUuid") UUID targetUserUuid,
            @RequestParam("role") com.athlon.identityservice.community.enums.CommunityRole role,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID adminUserUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (adminUserUuid == null) {
            throw new BadRequestException("Admin authentication context missing");
        }
        CommunityMemberDto updated = communityService.updateMemberRole(communityUuid, targetUserUuid, role, adminUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Member role updated successfully", updated));
    }

    // ==========================================
    // 3. "Let's Play" Sessions, RSVPs & Attendance
    // ==========================================

    @PostMapping("/createSession/{communityUuid}")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody CreateSessionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, userId);

        SessionResponse response = communityService.createSession(communityUuid, request, userUuid, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Session scheduled successfully", response));
    }

    @GetMapping("/getSessions/{communityUuid}")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getSessions(
            @PathVariable("communityUuid") UUID communityUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        List<SessionResponse> sessions = communityService.getSessions(communityUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Community sessions retrieved successfully", sessions));
    }

    @GetMapping({"/allSessions", "/getAllSessions", "/getPublicSessions"})
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getAllSessions(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        List<SessionResponse> sessions = communityService.getAllSessions(userUuid);
        return ResponseEntity.ok(ApiResponse.success("All community sessions retrieved successfully", sessions));
    }

    @GetMapping("/getSessionByUuid/{sessionUuid}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionByUuid(
            @PathVariable("sessionUuid") UUID sessionUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        SessionResponse response = communityService.getSessionByUuid(sessionUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Session details retrieved successfully", response));
    }

    @PostMapping("/rsvpSession/{sessionUuid}")
    public ResponseEntity<ApiResponse<SessionResponse>> rsvpSession(
            @PathVariable("sessionUuid") UUID sessionUuid,
            @Valid @RequestBody SessionRsvpRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, userId);
        String avatar = getUserAvatar(userUuid, userId);

        SessionResponse response = communityService.rsvpSession(sessionUuid, request, userUuid, userId, userName, avatar);
        return ResponseEntity.ok(ApiResponse.success("RSVP updated successfully", response));
    }

    @PostMapping("/markAttendance/{sessionUuid}")
    public ResponseEntity<ApiResponse<Void>> markAttendance(
            @PathVariable("sessionUuid") UUID sessionUuid,
            @Valid @RequestBody MarkAttendanceRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID adminUserUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (adminUserUuid == null) {
            throw new BadRequestException("Admin authentication context missing");
        }
        communityService.markAttendance(sessionUuid, request, adminUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", null));
    }

    @DeleteMapping("/deleteSession/{sessionUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable("sessionUuid") UUID sessionUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        communityService.deleteSession(sessionUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Session deleted successfully", null));
    }

    // ==========================================
    // 4. Feed Posts & Comments & Reactions
    // ==========================================

    @PostMapping("/createPost/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityPost>> createPost(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody CreatePostRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);
        String avatar = getUserAvatar(userUuid, null);

        CommunityPost post = communityService.createPost(communityUuid, request, userUuid, userName, avatar);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Post created successfully", post));
    }

    @GetMapping("/getFeed/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityPost>>> getFeed(
            @PathVariable("communityUuid") UUID communityUuid
    ) {
        List<CommunityPost> posts = communityService.getFeed(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Feed posts retrieved successfully", posts));
    }

    @PostMapping("/reactToPost/{postId}")
    public ResponseEntity<ApiResponse<Void>> reactToPost(
            @PathVariable("postId") Long postId,
            @RequestParam(value = "reactionType", required = false, defaultValue = "LIKE") String reactionType,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);

        communityService.reactPost(postId, reactionType != null ? reactionType : "LIKE", userUuid, userName);
        return ResponseEntity.ok(ApiResponse.success("Reaction recorded successfully", null));
    }

    @PostMapping("/addComment/{postId}")
    public ResponseEntity<ApiResponse<CommunityPostComment>> addComment(
            @PathVariable("postId") Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);
        String avatar = getUserAvatar(userUuid, null);

        CommunityPostComment comment = communityService.addPostComment(postId, request, userUuid, userName, avatar);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added successfully", comment));
    }

    @GetMapping("/getPostComments/{postId}")
    public ResponseEntity<ApiResponse<List<CommunityPostComment>>> getPostComments(
            @PathVariable("postId") Long postId
    ) {
        List<CommunityPostComment> comments = communityService.getPostComments(postId);
        return ResponseEntity.ok(ApiResponse.success("Post comments retrieved successfully", comments));
    }

    // ==========================================
    // 5. Announcements & Polls
    // ==========================================

    @PostMapping("/createAnnouncement/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityAnnouncement>> createAnnouncement(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody CreateAnnouncementRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);
        String avatar = getUserAvatar(userUuid, null);

        CommunityAnnouncement announcement = communityService.createAnnouncement(communityUuid, request, userUuid, userName, avatar);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Announcement posted successfully", announcement));
    }

    @GetMapping("/getAnnouncements/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityAnnouncement>>> getAnnouncements(
            @PathVariable("communityUuid") UUID communityUuid
    ) {
        List<CommunityAnnouncement> list = communityService.getAnnouncements(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved successfully", list));
    }

    @PostMapping("/createPoll/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityPoll>> createPoll(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody CreatePollRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);

        CommunityPoll poll = communityService.createPoll(communityUuid, request, userUuid, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Poll created successfully", poll));
    }

    @GetMapping("/getPolls/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityPoll>>> getPolls(
            @PathVariable("communityUuid") UUID communityUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        List<CommunityPoll> list = communityService.getPolls(communityUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Community polls retrieved successfully", list));
    }

    @PostMapping("/votePoll/{pollId}")
    public ResponseEntity<ApiResponse<Void>> votePoll(
            @PathVariable("pollId") Long pollId,
            @Valid @RequestBody VotePollRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, userId);

        communityService.votePoll(pollId, request, userUuid, userId, userName);
        return ResponseEntity.ok(ApiResponse.success("Vote recorded successfully", null));
    }

    // ==========================================
    // 6. Internal Squads, Matches & Expenses
    // ==========================================

    @PostMapping("/createTeam/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityTeam>> createTeam(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody CreateTeamRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);

        CommunityTeam team = communityService.createTeam(communityUuid, request, userUuid, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Team created successfully", team));
    }

    @GetMapping("/getTeams/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityTeam>>> getTeams(
            @PathVariable("communityUuid") UUID communityUuid
    ) {
        List<CommunityTeam> list = communityService.getTeams(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Community teams retrieved successfully", list));
    }

    @PostMapping("/recordMatch/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityMatch>> recordMatch(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody RecordMatchRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);

        CommunityMatch match = communityService.recordMatch(communityUuid, request, userUuid, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Match recorded successfully", match));
    }

    @GetMapping("/getMatches/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityMatch>>> getMatches(
            @PathVariable("communityUuid") UUID communityUuid
    ) {
        List<CommunityMatch> list = communityService.getMatches(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Match history retrieved successfully", list));
    }

    @PostMapping("/createExpense/{communityUuid}")
    public ResponseEntity<ApiResponse<CommunityExpense>> createExpense(
            @PathVariable("communityUuid") UUID communityUuid,
            @Valid @RequestBody CreateExpenseRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader
    ) {
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        if (userUuid == null) {
            throw new BadRequestException("Authentication context missing");
        }
        String userName = getUserName(userUuid, null);

        CommunityExpense expense = communityService.createExpense(communityUuid, request, userUuid, userName);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Expense logged successfully", expense));
    }

    @GetMapping("/getExpenses/{communityUuid}")
    public ResponseEntity<ApiResponse<List<CommunityExpense>>> getExpenses(
            @PathVariable("communityUuid") UUID communityUuid
    ) {
        List<CommunityExpense> list = communityService.getExpenses(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Expenses retrieved successfully", list));
    }
}
