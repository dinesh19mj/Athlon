package com.athlon.identityservice.organization.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.util.DocumentUtil;
import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.organization.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.organization.dto.request.SaveOrganizationProfileRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.organization.dto.response.OrganizationProfileResponse;
import com.athlon.identityservice.organization.dto.response.OrganizationResponse;
import com.athlon.identityservice.organization.service.OrganizationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final DocumentUtil documentUtil;
    private final com.athlon.identityservice.user.repository.UserRepository userRepository;

    public OrganizationController(
            OrganizationService organizationService, 
            DocumentUtil documentUtil,
            com.athlon.identityservice.user.repository.UserRepository userRepository) {
        this.organizationService = organizationService;
        this.documentUtil = documentUtil;
        this.userRepository = userRepository;
    }

    private Long parseUserId(String userIdHeader, String userUuidHeader) {
        if (userIdHeader != null && !userIdHeader.trim().isEmpty() && !"undefined".equalsIgnoreCase(userIdHeader) && !"null".equalsIgnoreCase(userIdHeader)) {
            try {
                return Long.parseLong(userIdHeader.trim());
            } catch (Exception ignored) {}
        }
        if (userUuidHeader != null && !userUuidHeader.trim().isEmpty() && !"undefined".equalsIgnoreCase(userUuidHeader) && !"null".equalsIgnoreCase(userUuidHeader)) {
            try {
                UUID uuid = UUID.fromString(userUuidHeader.trim());
                return userRepository.findByUserUuid(uuid)
                        .map(com.athlon.identityservice.user.entity.User::getUserId)
                        .orElse(null);
            } catch (Exception ignored) {}
        }
        throw new BadRequestException("Authentication context missing: Valid user ID or UUID header is required");
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
                return userRepository.findById(uid)
                        .map(com.athlon.identityservice.user.entity.User::getUserUuid)
                        .orElse(null);
            } catch (Exception ignored) {}
        }
        throw new BadRequestException("Authentication context missing: Valid user UUID header is required");
    }

    @PostMapping("/createOrganization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) {
        
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        UUID userUuid = parseUserUuid(userUuidHeader, userIdHeader);
        OrganizationResponse response = organizationService.createOrganization(request, userId, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", response));
    }

    @PostMapping("/updateOrganization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @Valid @RequestBody UpdateOrganizationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) {
        
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        OrganizationResponse response = organizationService.updateOrganization(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", response));
    }

    @PostMapping("/saveProfile")
    public ResponseEntity<ApiResponse<OrganizationProfileResponse>> saveOrganizationProfile(
            @Valid @RequestBody SaveOrganizationProfileRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) {
        
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        OrganizationProfileResponse response = organizationService.saveOrganizationProfile(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization profile saved successfully", response));
    }

    @PostMapping(value = "/saveProfileMultipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrganizationProfileResponse>> saveOrganizationProfileMultipart(
            @ModelAttribute SaveOrganizationProfileRequest request,
            @RequestParam(value = "logoFile", required = false) MultipartFile logoFile,
            @RequestParam(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) throws IOException {
        
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        OrganizationProfileResponse response = organizationService.saveOrganizationProfileWithMultipart(
                request, logoFile, bannerFile, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization profile and media saved successfully", response));
    }

    @GetMapping("/getProfileByOrgUuid/{orgUuid}")
    public ResponseEntity<ApiResponse<OrganizationProfileResponse>> getProfileByOrganizationUuid(@PathVariable("orgUuid") UUID orgUuid) {
        OrganizationProfileResponse response = organizationService.getProfileByOrganizationUuid(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/logo/{fileName}")
    public ResponseEntity<byte[]> getOrganizationLogo(@PathVariable("fileName") String fileName) {
        String filePath = organizationService.getUploadBaseDir() + File.separator + "organizations" + File.separator + "logos" + File.separator + fileName;
        return documentUtil.getFile(filePath);
    }

    @GetMapping("/banner/{fileName}")
    public ResponseEntity<byte[]> getOrganizationBanner(@PathVariable("fileName") String fileName) {
        String filePath = organizationService.getUploadBaseDir() + File.separator + "organizations" + File.separator + "banners" + File.separator + fileName;
        return documentUtil.getFile(filePath);
    }

    @GetMapping("/file")
    public ResponseEntity<byte[]> getFile(@RequestParam("filePath") String filePath) {
        return documentUtil.getFile(filePath);
    }

    @PostMapping("/deleteOrganization/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteOrganization(
            @PathVariable("uuid") UUID uuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) {
        
        Long userId = parseUserId(userIdHeader, userUuidHeader);
        organizationService.deleteOrganization(uuid, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization deleted successfully", null));
    }

    @GetMapping("/getOrganizationByUuid/{uuid}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getOrganizationByUuid(@PathVariable("uuid") UUID uuid) {
        OrganizationResponse response = organizationService.getOrganizationByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/getAllOrganizations")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getAllOrganizations() {
        List<OrganizationResponse> responses = organizationService.getAllOrganizations();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/getByUserUuid/{userUuid}")
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> getOrganizationsByUserUuid(@PathVariable("userUuid") UUID userUuid) {
        List<OrganizationResponse> responses = organizationService.getOrganizationsByUserUuid(userUuid);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{orgUuid}/user-role/{userUuid}")
    public ResponseEntity<ApiResponse<String>> getUserRoleInOrganization(
            @PathVariable("orgUuid") UUID orgUuid,
            @PathVariable("userUuid") UUID userUuid) {
        String role = organizationService.getUserRoleInOrganization(orgUuid, userUuid);
        return ResponseEntity.ok(ApiResponse.success("User role retrieved successfully", role));
    }

    @GetMapping("/{orgUuid}/members")
    public ResponseEntity<ApiResponse<List<com.athlon.identityservice.organization.dto.response.OrganizationMemberResponse>>> getOrganizationMembers(
            @PathVariable("orgUuid") UUID orgUuid) {
        var response = organizationService.getOrganizationMembers(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{orgUuid}/members")
    public ResponseEntity<ApiResponse<com.athlon.identityservice.organization.dto.response.OrganizationMemberResponse>> addMemberByPhone(
            @PathVariable("orgUuid") UUID orgUuid,
            @Valid @RequestBody com.athlon.identityservice.organization.dto.request.AddMemberRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) {
        Long currentUserId = parseUserId(userIdHeader, userUuidHeader);
        var response = organizationService.addMemberByPhone(orgUuid, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Member added to organization successfully", response));
    }

    @PostMapping("/{orgUuid}/members/{memberUuid}/remove")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable("orgUuid") UUID orgUuid,
            @PathVariable("memberUuid") UUID memberUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String userUuidHeader) {
        Long currentUserId = parseUserId(userIdHeader, userUuidHeader);
        organizationService.removeMember(orgUuid, memberUuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from organization successfully", null));
    }
}
