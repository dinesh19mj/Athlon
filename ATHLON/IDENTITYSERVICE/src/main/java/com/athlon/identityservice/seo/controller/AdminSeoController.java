package com.athlon.identityservice.seo.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.seo.dto.*;
import com.athlon.identityservice.seo.service.SeoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/seo")
public class AdminSeoController {

    private final SeoService seoService;

    public AdminSeoController(SeoService seoService) {
        this.seoService = seoService;
    }

    // 1. Dashboard Stats
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SeoDashboardStatsDto>> getDashboardStats() {
        SeoDashboardStatsDto stats = seoService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("SEO dashboard statistics retrieved successfully", stats));
    }

    // 2. Global Settings
    @GetMapping("/global")
    public ResponseEntity<ApiResponse<SeoGlobalSettingsDto>> getGlobalSettings() {
        SeoGlobalSettingsDto settings = seoService.getGlobalSettings();
        return ResponseEntity.ok(ApiResponse.success("Global SEO settings retrieved successfully", settings));
    }

    @PostMapping("/global")
    public ResponseEntity<ApiResponse<SeoGlobalSettingsDto>> saveGlobalSettings(@RequestBody SeoGlobalSettingsDto dto) {
        SeoGlobalSettingsDto saved = seoService.saveGlobalSettings(dto);
        return ResponseEntity.ok(ApiResponse.success("Global SEO settings updated successfully", saved));
    }

    // 3. Static Pages
    @GetMapping("/pages")
    public ResponseEntity<ApiResponse<List<SeoPageDto>>> getAllPages() {
        List<SeoPageDto> pages = seoService.getAllPages();
        return ResponseEntity.ok(ApiResponse.success("Static SEO pages retrieved successfully", pages));
    }

    @GetMapping("/pages/{id}")
    public ResponseEntity<ApiResponse<SeoPageDto>> getPageById(@PathVariable("id") String id) {
        SeoPageDto page = seoService.getPageById(id);
        return ResponseEntity.ok(ApiResponse.success("SEO page retrieved successfully", page));
    }

    @PostMapping("/pages")
    public ResponseEntity<ApiResponse<SeoPageDto>> createPage(@RequestBody SeoPageDto dto) {
        SeoPageDto saved = seoService.savePage(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO page saved successfully", saved));
    }

    @PostMapping("/pages/{id}")
    public ResponseEntity<ApiResponse<SeoPageDto>> updatePage(
            @PathVariable("id") String id,
            @RequestBody SeoPageDto dto) {
        if (dto.getId() == null || dto.getId().isEmpty()) {
            dto.setId(id);
        }
        SeoPageDto saved = seoService.savePage(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO page saved successfully", saved));
    }

    // 4. Dynamic Templates
    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<SeoTemplateDto>>> getAllTemplates() {
        List<SeoTemplateDto> templates = seoService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success("SEO templates retrieved successfully", templates));
    }

    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<SeoTemplateDto>> createTemplate(@RequestBody SeoTemplateDto dto) {
        SeoTemplateDto saved = seoService.saveTemplate(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO template saved successfully", saved));
    }

    @PostMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<SeoTemplateDto>> updateTemplate(
            @PathVariable("id") String id,
            @RequestBody SeoTemplateDto dto) {
        if (dto.getId() == null || dto.getId().isEmpty()) {
            dto.setId(id);
        }
        SeoTemplateDto saved = seoService.saveTemplate(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO template saved successfully", saved));
    }

    // 5. Specific Entity Overrides
    @GetMapping("/overrides")
    public ResponseEntity<ApiResponse<List<SeoEntityOverrideDto>>> getAllOverrides() {
        List<SeoEntityOverrideDto> overrides = seoService.getAllOverrides();
        return ResponseEntity.ok(ApiResponse.success("SEO entity overrides retrieved successfully", overrides));
    }

    @PostMapping("/overrides")
    public ResponseEntity<ApiResponse<SeoEntityOverrideDto>> createOverride(@RequestBody SeoEntityOverrideDto dto) {
        SeoEntityOverrideDto saved = seoService.saveOverride(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO entity override saved successfully", saved));
    }

    @PostMapping("/overrides/{id}")
    public ResponseEntity<ApiResponse<SeoEntityOverrideDto>> updateOverride(
            @PathVariable("id") String id,
            @RequestBody SeoEntityOverrideDto dto) {
        if (dto.getId() == null || dto.getId().isEmpty()) {
            dto.setId(id);
        }
        SeoEntityOverrideDto saved = seoService.saveOverride(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO entity override saved successfully", saved));
    }

    @DeleteMapping("/overrides/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOverride(@PathVariable("id") String id) {
        seoService.deleteOverride(id);
        return ResponseEntity.ok(ApiResponse.success("SEO entity override deleted successfully", null));
    }

    // 6. Redirects
    @GetMapping("/redirects")
    public ResponseEntity<ApiResponse<List<SeoRedirectDto>>> getAllRedirects() {
        List<SeoRedirectDto> redirects = seoService.getAllRedirects();
        return ResponseEntity.ok(ApiResponse.success("SEO redirect rules retrieved successfully", redirects));
    }

    @PostMapping("/redirects")
    public ResponseEntity<ApiResponse<SeoRedirectDto>> createRedirect(@RequestBody SeoRedirectDto dto) {
        SeoRedirectDto saved = seoService.saveRedirect(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO redirect rule saved successfully", saved));
    }

    @PostMapping("/redirects/{id}")
    public ResponseEntity<ApiResponse<SeoRedirectDto>> updateRedirect(
            @PathVariable("id") String id,
            @RequestBody SeoRedirectDto dto) {
        if (dto.getId() == null || dto.getId().isEmpty()) {
            dto.setId(id);
        }
        SeoRedirectDto saved = seoService.saveRedirect(dto);
        return ResponseEntity.ok(ApiResponse.success("SEO redirect rule saved successfully", saved));
    }

    @DeleteMapping("/redirects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRedirect(@PathVariable("id") String id) {
        seoService.deleteRedirect(id);
        return ResponseEntity.ok(ApiResponse.success("SEO redirect rule deleted successfully", null));
    }

    // 7. Sitemaps
    @GetMapping("/sitemaps")
    public ResponseEntity<ApiResponse<List<SeoSitemapDto>>> getSitemaps() {
        List<SeoSitemapDto> sitemaps = seoService.getSitemaps();
        return ResponseEntity.ok(ApiResponse.success("SEO sitemaps retrieved successfully", sitemaps));
    }

    // 8. Health Audit Issues
    @GetMapping("/audit")
    public ResponseEntity<ApiResponse<List<SeoAuditIssueDto>>> getAuditIssues() {
        List<SeoAuditIssueDto> issues = seoService.getAuditIssues();
        return ResponseEntity.ok(ApiResponse.success("SEO audit issues retrieved successfully", issues));
    }

    @PostMapping("/audit/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateAuditIssueStatus(
            @PathVariable("id") String id,
            @RequestParam("status") String status) {
        seoService.updateAuditIssueStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("SEO audit issue status updated", null));
    }

    // 9. Change History
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<SeoChangeHistoryDto>>> getHistory() {
        List<SeoChangeHistoryDto> history = seoService.getHistory();
        return ResponseEntity.ok(ApiResponse.success("SEO change history retrieved successfully", history));
    }
}
