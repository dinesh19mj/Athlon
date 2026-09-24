package com.athlon.identityservice.community.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.athlon.identityservice.community.entity.CommunityAttendance;
import com.athlon.identityservice.community.entity.CommunityDetails;
import com.athlon.identityservice.community.entity.CommunityExpense;
import com.athlon.identityservice.community.entity.CommunityMatch;
import com.athlon.identityservice.community.entity.CommunityMember;
import com.athlon.identityservice.community.entity.CommunityPoll;
import com.athlon.identityservice.community.entity.CommunityPollOption;
import com.athlon.identityservice.community.entity.CommunityPollVote;
import com.athlon.identityservice.community.entity.CommunityPost;
import com.athlon.identityservice.community.entity.CommunityPostComment;
import com.athlon.identityservice.community.entity.CommunityPostReaction;
import com.athlon.identityservice.community.entity.CommunitySession;
import com.athlon.identityservice.community.entity.CommunitySessionRsvp;
import com.athlon.identityservice.community.entity.CommunityTeam;
import com.athlon.identityservice.community.entity.CommunityTeamMember;
import com.athlon.identityservice.community.enums.CommunityMemberStatus;
import com.athlon.identityservice.community.enums.CommunityPlanType;
import com.athlon.identityservice.community.enums.CommunityRole;
import com.athlon.identityservice.community.enums.CommunityVisibility;
import com.athlon.identityservice.community.enums.SessionAttendanceStatus;
import com.athlon.identityservice.community.enums.SessionRsvpStatus;
import com.athlon.identityservice.community.enums.SessionStatus;
import com.athlon.identityservice.community.repository.CommunityAnnouncementRepository;
import com.athlon.identityservice.community.repository.CommunityAttendanceRepository;
import com.athlon.identityservice.community.repository.CommunityDetailsRepository;
import com.athlon.identityservice.community.repository.CommunityExpenseRepository;
import com.athlon.identityservice.community.repository.CommunityMatchRepository;
import com.athlon.identityservice.community.repository.CommunityMemberRepository;
import com.athlon.identityservice.community.repository.CommunityPollOptionRepository;
import com.athlon.identityservice.community.repository.CommunityPollRepository;
import com.athlon.identityservice.community.repository.CommunityPollVoteRepository;
import com.athlon.identityservice.community.repository.CommunityPostCommentRepository;
import com.athlon.identityservice.community.repository.CommunityPostReactionRepository;
import com.athlon.identityservice.community.repository.CommunityPostRepository;
import com.athlon.identityservice.community.repository.CommunitySessionRepository;
import com.athlon.identityservice.community.repository.CommunitySessionRsvpRepository;
import com.athlon.identityservice.community.repository.CommunityTeamMemberRepository;
import com.athlon.identityservice.community.repository.CommunityTeamRepository;
import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;

@Service
public class CommunityService {

    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;
    @Autowired
    private CommunityDetailsRepository communityDetailsRepository;
    @Autowired
    private CommunityMemberRepository communityMemberRepository;
    @Autowired
    private CommunitySessionRepository communitySessionRepository;
    @Autowired
    private CommunitySessionRsvpRepository communitySessionRsvpRepository;
    @Autowired
    private CommunityAttendanceRepository communityAttendanceRepository;
    @Autowired
    private CommunityAnnouncementRepository communityAnnouncementRepository;
    @Autowired
    private CommunityPollRepository communityPollRepository;
    @Autowired
    private CommunityPollOptionRepository communityPollOptionRepository;
    @Autowired
    private CommunityPollVoteRepository communityPollVoteRepository;
    @Autowired
    private CommunityPostRepository communityPostRepository;
    @Autowired
    private CommunityPostCommentRepository communityPostCommentRepository;
    @Autowired
    private CommunityPostReactionRepository communityPostReactionRepository;
    @Autowired
    private CommunityTeamRepository communityTeamRepository;
    @Autowired
    private CommunityTeamMemberRepository communityTeamMemberRepository;
    @Autowired
    private CommunityMatchRepository communityMatchRepository;
    @Autowired
    private CommunityExpenseRepository communityExpenseRepository;

    private static final int DEFAULT_FREE_CREATE_LIMIT = 1;
    private static final int DEFAULT_FREE_JOIN_LIMIT = 3;

    public CommunityService() {
    }

    @Transactional
    public CommunityResponse createCommunity(CreateCommunityRequest request, Long userId, UUID userUuid,
            String userName) {
        // 1. Enforce Entitlement / Creation Limit (1 Free Community per user)
        long existingOwned = communityMemberRepository.findByUserUuidAndStatus(userUuid, CommunityMemberStatus.ACTIVE)
                .stream()
                .filter(m -> m.getRole() == CommunityRole.OWNER)
                .count();
        if (existingOwned >= DEFAULT_FREE_CREATE_LIMIT) {
            throw new BadRequestException("You have reached the maximum free Community creation limit ("
                    + DEFAULT_FREE_CREATE_LIMIT + "). Upgrade to create more communities.");
        }

        // 2. Create authoritative Organization record
        Organization org = new Organization(
                request.getName(),
                request.getDescription(),
                "COMMUNITY",
                userId,
                userUuid,
                userId);
        Organization savedOrg = organizationRepository.save(org);

        // 3. Create OrganizationMember record for workspace switcher compatibility
        OrganizationMember orgMember = new OrganizationMember(
                savedOrg.getOrganizationId(),
                savedOrg.getOrganizationUuid(),
                userId,
                userUuid,
                "OWNER",
                userId);
        orgMember.setSportType(request.getPrimarySport());
        organizationMemberRepository.save(orgMember);

        // 4. Create CommunityDetails
        CommunityDetails details = new CommunityDetails();
        details.setOrganizationId(savedOrg.getOrganizationId());
        details.setOrganizationUuid(savedOrg.getOrganizationUuid());
        details.setPrimarySport(request.getPrimarySport());
        details.setAdditionalSports(request.getAdditionalSports());
        details.setVisibility(request.getVisibility() != null ? request.getVisibility() : CommunityVisibility.PUBLIC);
        details.setPlanType(CommunityPlanType.COMMUNITY_FREE);
        details.setDescription(request.getDescription());
        details.setRules(request.getRules());
        details.setLocation(request.getLocation());
        details.setCity(request.getCity());
        details.setState(request.getState());
        details.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        details.setLogoUrl(request.getLogoUrl());
        details.setCoverImageUrl(request.getCoverImageUrl());
        details.setMemberCount(1);
        CommunityDetails savedDetails = communityDetailsRepository.save(details);

        // 5. Create CommunityMember (OWNER)
        CommunityMember member = new CommunityMember();
        member.setCommunityUuid(savedOrg.getOrganizationUuid());
        member.setUserId(userId);
        member.setUserUuid(userUuid);
        member.setUserName(userName);
        member.setRole(CommunityRole.OWNER);
        member.setStatus(CommunityMemberStatus.ACTIVE);
        communityMemberRepository.save(member);

        return mapToCommunityResponse(savedOrg, savedDetails, CommunityRole.OWNER, CommunityMemberStatus.ACTIVE.name());
    }

    @Transactional(readOnly = true)
    public CommunityResponse getCommunityByUuid(UUID communityUuid, UUID currentUserUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(communityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with UUID: " + communityUuid));

        CommunityDetails details = communityDetailsRepository.findByOrganizationUuid(communityUuid)
                .orElseGet(() -> {
                    CommunityDetails d = new CommunityDetails();
                    d.setOrganizationId(org.getOrganizationId());
                    d.setOrganizationUuid(org.getOrganizationUuid());
                    d.setPrimarySport("Badminton");
                    d.setVisibility(CommunityVisibility.PUBLIC);
                    d.setPlanType(CommunityPlanType.COMMUNITY_FREE);
                    return communityDetailsRepository.save(d);
                });

        CommunityRole userRole = null;
        String userStatus = null;
        if (currentUserUuid != null) {
            Optional<CommunityMember> memberOpt = communityMemberRepository
                    .findByCommunityUuidAndUserUuid(communityUuid, currentUserUuid);
            if (memberOpt.isPresent()) {
                userRole = memberOpt.get().getRole();
                userStatus = memberOpt.get().getStatus().name();
            }
        }

        return mapToCommunityResponse(org, details, userRole, userStatus);
    }

    @Transactional
    public CommunityResponse updatePlan(UUID communityUuid, CommunityPlanType planType, UUID userUuid) {
        validateAdminOrOwner(communityUuid, userUuid);
        CommunityDetails details = communityDetailsRepository.findByOrganizationUuid(communityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with UUID: " + communityUuid));
        details.setPlanType(planType != null ? planType : CommunityPlanType.COMMUNITY_FREE);
        CommunityDetails saved = communityDetailsRepository.save(details);

        Organization org = organizationRepository.findByOrganizationUuid(communityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + communityUuid));

        Optional<CommunityMember> memberOpt = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid,
                userUuid);
        CommunityRole userRole = memberOpt.map(CommunityMember::getRole).orElse(CommunityRole.OWNER);
        String userStatus = memberOpt.map(m -> m.getStatus().name()).orElse(CommunityMemberStatus.ACTIVE.name());

        return mapToCommunityResponse(org, saved, userRole, userStatus);
    }

    @Transactional(readOnly = true)
    public List<CommunityResponse> getMyCommunities(UUID userUuid) {
        List<CommunityMember> memberships = communityMemberRepository.findByUserUuidAndStatus(userUuid,
                CommunityMemberStatus.ACTIVE);
        List<CommunityResponse> results = new ArrayList<>();
        for (CommunityMember m : memberships) {
            try {
                results.add(getCommunityByUuid(m.getCommunityUuid(), userUuid));
            } catch (Exception ignored) {
            }
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<CommunityResponse> searchDiscoverCommunities(String sport, String city, String query,
            UUID currentUserUuid) {
        List<CommunityDetails> list = communityDetailsRepository.findByVisibilityAndIsActive(CommunityVisibility.PUBLIC,
                1);

        String cleanSport = (sport != null && !sport.trim().equalsIgnoreCase("All") && !sport.trim().isEmpty())
                ? sport.trim().toLowerCase()
                : null;
        String cleanCity = (city != null && !city.trim().equalsIgnoreCase("All") && !city.trim().isEmpty())
                ? city.trim().toLowerCase()
                : null;
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;

        List<CommunityResponse> results = new ArrayList<>();
        for (CommunityDetails d : list) {
            try {
                Organization org = organizationRepository.findByOrganizationUuid(d.getOrganizationUuid()).orElse(null);
                if (org == null || (org.getIsActive() != null && org.getIsActive() == 0)) {
                    continue;
                }

                // Filter by sport
                if (cleanSport != null) {
                    boolean matchesSport = (d.getPrimarySport() != null
                            && d.getPrimarySport().toLowerCase().contains(cleanSport))
                            || (d.getAdditionalSports() != null
                                    && d.getAdditionalSports().toLowerCase().contains(cleanSport));
                    if (!matchesSport)
                        continue;
                }

                // Filter by city / location
                if (cleanCity != null) {
                    boolean matchesCity = (d.getCity() != null && d.getCity().toLowerCase().contains(cleanCity))
                            || (d.getLocation() != null && d.getLocation().toLowerCase().contains(cleanCity));
                    if (!matchesCity)
                        continue;
                }

                // Filter by query (searches organization name, description, sport, location,
                // city)
                if (cleanQuery != null) {
                    boolean matchesQuery = (org.getName() != null && org.getName().toLowerCase().contains(cleanQuery))
                            || (d.getDescription() != null && d.getDescription().toLowerCase().contains(cleanQuery))
                            || (d.getPrimarySport() != null && d.getPrimarySport().toLowerCase().contains(cleanQuery))
                            || (d.getLocation() != null && d.getLocation().toLowerCase().contains(cleanQuery))
                            || (d.getCity() != null && d.getCity().toLowerCase().contains(cleanQuery));
                    if (!matchesQuery)
                        continue;
                }

                CommunityRole role = null;
                String status = null;
                if (currentUserUuid != null) {
                    Optional<CommunityMember> m = communityMemberRepository
                            .findByCommunityUuidAndUserUuid(d.getOrganizationUuid(), currentUserUuid);
                    if (m.isPresent()) {
                        role = m.get().getRole();
                        status = m.get().getStatus().name();
                    }
                }
                results.add(mapToCommunityResponse(org, d, role, status));
            } catch (Exception ignored) {
            }
        }
        return results;
    }

    @Transactional
    public CommunityMemberDto joinCommunity(UUID communityUuid, UUID userUuid, Long userId, String userName,
            String userAvatar, String requestMessage) {
        // 1. Enforce max active communities limit
        long activeCount = communityMemberRepository.countByUserUuidAndStatus(userUuid, CommunityMemberStatus.ACTIVE);
        if (activeCount >= DEFAULT_FREE_JOIN_LIMIT) {
            throw new BadRequestException("You have reached the limit of " + DEFAULT_FREE_JOIN_LIMIT
                    + " active communities. Leave an existing community to join a new one.");
        }

        CommunityDetails details = communityDetailsRepository.findByOrganizationUuid(communityUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found with UUID: " + communityUuid));

        Optional<CommunityMember> existingOpt = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid,
                userUuid);
        CommunityMember member;
        if (existingOpt.isPresent()) {
            member = existingOpt.get();
            if (member.getStatus() == CommunityMemberStatus.ACTIVE) {
                return mapToMemberDto(member);
            }
            if (member.getStatus() == CommunityMemberStatus.SUSPENDED
                    || member.getStatus() == CommunityMemberStatus.REMOVED) {
                throw new BadRequestException(
                        "Your membership in this community has been revoked. Contact the administrator.");
            }
        } else {
            member = new CommunityMember();
            member.setCommunityUuid(communityUuid);
            member.setUserId(userId);
            member.setUserUuid(userUuid);
            member.setUserName(userName);
            member.setUserAvatar(userAvatar);
            member.setRole(CommunityRole.MEMBER);
        }

        member.setRequestMessage(requestMessage);

        if (details.getVisibility() == CommunityVisibility.PUBLIC) {
            member.setStatus(CommunityMemberStatus.ACTIVE);
            details.setMemberCount((int) communityMemberRepository.countByCommunityUuidAndStatus(communityUuid,
                    CommunityMemberStatus.ACTIVE) + 1);
            communityDetailsRepository.save(details);

            // Also synchronize with organization_members for workspace switching
            Organization org = organizationRepository.findByOrganizationUuid(communityUuid).orElse(null);
            if (org != null) {
                OrganizationMember om = new OrganizationMember(
                        org.getOrganizationId(),
                        org.getOrganizationUuid(),
                        userId,
                        userUuid,
                        "MEMBER",
                        userId);
                organizationMemberRepository.save(om);
            }
        } else if (details.getVisibility() == CommunityVisibility.APPROVAL_REQUIRED) {
            member.setStatus(CommunityMemberStatus.REQUESTED);
        } else {
            throw new BadRequestException("This community is private and accessible by invite only.");
        }

        CommunityMember saved = communityMemberRepository.save(member);
        return mapToMemberDto(saved);
    }

    @Transactional
    public CommunityMemberDto resolveJoinRequest(UUID communityUuid, UUID targetUserUuid, ResolveJoinRequest request,
            UUID adminUserUuid) {
        validateAdminOrOwner(communityUuid, adminUserUuid);

        CommunityMember member = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid, targetUserUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found for user: " + targetUserUuid));

        if (member.getStatus() != CommunityMemberStatus.REQUESTED) {
            throw new BadRequestException("Member is not in REQUESTED status");
        }

        member.setStatus(request.getStatus() == CommunityMemberStatus.ACTIVE ? CommunityMemberStatus.ACTIVE
                : CommunityMemberStatus.REJECTED);
        CommunityMember saved = communityMemberRepository.save(member);

        if (saved.getStatus() == CommunityMemberStatus.ACTIVE) {
            CommunityDetails details = communityDetailsRepository.findByOrganizationUuid(communityUuid).orElse(null);
            if (details != null) {
                details.setMemberCount((int) communityMemberRepository.countByCommunityUuidAndStatus(communityUuid,
                        CommunityMemberStatus.ACTIVE));
                communityDetailsRepository.save(details);
            }
            Organization org = organizationRepository.findByOrganizationUuid(communityUuid).orElse(null);
            if (org != null) {
                OrganizationMember om = new OrganizationMember(
                        org.getOrganizationId(),
                        org.getOrganizationUuid(),
                        saved.getUserId(),
                        saved.getUserUuid(),
                        "MEMBER",
                        saved.getUserId());
                organizationMemberRepository.save(om);
            }
        }

        return mapToMemberDto(saved);
    }

    @Transactional
    public void leaveCommunity(UUID communityUuid, UUID userUuid) {
        CommunityMember member = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid, userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found in community"));

        if (member.getRole() == CommunityRole.OWNER) {
            throw new BadRequestException("Owner cannot leave the community. Transfer ownership or archive community.");
        }

        member.setStatus(CommunityMemberStatus.LEFT);
        communityMemberRepository.save(member);

        CommunityDetails details = communityDetailsRepository.findByOrganizationUuid(communityUuid).orElse(null);
        if (details != null) {
            details.setMemberCount((int) communityMemberRepository.countByCommunityUuidAndStatus(communityUuid,
                    CommunityMemberStatus.ACTIVE));
            communityDetailsRepository.save(details);
        }
    }

    @Transactional(readOnly = true)
    public List<CommunityMemberDto> getCommunityMembers(UUID communityUuid) {
        return communityMemberRepository.findByCommunityUuid(communityUuid)
                .stream()
                .map(this::mapToMemberDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeMember(UUID communityUuid, UUID targetUserUuid, UUID adminUserUuid) {
        validateAdminOrOwner(communityUuid, adminUserUuid);
        CommunityMember member = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid, targetUserUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in community"));

        if (member.getRole() == CommunityRole.OWNER) {
            throw new BadRequestException("Owner cannot be removed from the community");
        }

        member.setStatus(CommunityMemberStatus.REMOVED);
        communityMemberRepository.save(member);

        CommunityDetails details = communityDetailsRepository.findByOrganizationUuid(communityUuid).orElse(null);
        if (details != null) {
            details.setMemberCount((int) communityMemberRepository.countByCommunityUuidAndStatus(communityUuid,
                    CommunityMemberStatus.ACTIVE));
            communityDetailsRepository.save(details);
        }
    }

    @Transactional
    public CommunityMemberDto updateMemberRole(UUID communityUuid, UUID targetUserUuid, CommunityRole newRole, UUID adminUserUuid) {
        validateAdminOrOwner(communityUuid, adminUserUuid);
        CommunityMember member = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid, targetUserUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in community"));

        if (member.getRole() == CommunityRole.OWNER && newRole != CommunityRole.OWNER) {
            throw new BadRequestException("Owner role cannot be changed directly. Transfer ownership instead.");
        }

        member.setRole(newRole);
        CommunityMember saved = communityMemberRepository.save(member);
        return mapToMemberDto(saved);
    }

    @Transactional
    public SessionResponse createSession(UUID communityUuid, CreateSessionRequest request, UUID userUuid, Long userId,
            String userName) {
        validateMember(communityUuid, userUuid);

        CommunitySession session = new CommunitySession();
        session.setCommunityUuid(communityUuid);
        session.setCreatorUserUuid(userUuid);
        session.setCreatorUserName(userName);
        session.setSport(request.getSport());
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setSessionDate(request.getSessionDate());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setVenueId(request.getVenueId());
        session.setVenueUuid(request.getVenueUuid());
        session.setVenueName(request.getVenueName());
        session.setCourtName(request.getCourtName());
        session.setCity(request.getCity());
        session.setState(request.getState());
        session.setGoogleMapUrl(request.getGoogleMapUrl());
        session.setLocationAddress(request.getLocationAddress());
        session.setGenderCategory(request.getGenderCategory() != null ? request.getGenderCategory() : "BOTH");
        session.setMaxMalePlayers(request.getMaxMalePlayers());
        Integer totalMax = request.getMaxPlayers() != null ? request.getMaxPlayers() : request.getMaxParticipants();
        if (totalMax == null) {
            int m = request.getMaxMalePlayers() != null ? request.getMaxMalePlayers() : 0;
            int f = request.getMaxFemalePlayers() != null ? request.getMaxFemalePlayers() : 0;
            if (m + f > 0) {
                totalMax = m + f;
            }
        }
        session.setMaxPlayers(totalMax);
        session.setConfirmedPlayersCount(1);
        session.setSkillLevel(request.getSkillLevel() != null ? request.getSkillLevel() : "ALL");
        session.setCostPerPlayer(request.getCostPerPlayer() != null ? request.getCostPerPlayer() : request.getCostPerPerson());
        session.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        session.setRecurrenceRule(request.getRecurrenceRule());
        session.setStatus(SessionStatus.SCHEDULED);

        CommunitySession saved = communitySessionRepository.save(session);

        // Auto RSVP creator as GOING
        CommunitySessionRsvp rsvp = new CommunitySessionRsvp();
        rsvp.setSessionUuid(saved.getSessionUuid());
        rsvp.setUserUuid(userUuid);
        rsvp.setUserId(userId);
        rsvp.setUserName(userName);
        rsvp.setRsvpStatus(SessionRsvpStatus.GOING);
        communitySessionRsvpRepository.save(rsvp);

        // Increment community session counter
        communityDetailsRepository.findByOrganizationUuid(communityUuid).ifPresent(d -> {
            d.setSessionsCount(d.getSessionsCount() + 1);
            communityDetailsRepository.save(d);
        });

        return mapToSessionResponse(saved, userUuid);
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getSessions(UUID communityUuid, UUID currentUserUuid) {
        return communitySessionRepository.findByCommunityUuidOrderBySessionDateDescStartTimeDesc(communityUuid)
                .stream()
                .map(s -> mapToSessionResponse(s, currentUserUuid))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllSessions(UUID currentUserUuid) {
        LocalDate today = LocalDate.now();
        List<CommunitySession> upcoming = communitySessionRepository
                .findBySessionDateGreaterThanEqualAndStatusOrderBySessionDateAscStartTimeAsc(today, SessionStatus.SCHEDULED);
        if (upcoming.isEmpty()) {
            upcoming = communitySessionRepository.findAllByOrderBySessionDateDescStartTimeDesc();
        }
        return upcoming.stream()
                .map(s -> mapToSessionResponse(s, currentUserUuid))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SessionResponse getSessionByUuid(UUID sessionUuid, UUID currentUserUuid) {
        CommunitySession session = communitySessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with UUID: " + sessionUuid));
        return mapToSessionResponse(session, currentUserUuid);
    }

    @Transactional
    public SessionResponse rsvpSession(UUID sessionUuid, SessionRsvpRequest request, UUID userUuid, Long userId,
            String userName, String userAvatar) {
        CommunitySession session = communitySessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with UUID: " + sessionUuid));

        // When the user joins the session, automatically make them a part of the community if not already
        Optional<CommunityMember> memberOpt = communityMemberRepository
                .findByCommunityUuidAndUserUuid(session.getCommunityUuid(), userUuid);
        if (memberOpt.isEmpty() || memberOpt.get().getStatus() != CommunityMemberStatus.ACTIVE) {
            try {
                joinCommunity(session.getCommunityUuid(), userUuid, userId, userName, userAvatar, "Joined via Session RSVP");
            } catch (Exception ignored) {
            }
        }

        Optional<CommunitySessionRsvp> rsvpOpt = communitySessionRsvpRepository
                .findBySessionUuidAndUserUuid(sessionUuid, userUuid);
        CommunitySessionRsvp rsvp = rsvpOpt.orElseGet(CommunitySessionRsvp::new);
        rsvp.setSessionUuid(sessionUuid);
        rsvp.setUserUuid(userUuid);
        rsvp.setUserId(userId);
        rsvp.setUserName(userName);
        rsvp.setUserAvatar(userAvatar);
        rsvp.setRsvpStatus(request.getRsvpStatus());
        rsvp.setGuestCount(request.getGuestCount() != null ? request.getGuestCount() : 0);
        rsvp.setNotes(request.getNotes());
        communitySessionRsvpRepository.save(rsvp);

        // Update confirmed count on session
        long goingCount = communitySessionRsvpRepository.countBySessionUuidAndRsvpStatus(sessionUuid,
                SessionRsvpStatus.GOING);
        session.setConfirmedPlayersCount((int) goingCount);
        communitySessionRepository.save(session);

        // Increment sessionsJoined on member if GOING
        communityMemberRepository.findByCommunityUuidAndUserUuid(session.getCommunityUuid(), userUuid)
                .ifPresent(m -> {
                    if (request.getRsvpStatus() == SessionRsvpStatus.GOING) {
                        m.setSessionsJoined((m.getSessionsJoined() != null ? m.getSessionsJoined() : 0) + 1);
                        communityMemberRepository.save(m);
                    }
                });

        return mapToSessionResponse(session, userUuid);
    }

    @Transactional
    public void markAttendance(UUID sessionUuid, MarkAttendanceRequest request, UUID adminUserUuid) {
        CommunitySession session = communitySessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with UUID: " + sessionUuid));

        validateAdminOrOwner(session.getCommunityUuid(), adminUserUuid);

        for (MarkAttendanceRequest.MemberAttendanceRecord rec : request.getRecords()) {
            CommunityAttendance att = communityAttendanceRepository
                    .findBySessionUuidAndUserUuid(sessionUuid, rec.getUserUuid())
                    .orElseGet(CommunityAttendance::new);
            att.setSessionUuid(sessionUuid);
            att.setCommunityUuid(session.getCommunityUuid());
            att.setUserUuid(rec.getUserUuid());
            att.setUserId(1L);
            att.setAttendanceStatus(rec.getStatus() != null ? rec.getStatus() : SessionAttendanceStatus.PRESENT);
            att.setMarkedByUserUuid(adminUserUuid);
            att.setNotes(rec.getNotes());
            communityAttendanceRepository.save(att);
        }

        session.setStatus(SessionStatus.COMPLETED);
        communitySessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(UUID sessionUuid, UUID userUuid) {
        CommunitySession session = communitySessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with UUID: " + sessionUuid));

        // Allow deletion if caller is ADMIN/OWNER of community or the session creator
        boolean isCreator = session.getCreatorUserUuid() != null && session.getCreatorUserUuid().equals(userUuid);
        if (!isCreator) {
            validateAdminOrOwner(session.getCommunityUuid(), userUuid);
        }

        communitySessionRsvpRepository.deleteBySessionUuid(sessionUuid);
        communityAttendanceRepository.deleteBySessionUuid(sessionUuid);
        communitySessionRepository.delete(session);

        communityDetailsRepository.findByOrganizationUuid(session.getCommunityUuid()).ifPresent(d -> {
            if (d.getSessionsCount() != null && d.getSessionsCount() > 0) {
                d.setSessionsCount(d.getSessionsCount() - 1);
                communityDetailsRepository.save(d);
            }
        });
    }

    @Transactional
    public CommunityAnnouncement createAnnouncement(UUID communityUuid, CreateAnnouncementRequest request,
            UUID userUuid, String userName, String userAvatar) {
        validateAdminOrOwner(communityUuid, userUuid);

        CommunityAnnouncement ann = new CommunityAnnouncement();
        ann.setCommunityUuid(communityUuid);
        ann.setTitle(request.getTitle());
        ann.setMessage(request.getMessage());
        ann.setCreatedByUserUuid(userUuid);
        ann.setCreatedByUserName(userName);
        ann.setCreatedByUserAvatar(userAvatar);
        ann.setIsPinned(request.getIsPinned() != null ? request.getIsPinned() : false);
        return communityAnnouncementRepository.save(ann);
    }

    @Transactional(readOnly = true)
    public List<CommunityAnnouncement> getAnnouncements(UUID communityUuid) {
        return communityAnnouncementRepository.findByCommunityUuidOrderByIsPinnedDescCreatedAtDesc(communityUuid);
    }

    @Transactional
    public CommunityPoll createPoll(UUID communityUuid, CreatePollRequest request, UUID userUuid, String userName) {
        validateMember(communityUuid, userUuid);

        CommunityPoll poll = new CommunityPoll();
        poll.setCommunityUuid(communityUuid);
        poll.setQuestion(request.getQuestion());
        poll.setCreatedByUserUuid(userUuid);
        poll.setCreatedByUserName(userName);
        poll.setAllowMultipleChoices(
                request.getAllowMultipleChoices() != null ? request.getAllowMultipleChoices() : false);
        poll.setExpiresAt(request.getExpiresAt());
        CommunityPoll savedPoll = communityPollRepository.save(poll);

        List<CommunityPollOption> createdOpts = new java.util.ArrayList<>();
        for (String optText : request.getOptions()) {
            CommunityPollOption opt = new CommunityPollOption(savedPoll.getPollId(), optText);
            createdOpts.add(communityPollOptionRepository.save(opt));
        }
        savedPoll.setOptions(createdOpts);

        return savedPoll;
    }

    @Transactional(readOnly = true)
    public List<CommunityPoll> getPolls(UUID communityUuid, UUID currentUserUuid) {
        List<CommunityPoll> polls = communityPollRepository.findByCommunityUuidOrderByCreatedAtDesc(communityUuid);
        for (CommunityPoll poll : polls) {
            poll.setOptions(communityPollOptionRepository.findByPollId(poll.getPollId()));
            if (currentUserUuid != null) {
                List<Long> votedOptIds = communityPollVoteRepository.findByPollIdAndUserUuid(poll.getPollId(), currentUserUuid)
                        .stream().map(CommunityPollVote::getOptionId).toList();
                poll.setUserVotedOptionIds(votedOptIds);
            }
        }
        return polls;
    }

    @Transactional
    public void votePoll(Long pollId, VotePollRequest request, UUID userUuid, Long userId, String userName) {
        CommunityPoll poll = communityPollRepository.findById(pollId)
                .orElseThrow(() -> new ResourceNotFoundException("Poll not found with ID: " + pollId));

        if (poll.getIsClosed()) {
            throw new BadRequestException("This poll is closed for voting");
        }

        if (!poll.getAllowMultipleChoices()
                && communityPollVoteRepository.existsByPollIdAndUserUuid(pollId, userUuid)) {
            throw new BadRequestException("You have already voted in this poll");
        }

        for (Long optId : request.getOptionIds()) {
            CommunityPollOption option = communityPollOptionRepository.findById(optId).orElse(null);
            if (option != null && option.getPollId().equals(pollId)) {
                if (communityPollVoteRepository.findByPollIdAndOptionIdAndUserUuid(pollId, optId, userUuid).isEmpty()) {
                    CommunityPollVote vote = new CommunityPollVote(pollId, optId, userUuid, userId, userName);
                    communityPollVoteRepository.save(vote);
                    option.setVotesCount(option.getVotesCount() + 1);
                    communityPollOptionRepository.save(option);
                }
            }
        }

        poll.setTotalVotes(poll.getTotalVotes() + 1);
        communityPollRepository.save(poll);
    }

    @Transactional
    public CommunityPost createPost(UUID communityUuid, CreatePostRequest request, UUID userUuid, String userName,
            String userAvatar) {
        validateMember(communityUuid, userUuid);

        CommunityPost post = new CommunityPost();
        post.setCommunityUuid(communityUuid);
        post.setAuthorUserUuid(userUuid);
        post.setAuthorName(userName);
        post.setAuthorAvatar(userAvatar);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setPostType(request.getPostType());
        post.setMediaUrls(request.getMediaUrls());
        post.setReferenceUuid(request.getReferenceUuid());
        post.setIsPinned(request.getIsPinned() != null ? request.getIsPinned() : false);
        return communityPostRepository.save(post);
    }

    @Transactional(readOnly = true)
    public List<CommunityPost> getFeed(UUID communityUuid) {
        return communityPostRepository.findByCommunityUuidOrderByIsPinnedDescCreatedAtDesc(communityUuid);
    }

    @Transactional
    public void reactPost(Long postId, String reactionType, UUID userUuid, String userName) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));

        Optional<CommunityPostReaction> opt = communityPostReactionRepository.findByPostIdAndUserUuid(postId, userUuid);
        if (opt.isPresent()) {
            communityPostReactionRepository.delete(opt.get());
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
        } else {
            CommunityPostReaction reaction = new CommunityPostReaction(postId, userUuid, userName, reactionType);
            communityPostReactionRepository.save(reaction);
            post.setLikesCount(post.getLikesCount() + 1);
        }
        communityPostRepository.save(post);
    }

    @Transactional
    public CommunityPostComment addPostComment(Long postId, CreateCommentRequest request, UUID userUuid,
            String userName, String userAvatar) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + postId));

        CommunityPostComment comment = new CommunityPostComment(
                postId,
                userUuid,
                userName,
                userAvatar,
                request.getCommentText());
        CommunityPostComment saved = communityPostCommentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        communityPostRepository.save(post);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CommunityPostComment> getPostComments(Long postId) {
        return communityPostCommentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    @Transactional
    public CommunityTeam createTeam(UUID communityUuid, CreateTeamRequest request, UUID userUuid, String userName) {
        validateMember(communityUuid, userUuid);

        CommunityTeam team = new CommunityTeam();
        team.setCommunityUuid(communityUuid);
        team.setName(request.getName());
        team.setSport(request.getSport());
        team.setLogoUrl(request.getLogoUrl());
        team.setCaptainUserUuid(request.getCaptainUserUuid() != null ? request.getCaptainUserUuid() : userUuid);
        team.setCaptainName(userName);
        team.setMembersCount(1 + (request.getMemberUserUuids() != null ? request.getMemberUserUuids().size() : 0));
        CommunityTeam saved = communityTeamRepository.save(team);

        // Add captain
        CommunityTeamMember captain = new CommunityTeamMember(
                saved.getTeamId(),
                saved.getTeamUuid(),
                userUuid,
                1L,
                userName,
                null,
                "CAPTAIN");
        communityTeamMemberRepository.save(captain);

        if (request.getMemberUserUuids() != null) {
            for (UUID memberUuid : request.getMemberUserUuids()) {
                if (!memberUuid.equals(userUuid)) {
                    CommunityTeamMember tm = new CommunityTeamMember(
                            saved.getTeamId(),
                            saved.getTeamUuid(),
                            memberUuid,
                            1L,
                            "Member",
                            null,
                            "PLAYER");
                    communityTeamMemberRepository.save(tm);
                }
            }
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CommunityTeam> getTeams(UUID communityUuid) {
        return communityTeamRepository.findByCommunityUuidOrderByCreatedAtDesc(communityUuid);
    }

    @Transactional
    public CommunityMatch recordMatch(UUID communityUuid, RecordMatchRequest request, UUID userUuid, String userName) {
        validateMember(communityUuid, userUuid);

        CommunityMatch match = new CommunityMatch();
        match.setCommunityUuid(communityUuid);
        match.setSessionUuid(request.getSessionUuid());
        match.setSport(request.getSport());
        match.setMatchType(request.getMatchType());
        match.setTeamAName(request.getTeamAName());
        match.setTeamBName(request.getTeamBName());
        match.setTeamAPlayerUuids(request.getTeamAPlayerUuids());
        match.setTeamBPlayerUuids(request.getTeamBPlayerUuids());
        match.setTeamAScore(request.getTeamAScore());
        match.setTeamBScore(request.getTeamBScore());
        match.setScoresJson(request.getScoresJson());
        match.setWinnerTeam(request.getWinnerTeam());
        match.setMatchDate(request.getMatchDate());
        match.setRecordedByUserUuid(userUuid);
        match.setRecordedByUserName(userName);
        match.setStatus("COMPLETED");

        CommunityMatch saved = communityMatchRepository.save(match);

        communityDetailsRepository.findByOrganizationUuid(communityUuid).ifPresent(d -> {
            d.setMatchesCount(d.getMatchesCount() + 1);
            communityDetailsRepository.save(d);
        });

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CommunityMatch> getMatches(UUID communityUuid) {
        return communityMatchRepository.findByCommunityUuidOrderByMatchDateDescCreatedAtDesc(communityUuid);
    }

    @Transactional
    public CommunityExpense createExpense(UUID communityUuid, CreateExpenseRequest request, UUID userUuid,
            String userName) {
        validateAdminOrOwner(communityUuid, userUuid);

        CommunityExpense expense = new CommunityExpense();
        expense.setCommunityUuid(communityUuid);
        expense.setTitle(request.getTitle());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaidByUserName(request.getPaidByUserName() != null ? request.getPaidByUserName() : userName);
        expense.setPaidByUserUuid(userUuid);
        expense.setNotes(request.getNotes());
        expense.setReceiptUrl(request.getReceiptUrl());
        return communityExpenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public List<CommunityExpense> getExpenses(UUID communityUuid) {
        return communityExpenseRepository.findByCommunityUuidOrderByExpenseDateDescCreatedAtDesc(communityUuid);
    }

    // --- Helper Methods ---

    private void validateMember(UUID communityUuid, UUID userUuid) {
        if (userUuid == null || !communityMemberRepository.existsByCommunityUuidAndUserUuidAndStatus(communityUuid,
                userUuid, CommunityMemberStatus.ACTIVE)) {
            throw new BadRequestException("Action permitted only for active community members");
        }
    }

    private void validateAdminOrOwner(UUID communityUuid, UUID userUuid) {
        if (userUuid == null) {
            throw new BadRequestException("Authentication required");
        }
        Optional<CommunityMember> m = communityMemberRepository.findByCommunityUuidAndUserUuid(communityUuid, userUuid);
        if (m.isEmpty() || m.get().getStatus() != CommunityMemberStatus.ACTIVE ||
                (m.get().getRole() != CommunityRole.OWNER && m.get().getRole() != CommunityRole.ADMIN)) {
            throw new BadRequestException("Administrative permissions required for this action");
        }
    }

    private CommunityResponse mapToCommunityResponse(Organization org, CommunityDetails details, CommunityRole userRole,
            String userStatus) {
        CommunityResponse res = new CommunityResponse();
        res.setOrganizationId(org.getOrganizationId());
        res.setOrganizationUuid(org.getOrganizationUuid());
        res.setName(org.getName());
        res.setDescription(org.getDescription() != null ? org.getDescription() : details.getDescription());
        res.setPrimarySport(details.getPrimarySport());
        res.setAdditionalSports(details.getAdditionalSports());
        res.setVisibility(details.getVisibility());
        res.setPlanType(details.getPlanType());
        res.setRules(details.getRules());
        res.setLocation(details.getLocation());
        res.setCity(details.getCity());
        res.setState(details.getState());
        res.setCountry(details.getCountry());
        res.setLogoUrl(details.getLogoUrl());
        res.setCoverImageUrl(details.getCoverImageUrl());
        res.setMemberCount(details.getMemberCount());
        res.setSessionsCount(details.getSessionsCount());
        res.setMatchesCount(details.getMatchesCount());
        res.setTournamentsCount(details.getTournamentsCount());
        res.setCurrentUserRole(userRole);
        res.setCurrentUserStatus(userStatus);
        res.setCreatedAt(details.getCreatedAt());
        return res;
    }

    private CommunityMemberDto mapToMemberDto(CommunityMember m) {
        CommunityMemberDto dto = new CommunityMemberDto();
        dto.setCommunityMemberId(m.getCommunityMemberId());
        dto.setCommunityMemberUuid(m.getCommunityMemberUuid());
        dto.setCommunityUuid(m.getCommunityUuid());
        dto.setUserId(m.getUserId());
        dto.setUserUuid(m.getUserUuid());
        dto.setUserName(m.getUserName());
        dto.setUserAvatar(m.getUserAvatar());
        dto.setRole(m.getRole());
        dto.setStatus(m.getStatus());
        dto.setSessionsJoined(m.getSessionsJoined());
        dto.setMatchesPlayed(m.getMatchesPlayed());
        dto.setAttendancePercentage(m.getAttendancePercentage());
        dto.setRequestMessage(m.getRequestMessage());
        dto.setJoinedAt(m.getJoinedAt());
        return dto;
    }

    private SessionResponse mapToSessionResponse(CommunitySession s, UUID currentUserUuid) {
        SessionResponse res = new SessionResponse();
        res.setSessionId(s.getSessionId());
        res.setSessionUuid(s.getSessionUuid());
        res.setCommunityUuid(s.getCommunityUuid());
        res.setCreatorUserUuid(s.getCreatorUserUuid());
        res.setCreatorUserName(s.getCreatorUserName());
        res.setSport(s.getSport());
        res.setTitle(s.getTitle());
        res.setDescription(s.getDescription());
        res.setSessionDate(s.getSessionDate());
        res.setStartTime(s.getStartTime());
        res.setEndTime(s.getEndTime());
        res.setVenueId(s.getVenueId());
        res.setVenueUuid(s.getVenueUuid());
        res.setVenueName(s.getVenueName());
        res.setCourtName(s.getCourtName());
        res.setCity(s.getCity());
        res.setState(s.getState());
        res.setGoogleMapUrl(s.getGoogleMapUrl());
        res.setLocationAddress(s.getLocationAddress());
        res.setGenderCategory(s.getGenderCategory());
        res.setMaxMalePlayers(s.getMaxMalePlayers());
        res.setMaxFemalePlayers(s.getMaxFemalePlayers());
        res.setMaxPlayers(s.getMaxPlayers());
        res.setConfirmedPlayersCount(s.getConfirmedPlayersCount());
        res.setSkillLevel(s.getSkillLevel());
        res.setCostPerPlayer(s.getCostPerPlayer());
        res.setIsRecurring(s.getIsRecurring());
        res.setRecurrenceRule(s.getRecurrenceRule());
        res.setStatus(s.getStatus());
        res.setCreatedAt(s.getCreatedAt());

        List<CommunitySessionRsvp> rsvps = communitySessionRsvpRepository.findBySessionUuid(s.getSessionUuid());
        res.setRsvps(rsvps.stream().map(r -> new SessionResponse.SessionRsvpDto(
                r.getUserUuid(),
                r.getUserId(),
                r.getUserName(),
                r.getUserAvatar(),
                r.getRsvpStatus(),
                r.getGuestCount(),
                r.getNotes())).collect(Collectors.toList()));

        if (currentUserUuid != null) {
            rsvps.stream()
                    .filter(r -> r.getUserUuid().equals(currentUserUuid))
                    .findFirst()
                    .ifPresent(r -> res.setCurrentUserRsvp(r.getRsvpStatus()));
        }

        return res;
    }
}
