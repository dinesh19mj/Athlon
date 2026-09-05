package com.athlon.identityservice.organization.service;

import com.athlon.identityservice.organization.dto.request.AddMemberRequest;
import com.athlon.identityservice.organization.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.organization.dto.request.SaveOrganizationProfileRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.organization.dto.response.OrganizationMemberResponse;
import com.athlon.identityservice.organization.dto.response.OrganizationProfileResponse;
import com.athlon.identityservice.organization.dto.response.OrganizationResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationMember;
import com.athlon.identityservice.organization.entity.OrganizationProfile;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.repository.OrganizationMemberRepository;
import com.athlon.identityservice.organization.repository.OrganizationProfileRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.subscription.service.SubscriptionService;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;
import com.athlon.identityservice.util.FileStorageUtil;
import com.athlon.identityservice.dto.request.SubscribeOrganizationRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationProfileRepository organizationProfileRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubscriptionService subscriptionService;
    private final FileStorageUtil fileStorageUtil;

    @Value("${athlon.org.upload.directory}")
    private String uploadBaseDir;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            OrganizationProfileRepository organizationProfileRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            SubscriptionService subscriptionService,
            FileStorageUtil fileStorageUtil) {
        this.organizationRepository = organizationRepository;
        this.organizationProfileRepository = organizationProfileRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.subscriptionService = subscriptionService;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Transactional
    public OrganizationResponse createOrganization(CreateOrganizationRequest request, Long userId, UUID userUuid) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        Organization organization = new Organization(
            request.getName(), 
            request.getDescription(), 
            request.getType(), 
            userId,
            userUuid, 
            userId
        );
        organization = organizationRepository.save(organization);

        // Auto create empty profile record for convenience
        OrganizationProfile profile = new OrganizationProfile(organization.getOrganizationId(), organization.getOrganizationUuid(), userId);
        boolean isPub = "ACADEMY".equalsIgnoreCase(organization.getType()) || "COURT".equalsIgnoreCase(organization.getType());
        profile.setIsPublic(isPub ? 1 : 0);
        organizationProfileRepository.save(profile);

        if (request.getSubscriptionPackageUuid() != null) {
            SubscribeOrganizationRequest subRequest = new SubscribeOrganizationRequest();
            subRequest.setOrganizationUuid(organization.getOrganizationUuid());
            subRequest.setPackageUuid(request.getSubscriptionPackageUuid());
            subRequest.setPaymentReference("AUTO-ACTIVATED");
            subscriptionService.subscribeOrganization(subRequest);
        }

        return mapToResponse(organization);
    }

    @Transactional
    public OrganizationResponse updateOrganization(UpdateOrganizationRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getUuid()));

        if (!organization.getName().equals(request.getName()) && organizationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Organization already exists with name: " + request.getName());
        }

        organization.setName(request.getName());
        organization.setDescription(request.getDescription());
        if (request.getType() != null) {
            organization.setType(request.getType());
        }

        organization.setUpdatedBy(currentUserId);
        organization = organizationRepository.save(organization);

        return mapToResponse(organization);
    }

    @Transactional
    public OrganizationProfileResponse saveOrganizationProfile(SaveOrganizationProfileRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        OrganizationProfile profile = organizationProfileRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseGet(() -> new OrganizationProfile(organization.getOrganizationId(), organization.getOrganizationUuid(), currentUserId));

        profile.setContactEmail(request.getContactEmail());
        profile.setContactPhone(request.getContactPhone());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setDistrict(request.getDistrict());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());
        profile.setPostalCode(request.getPostalCode());
        profile.setWebsite(request.getWebsite());
        if (request.getLogo() != null && !request.getLogo().startsWith("blob:")) {
            profile.setLogo(request.getLogo());
        }
        if (request.getBanner() != null && !request.getBanner().startsWith("blob:")) {
            profile.setBanner(request.getBanner());
        }
        profile.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : (profile.getIsPublic() != null ? profile.getIsPublic() : 1));
        profile.setSportsOffered(request.getSportsOffered());
        profile.setAdmissionStatus(request.getAdmissionStatus());
        profile.setAcademyLevels(request.getAcademyLevels());
        profile.setTotalCourts(request.getTotalCourts());
        profile.setSurfaceType(request.getSurfaceType());
        profile.setOpeningTime(request.getOpeningTime());
        profile.setClosingTime(request.getClosingTime());
        profile.setPricePerHour(request.getPricePerHour());
        profile.setAmenities(request.getAmenities());
        profile.setBio(request.getBio());
        profile.setEstablishedYear(request.getEstablishedYear());
        profile.setRegistrationNumber(request.getRegistrationNumber());
        profile.setMonthlyFeeMin(request.getMonthlyFeeMin());
        profile.setMonthlyFeeMax(request.getMonthlyFeeMax());
        profile.setOperatingDays(request.getOperatingDays());
        profile.setSocialInstagram(request.getSocialInstagram());
        profile.setSocialFacebook(request.getSocialFacebook());
        profile.setSocialYoutube(request.getSocialYoutube());
        if (request.getRating() != null) profile.setRating(request.getRating());
        if (request.getReviewsCount() != null) profile.setReviewsCount(request.getReviewsCount());
        profile.setUpdatedBy(currentUserId);

        profile = organizationProfileRepository.save(profile);

        boolean orgModified = false;
        if (request.getName() != null && !request.getName().trim().isEmpty() && !request.getName().equals(organization.getName())) {
            organization.setName(request.getName().trim());
            orgModified = true;
        }
        if (request.getType() != null && !request.getType().trim().isEmpty() && !request.getType().equalsIgnoreCase(organization.getType())) {
            organization.setType(request.getType().trim().toUpperCase());
            orgModified = true;
        }
        if (request.getDescription() != null && !request.getDescription().equals(organization.getDescription())) {
            organization.setDescription(request.getDescription());
            orgModified = true;
        }
        if (orgModified) {
            organization.setUpdatedBy(currentUserId);
            organizationRepository.save(organization);
        }

        return mapToProfileResponse(organization, profile);
    }

    @Transactional
    public OrganizationProfileResponse saveOrganizationProfileWithMultipart(
            SaveOrganizationProfileRequest request,
            MultipartFile logoFile,
            MultipartFile bannerFile,
            Long currentUserId) throws IOException {

        Organization organization = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + request.getOrganizationUuid()));

        OrganizationProfile profile = organizationProfileRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseGet(() -> new OrganizationProfile(organization.getOrganizationId(), organization.getOrganizationUuid(), currentUserId));

        if (logoFile != null && !logoFile.isEmpty()) {
            String subDir = "organizations" + java.io.File.separator + "logos";
            String savedLogo = fileStorageUtil.saveFile(logoFile, uploadBaseDir, subDir);
            profile.setLogo(savedLogo);
        } else if (request.getLogo() != null && !request.getLogo().startsWith("blob:")) {
            profile.setLogo(request.getLogo());
        }

        if (bannerFile != null && !bannerFile.isEmpty()) {
            String subDir = "organizations" + java.io.File.separator + "banners";
            String savedBanner = fileStorageUtil.saveFile(bannerFile, uploadBaseDir, subDir);
            profile.setBanner(savedBanner);
        } else if (request.getBanner() != null && !request.getBanner().startsWith("blob:")) {
            profile.setBanner(request.getBanner());
        }

        profile.setContactEmail(request.getContactEmail());
        profile.setContactPhone(request.getContactPhone());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setDistrict(request.getDistrict());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());
        profile.setPostalCode(request.getPostalCode());
        profile.setWebsite(request.getWebsite());
        profile.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : (profile.getIsPublic() != null ? profile.getIsPublic() : 1));
        profile.setSportsOffered(request.getSportsOffered());
        profile.setAdmissionStatus(request.getAdmissionStatus());
        profile.setAcademyLevels(request.getAcademyLevels());
        profile.setTotalCourts(request.getTotalCourts());
        profile.setSurfaceType(request.getSurfaceType());
        profile.setOpeningTime(request.getOpeningTime());
        profile.setClosingTime(request.getClosingTime());
        profile.setPricePerHour(request.getPricePerHour());
        profile.setAmenities(request.getAmenities());
        profile.setBio(request.getBio());
        profile.setEstablishedYear(request.getEstablishedYear());
        profile.setRegistrationNumber(request.getRegistrationNumber());
        profile.setMonthlyFeeMin(request.getMonthlyFeeMin());
        profile.setMonthlyFeeMax(request.getMonthlyFeeMax());
        profile.setOperatingDays(request.getOperatingDays());
        profile.setSocialInstagram(request.getSocialInstagram());
        profile.setSocialFacebook(request.getSocialFacebook());
        profile.setSocialYoutube(request.getSocialYoutube());
        if (request.getRating() != null) profile.setRating(request.getRating());
        if (request.getReviewsCount() != null) profile.setReviewsCount(request.getReviewsCount());
        profile.setUpdatedBy(currentUserId);

        profile = organizationProfileRepository.save(profile);

        boolean orgModified = false;
        if (request.getName() != null && !request.getName().trim().isEmpty() && !request.getName().equals(organization.getName())) {
            organization.setName(request.getName().trim());
            orgModified = true;
        }
        if (request.getType() != null && !request.getType().trim().isEmpty() && !request.getType().equalsIgnoreCase(organization.getType())) {
            organization.setType(request.getType().trim().toUpperCase());
            orgModified = true;
        }
        if (request.getDescription() != null && !request.getDescription().equals(organization.getDescription())) {
            organization.setDescription(request.getDescription());
            orgModified = true;
        }
        if (orgModified) {
            organization.setUpdatedBy(currentUserId);
            organizationRepository.save(organization);
        }

        return mapToProfileResponse(organization, profile);
    }

    @Transactional(readOnly = true)
    public OrganizationProfileResponse getProfileByOrganizationUuid(UUID orgUuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(orgUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + orgUuid));

        Optional<OrganizationProfile> profileOpt = organizationProfileRepository.findByOrganizationUuid(orgUuid);
        if (profileOpt.isPresent()) {
            return mapToProfileResponse(organization, profileOpt.get());
        }

        OrganizationProfileResponse resp = new OrganizationProfileResponse();
        resp.setOrganizationId(organization.getOrganizationId());
        resp.setOrganizationUuid(organization.getOrganizationUuid());
        resp.setName(organization.getName());
        resp.setType(organization.getType());
        resp.setDescription(organization.getDescription());
        boolean isPub = "ACADEMY".equalsIgnoreCase(organization.getType()) || "COURT".equalsIgnoreCase(organization.getType());
        resp.setIsPublic(isPub ? 1 : 0);
        return resp;
    }

    @Transactional
    public void deleteOrganization(UUID uuid, Long userId) {
        Organization organization = organizationRepository.findByOrganizationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + uuid));
        
        organization.setActive(false);
        organization.setUpdatedBy(userId);
        organizationRepository.save(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationByUuid(UUID uuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + uuid));
                
        return mapToResponse(organization);
    }
    
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getOrganizationsByUserUuid(UUID userUuid) {
        java.util.Map<UUID, OrganizationResponse> result = new java.util.LinkedHashMap<>();

        // 1. Organizations created/owned by the user (Admin role)
        List<Organization> ownedOrgs = organizationRepository.findByUserUuid(userUuid);
        for (Organization o : ownedOrgs) {
            OrganizationResponse resp = mapToResponse(o);
            resp.setRole("ADMIN");
            result.put(o.getOrganizationUuid(), resp);
        }

        // 2. Organizations where user is an active member
        List<OrganizationMember> memberships = organizationMemberRepository.findByUserUuid(userUuid);
        for (OrganizationMember m : memberships) {
            if (m.getIsActive() != null && m.getIsActive() == 1 && m.getOrganizationUuid() != null) {
                if (!result.containsKey(m.getOrganizationUuid())) {
                    organizationRepository.findByOrganizationUuid(m.getOrganizationUuid()).ifPresent(org -> {
                        OrganizationResponse resp = mapToResponse(org);
                        resp.setRole(m.getRole() != null ? m.getRole().toUpperCase() : "MEMBER");
                        result.put(org.getOrganizationUuid(), resp);
                    });
                }
            }
        }

        return new java.util.ArrayList<>(result.values());
    }

    @Transactional(readOnly = true)
    public String getUserRoleInOrganization(UUID organizationUuid, UUID userUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(organizationUuid).orElse(null);
        if (org == null) return "MEMBER";

        // If creator
        if (org.getUserUuid() != null && org.getUserUuid().equals(userUuid)) {
            return "ADMIN";
        }

        // Check organization_members table
        Optional<OrganizationMember> memberOpt = organizationMemberRepository.findByOrganizationUuidAndUserUuid(organizationUuid, userUuid);
        if (memberOpt.isPresent() && memberOpt.get().getIsActive() != null && memberOpt.get().getIsActive() == 1) {
            return memberOpt.get().getRole() != null ? memberOpt.get().getRole().toUpperCase() : "MEMBER";
        }

        return "MEMBER";
    }

    // -------------------------------------------------------------
    // CLUB / ORGANIZATION MEMBERS MANAGEMENT
    // -------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<OrganizationMemberResponse> getOrganizationMembers(UUID organizationUuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        List<OrganizationMember> members = organizationMemberRepository.findByOrganizationId(organization.getOrganizationId());

        return members.stream()
                .filter(m -> m.getIsActive() != null && m.getIsActive() == 1)
                .map(m -> {
                    OrganizationMemberResponse resp = new OrganizationMemberResponse();
                    resp.setOrganizationMemberUuid(m.getOrganizationMemberUuid());
                    resp.setOrganizationMemberId(m.getOrganizationMemberId());
                    resp.setOrganizationUuid(organization.getOrganizationUuid());
                    resp.setOrganizationId(organization.getOrganizationId());
                    resp.setUserUuid(m.getUserUuid());
                    resp.setUserId(m.getUserId());
                    resp.setRole(m.getRole());
                    resp.setSportType(m.getSportType());
                    resp.setIsActive(m.getIsActive());
                    resp.setStatus(m.getIsActive() == 1 ? "Active" : "Inactive");
                    resp.setJoinedAt(m.getCreatedAt());

                    userRepository.findById(m.getUserId()).ifPresent(user -> {
                        resp.setEmail(user.getEmail());
                    });

                    userProfileRepository.findByUserId(m.getUserId()).ifPresent(p -> {
                        String fullName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                        resp.setFullName(fullName.isEmpty() ? "Athlon Athlete" : fullName);
                        resp.setPhone(p.getPhone());
                        resp.setPhoto(p.getPhoto());
                    });

                    return resp;
                }).collect(Collectors.toList());
    }

    @Transactional
    public OrganizationMemberResponse addMemberByPhone(UUID organizationUuid, AddMemberRequest request, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String cleanPhone = request.getPhone().replaceAll("[^0-9]", "");
        UserProfile userProfile = userProfileRepository.findFirstByPhone(cleanPhone)
                .or(() -> userProfileRepository.findFirstByPhone(request.getPhone().trim()))
                .orElseThrow(() -> new ResourceNotFoundException("No active Athlon user found with phone: " + request.getPhone() + ". Please create a user account first."));

        User user = userRepository.findById(userProfile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found for phone: " + request.getPhone()));

        if (!user.isActive()) {
            throw new ResourceNotFoundException("User account is currently inactive with phone: " + request.getPhone());
        }

        Optional<OrganizationMember> existingMemberOpt = organizationMemberRepository
                .findByOrganizationIdAndUserId(organization.getOrganizationId(), user.getUserId());

        OrganizationMember member;
        if (existingMemberOpt.isPresent()) {
            member = existingMemberOpt.get();
            if (member.getIsActive() != null && member.getIsActive() == 1) {
                throw new DuplicateResourceException("This user is already an active member of this club/organization.");
            }
            member.setIsActive(1);
            member.setRole(request.getRole() != null ? request.getRole() : "MEMBER");
            if (request.getSportType() != null) member.setSportType(request.getSportType());
            member.setUpdatedBy(currentUserId);
        } else {
            member = new OrganizationMember(
                    organization.getOrganizationId(),
                    organization.getOrganizationUuid(),
                    user.getUserId(),
                    user.getUserUuid(),
                    request.getRole() != null ? request.getRole() : "MEMBER",
                    currentUserId
            );
            if (request.getSportType() != null) member.setSportType(request.getSportType());
        }

        member = organizationMemberRepository.save(member);

        OrganizationMemberResponse resp = new OrganizationMemberResponse();
        resp.setOrganizationMemberUuid(member.getOrganizationMemberUuid());
        resp.setOrganizationMemberId(member.getOrganizationMemberId());
        resp.setOrganizationUuid(organization.getOrganizationUuid());
        resp.setOrganizationId(organization.getOrganizationId());
        resp.setUserUuid(user.getUserUuid());
        resp.setUserId(user.getUserId());
        resp.setEmail(user.getEmail());
        resp.setPhone(userProfile.getPhone());
        resp.setPhoto(userProfile.getPhoto());
        String fullName = ((userProfile.getFirstName() != null ? userProfile.getFirstName() : "") + " " + (userProfile.getLastName() != null ? userProfile.getLastName() : "")).trim();
        resp.setFullName(fullName.isEmpty() ? "Athlon Athlete" : fullName);
        resp.setRole(member.getRole());
        resp.setSportType(member.getSportType());
        resp.setStatus("Active");
        resp.setIsActive(1);
        resp.setJoinedAt(member.getCreatedAt() != null ? member.getCreatedAt() : java.time.LocalDateTime.now());

        return resp;
    }

    @Transactional
    public void removeMember(UUID organizationUuid, UUID memberUuid, Long currentUserId) {
        Organization organization = organizationRepository.findByOrganizationUuid(organizationUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + organizationUuid));

        OrganizationMember member = organizationMemberRepository.findByOrganizationMemberUuid(memberUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with UUID: " + memberUuid));

        if (!member.getOrganizationId().equals(organization.getOrganizationId())) {
            throw new IllegalArgumentException("Member does not belong to this organization");
        }

        member.setIsActive(0);
        member.setUpdatedBy(currentUserId);
        organizationMemberRepository.save(member);
    }

    public String getUploadBaseDir() {
        return uploadBaseDir;
    }

    private OrganizationResponse mapToResponse(Organization organization) {
        OrganizationResponse response = new OrganizationResponse();
        response.setOrgId(organization.getOrganizationId());
        response.setUuid(organization.getOrganizationUuid());
        response.setName(organization.getName());
        response.setDescription(organization.getDescription());
        response.setActive(organization.isActive());
        response.setType(organization.getType());

        organizationProfileRepository.findByOrganizationUuid(organization.getOrganizationUuid())
                .ifPresent(p -> response.setProfile(mapToProfileResponse(organization, p)));

        return response;
    }

    private OrganizationProfileResponse mapToProfileResponse(Organization org, OrganizationProfile p) {
        OrganizationProfileResponse resp = new OrganizationProfileResponse();
        resp.setProfileUuid(p.getOrganizationProfileUuid());
        resp.setOrganizationId(org.getOrganizationId());
        resp.setOrganizationUuid(org.getOrganizationUuid());
        resp.setName(org.getName());
        resp.setType(org.getType());
        resp.setDescription(org.getDescription());
        resp.setContactEmail(p.getContactEmail());
        resp.setContactPhone(p.getContactPhone());
        resp.setAddress(p.getAddress());
        resp.setCity(p.getCity());
        resp.setDistrict(p.getDistrict());
        resp.setState(p.getState());
        resp.setCountry(p.getCountry());
        resp.setPostalCode(p.getPostalCode());
        resp.setWebsite(p.getWebsite());
        resp.setLogo(p.getLogo());
        resp.setBanner(p.getBanner());
        resp.setIsPublic(p.getIsPublic());
        resp.setSportsOffered(p.getSportsOffered());
        resp.setAdmissionStatus(p.getAdmissionStatus());
        resp.setAcademyLevels(p.getAcademyLevels());
        resp.setTotalCourts(p.getTotalCourts());
        resp.setSurfaceType(p.getSurfaceType());
        resp.setOpeningTime(p.getOpeningTime());
        resp.setClosingTime(p.getClosingTime());
        resp.setPricePerHour(p.getPricePerHour());
        resp.setAmenities(p.getAmenities());
        resp.setBio(p.getBio());
        resp.setEstablishedYear(p.getEstablishedYear());
        resp.setRegistrationNumber(p.getRegistrationNumber());
        resp.setMonthlyFeeMin(p.getMonthlyFeeMin());
        resp.setMonthlyFeeMax(p.getMonthlyFeeMax());
        resp.setOperatingDays(p.getOperatingDays());
        resp.setSocialInstagram(p.getSocialInstagram());
        resp.setSocialFacebook(p.getSocialFacebook());
        resp.setSocialYoutube(p.getSocialYoutube());
        resp.setRating(p.getRating() != null ? p.getRating() : 4.9);
        resp.setReviewsCount(p.getReviewsCount() != null ? p.getReviewsCount() : 50);
        resp.setUpdatedAt(p.getUpdatedAt());
        return resp;
    }
}
