package com.athlon.identityservice.seo.service;

import com.athlon.identityservice.seo.dto.*;
import java.util.List;
import java.util.Map;

public interface SeoService {

    SeoDashboardStatsDto getDashboardStats();

    SeoGlobalSettingsDto getGlobalSettings();
    SeoGlobalSettingsDto saveGlobalSettings(SeoGlobalSettingsDto dto);

    List<SeoPageDto> getAllPages();
    SeoPageDto getPageById(String id);
    SeoPageDto getPageByRoute(String routePattern);
    SeoPageDto savePage(SeoPageDto dto);

    List<SeoTemplateDto> getAllTemplates();
    SeoTemplateDto getTemplateByEntityType(String entityType);
    SeoTemplateDto saveTemplate(SeoTemplateDto dto);

    List<SeoEntityOverrideDto> getAllOverrides();
    SeoEntityOverrideDto saveOverride(SeoEntityOverrideDto dto);
    void deleteOverride(String id);

    List<SeoRedirectDto> getAllRedirects();
    List<SeoRedirectDto> getActiveRedirects();
    SeoRedirectDto saveRedirect(SeoRedirectDto dto);
    void deleteRedirect(String id);
    void trackRedirectHit(String sourcePath);

    List<SeoSitemapDto> getSitemaps();

    List<SeoAuditIssueDto> getAuditIssues();
    void updateAuditIssueStatus(String id, String status);

    List<SeoChangeHistoryDto> getHistory();
    void recordHistory(String entityType, String entityId, String entityName, String action, String summary);

    ResolvedMetadataResponse resolveEntityMetadata(String entityType, String entityId, Map<String, String> entityData);
}
