package com.athlon.identityservice.organization.service;

import com.athlon.identityservice.organization.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.organization.dto.request.SaveOrganizationProfileRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.organization.dto.response.OrganizationProfileResponse;
import com.athlon.identityservice.organization.dto.response.OrganizationResponse;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.entity.OrganizationProfile;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.repository.OrganizationProfileRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.subscription.service.SubscriptionService;
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
    private final SubscriptionService subscriptionService;
    private final FileStorageUtil fileStorageUtil;

    @Value("${athlon.org.upload.directory}")
    private String uploadBaseDir;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            OrganizationProfileRepository organizationProfileRepository,
            SubscriptionService subscriptionService,
            FileStorageUtil fileStorageUtil) {
        this.organizationRepository = organizationRepository;
        this.organizationProfileRepository = organizationProfileRepository;
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

        // Update core organization entity if basic fields are provided
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            if (!organization.getName().equals(request.getName().trim()) && organizationRepository.existsByName(request.getName().trim())) {
                throw new DuplicateResourceException("Organization name already in use: " + request.getName());
            }
            organization.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            organization.setDescription(request.getDescription().trim());
        }
        if (request.getType() != null && !request.getType().trim().isEmpty()) {
            organization.setType(request.getType().trim());
        }
        organization.setUpdatedBy(currentUserId);
        organizationRepository.save(organization);

        // Find or create profile
        OrganizationProfile profile = organizationProfileRepository.findByOrganizationUuid(organization.getOrganizationUuid())
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
        if (request.getLogo() != null) {
            profile.setLogo(request.getLogo());
        }
        if (request.getBanner() != null) {
            profile.setBanner(request.getBanner());
        }

        // Determine public visibility based on type if not explicitly set
        boolean isPublicType = "ACADEMY".equalsIgnoreCase(organization.getType()) || "COURT".equalsIgnoreCase(organization.getType());
        profile.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : (isPublicType ? 1 : 0));

        profile.setSportsOffered(request.getSportsOffered());
        profile.setAdmissionStatus(request.getAdmissionStatus());
        profile.setAcademyLevels(request.getAcademyLevels());
        profile.setTotalCourts(request.getTotalCourts());
        profile.setSurfaceType(request.getSurfaceType());
        profile.setOpeningTime(request.getOpeningTime());
        profile.setClosingTime(request.getClosingTime());
        profile.setPricePerHour(request.getPricePerHour());
        profile.setAmenities(request.getAmenities());
        profile.setUpdatedBy(currentUserId);

        profile = organizationProfileRepository.save(profile);

        return mapToProfileResponse(organization, profile);
    }

    @Transactional
    public OrganizationProfileResponse saveOrganizationProfileWithMultipart(
            SaveOrganizationProfileRequest request,
            MultipartFile logoFile,
            MultipartFile bannerFile,
            Long currentUserId) throws IOException {

        if (logoFile != null && !logoFile.isEmpty()) {
            String savedLogo = fileStorageUtil.saveFile(logoFile, uploadBaseDir, "organizations/logos");
            request.setLogo(savedLogo);
        }

        if (bannerFile != null && !bannerFile.isEmpty()) {
            String savedBanner = fileStorageUtil.saveFile(bannerFile, uploadBaseDir, "organizations/banners");
            request.setBanner(savedBanner);
        }

        return saveOrganizationProfile(request, currentUserId);
    }

    @Transactional(readOnly = true)
    public OrganizationProfileResponse getProfileByOrganizationUuid(UUID orgUuid) {
        Organization organization = organizationRepository.findByOrganizationUuid(orgUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with UUID: " + orgUuid));

        Optional<OrganizationProfile> profileOpt = organizationProfileRepository.findByOrganizationUuid(orgUuid);
        if (profileOpt.isPresent()) {
            return mapToProfileResponse(organization, profileOpt.get());
        }

        // Return baseline profile response from organization entity
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
        return organizationRepository.findByUserUuid(userUuid).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
        resp.setUpdatedAt(p.getUpdatedAt());
        return resp;
    }
}
