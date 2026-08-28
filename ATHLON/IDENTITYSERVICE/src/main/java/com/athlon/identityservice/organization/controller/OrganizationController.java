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
import com.athlon.identityservice.organization.dto.request.CreateOrganizationRequest;
import com.athlon.identityservice.organization.dto.request.SaveOrganizationProfileRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizationRequest;
import com.athlon.identityservice.organization.dto.response.OrganizationProfileResponse;
import com.athlon.identityservice.organization.dto.response.OrganizationResponse;
import com.athlon.identityservice.organization.service.OrganizationService;
import com.athlon.identityservice.util.DocumentUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final DocumentUtil documentUtil;

    public OrganizationController(OrganizationService organizationService, DocumentUtil documentUtil) {
        this.organizationService = organizationService;
        this.documentUtil = documentUtil;
    }

    @PostMapping("/createOrganization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId,
            @RequestHeader(value = "X-User-Uuid", defaultValue = "00000000-0000-0000-0000-000000000000") UUID userUuid) {
        
        OrganizationResponse response = organizationService.createOrganization(request, userId, userUuid);
        return ResponseEntity.ok(ApiResponse.success("Organization created successfully", response));
    }

    @PostMapping("/updateOrganization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateOrganization(
            @Valid @RequestBody UpdateOrganizationRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
        OrganizationResponse response = organizationService.updateOrganization(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization updated successfully", response));
    }

    @PostMapping("/saveProfile")
    public ResponseEntity<ApiResponse<OrganizationProfileResponse>> saveOrganizationProfile(
            @Valid @RequestBody SaveOrganizationProfileRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
        OrganizationProfileResponse response = organizationService.saveOrganizationProfile(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Organization profile saved successfully", response));
    }

    @PostMapping(value = "/saveProfileMultipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrganizationProfileResponse>> saveOrganizationProfileMultipart(
            @ModelAttribute SaveOrganizationProfileRequest request,
            @RequestParam(value = "logoFile", required = false) MultipartFile logoFile,
            @RequestParam(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) throws IOException {
        
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
            @PathVariable UUID uuid,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        
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
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        var response = organizationService.addMemberByPhone(orgUuid, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Member added to organization successfully", response));
    }

    @PostMapping("/{orgUuid}/members/{memberUuid}/remove")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable("orgUuid") UUID orgUuid,
            @PathVariable("memberUuid") UUID memberUuid,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        organizationService.removeMember(orgUuid, memberUuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from organization successfully", null));
    }
}
