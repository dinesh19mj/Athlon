package com.athlon.identityservice.seo.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.seo.dto.*;
import com.athlon.identityservice.seo.service.SeoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/identity/seo")
public class PublicSeoController {

    private final SeoService seoService;

    public PublicSeoController(SeoService seoService) {
        this.seoService = seoService;
    }

    // 1. Global SEO info for Next.js Root Layout
    @GetMapping("/global")
    public ResponseEntity<ApiResponse<SeoGlobalSettingsDto>> getPublicGlobalSettings() {
        SeoGlobalSettingsDto settings = seoService.getGlobalSettings();
        return ResponseEntity.ok(ApiResponse.success("Global SEO settings retrieved", settings));
    }

    // 2. Page Metadata for Next.js Static Pages
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<SeoPageDto>> getPageMetadata(@RequestParam("route") String route) {
        SeoPageDto page = seoService.getPageByRoute(route);
        if (page == null) {
            return ResponseEntity.ok(ApiResponse.success("No custom page metadata found, fallback to defaults", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Page SEO metadata retrieved", page));
    }

    // 3. Resolve Dynamic Metadata (Tournaments, Venues, Academies, Coaches)
    @PostMapping("/resolve")
    public ResponseEntity<ApiResponse<ResolvedMetadataResponse>> resolveMetadata(
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") String entityId,
            @RequestBody(required = false) Map<String, String> entityData) {
        ResolvedMetadataResponse response = seoService.resolveEntityMetadata(entityType, entityId, entityData);
        return ResponseEntity.ok(ApiResponse.success("Resolved entity metadata successfully", response));
    }

    // 4. Active 301/302 Redirect Rules for Next.js Middleware
    @GetMapping("/redirects")
    public ResponseEntity<ApiResponse<List<SeoRedirectDto>>> getActiveRedirects() {
        List<SeoRedirectDto> redirects = seoService.getActiveRedirects();
        return ResponseEntity.ok(ApiResponse.success("Active redirect rules retrieved", redirects));
    }

    // 5. Track hit for redirect
    @PostMapping("/redirects/hit")
    public ResponseEntity<ApiResponse<Void>> trackRedirectHit(@RequestParam("sourcePath") String sourcePath) {
        seoService.trackRedirectHit(sourcePath);
        return ResponseEntity.ok(ApiResponse.success("Redirect hit tracked", null));
    }

    // 6. Sitemaps metadata
    @GetMapping("/sitemaps")
    public ResponseEntity<ApiResponse<List<SeoSitemapDto>>> getSitemaps() {
        List<SeoSitemapDto> sitemaps = seoService.getSitemaps();
        return ResponseEntity.ok(ApiResponse.success("Sitemaps retrieved", sitemaps));
    }
}
