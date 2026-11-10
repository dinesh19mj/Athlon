package com.athlon.identityservice.admin.service;

import com.athlon.identityservice.admin.dto.CreateOrganizationModuleRequest;
import com.athlon.identityservice.admin.dto.OrganizationModuleConfigDto;
import com.athlon.identityservice.admin.dto.UpdateOrganizationModuleConfigRequest;
import com.athlon.identityservice.admin.entity.OrganizationModuleConfig;
import com.athlon.identityservice.admin.repository.OrganizationModuleConfigRepository;
import com.athlon.identityservice.exception.BadRequestException;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrganizationModuleService {

    private static final Logger log = LoggerFactory.getLogger(OrganizationModuleService.class);

    private final OrganizationModuleConfigRepository moduleRepository;

    public OrganizationModuleService(OrganizationModuleConfigRepository moduleRepository) {
        this.moduleRepository = moduleRepository;
    }

    @PostConstruct
    @Transactional
    public void seedInitialModulesIfEmpty() {
        if (moduleRepository.count() == 0) {
            log.info("[OrganizationModuleService] Seeding default organization modules...");
            seedModule("COURT", "Venues & Courts", "Turf & Facility Management", "Court bookings, slot grids, dynamic pricing, customer CRM & memberships.", "Landmark", "/venue", 1, "LIVE", "emerald");
            seedModule("ORGANIZER", "Tournament Organizer", "Competition & Draw Engine", "Tournament registration, fixtures, live brackets, and umpire scoring.", "Trophy", "/organizer", 2, "POPULAR", "emerald");
            seedModule("ACADEMY", "Sports Academy", "Training Centres & Batches", "Student roster, coach allocation, daily attendance, and digital fee collection.", "GraduationCap", "/academy", 3, "VERIFIED", "emerald");
            seedModule("CLUB", "Sports Club", "Club Batches & Member Ops", "Court batch operations, member check-ins, kitty expenses, and club ladders.", "Users", "/club", 4, "30D FREE TRIAL", "blue");
            seedModule("COACH", "Personal Coaches", "Solo Trainers & Schedules", "Coaching calendar, trainee roster, rate cards, and slot bookings.", "UserCheck", "/coach", 5, "30D FREE TRIAL", "blue");
            seedModule("COMMUNITY", "Recreational Community", "Pickup Games & Social Sports", "Open pickup sessions, player RSVP, group leaderboards, and shared kitty.", "Compass", "/community", 6, "FREE", "emerald");
            log.info("[OrganizationModuleService] Successfully seeded default organization modules.");
        }
    }

    private void seedModule(String key, String name, String category, String desc, String icon, String route, int order, String badge, String variant) {
        OrganizationModuleConfig m = new OrganizationModuleConfig(key, name, category, desc);
        m.setIconName(icon);
        m.setRoutePrefix(route);
        m.setDisplayOrder(order);
        m.setStatus("ACTIVE");
        m.setIsEnabled(true);
        m.setIsSystemCore(true);
        m.setAllowWorkspaceCreation(true);
        m.setShowInPricing(true);
        m.setShowInDiscovery(true);
        m.setBadgeText(badge);
        m.setBadgeVariant(variant);
        moduleRepository.save(m);
    }

    @Transactional(readOnly = true)
    public List<OrganizationModuleConfigDto> getAllModulesForAdmin() {
        return moduleRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrganizationModuleConfigDto> getPublicModules() {
        return moduleRepository.findByIsEnabledTrueOrderByDisplayOrderAsc().stream()
                .filter(m -> !"DISABLED".equalsIgnoreCase(m.getStatus()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizationModuleConfigDto getModuleByKey(String moduleKey) {
        OrganizationModuleConfig config = moduleRepository.findByModuleKeyIgnoreCase(moduleKey)
                .orElseThrow(() -> new ResourceNotFoundException("Organization module not found with key: " + moduleKey));
        return mapToDto(config);
    }

    @Transactional
    public OrganizationModuleConfigDto createModule(CreateOrganizationModuleRequest request, Long adminUserId) {
        String key = request.getModuleKey().trim().toUpperCase();
        if (moduleRepository.existsByModuleKeyIgnoreCase(key)) {
            throw new DuplicateResourceException("Organization module already exists with key: " + key);
        }

        OrganizationModuleConfig config = new OrganizationModuleConfig();
        config.setModuleKey(key);
        config.setDisplayName(request.getDisplayName().trim());
        config.setCategoryLabel(request.getCategoryLabel().trim());
        config.setDescription(request.getDescription());
        config.setIconName(request.getIconName() != null ? request.getIconName() : "Building2");
        config.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");
        config.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true);
        config.setIsSystemCore(false);
        config.setAllowWorkspaceCreation(request.getAllowWorkspaceCreation() != null ? request.getAllowWorkspaceCreation() : true);
        config.setShowInPricing(request.getShowInPricing() != null ? request.getShowInPricing() : true);
        config.setShowInDiscovery(request.getShowInDiscovery() != null ? request.getShowInDiscovery() : true);
        config.setBadgeText(request.getBadgeText());
        config.setBadgeVariant(request.getBadgeVariant() != null ? request.getBadgeVariant() : "emerald");
        config.setRoutePrefix(request.getRoutePrefix() != null ? request.getRoutePrefix() : "/" + key.toLowerCase());
        config.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : (int) moduleRepository.count() + 1);
        config.setTargetLaunchDate(request.getTargetLaunchDate());
        config.setMaintenanceMessage(request.getMaintenanceMessage());
        config.setUpdatedBy(adminUserId);

        config = moduleRepository.save(config);
        log.info("[OrganizationModuleService] Created new module: {} by admin: {}", key, adminUserId);
        return mapToDto(config);
    }

    @Transactional
    public OrganizationModuleConfigDto updateModule(String moduleKey, UpdateOrganizationModuleConfigRequest request, Long adminUserId) {
        OrganizationModuleConfig config = moduleRepository.findByModuleKeyIgnoreCase(moduleKey)
                .orElseThrow(() -> new ResourceNotFoundException("Organization module not found with key: " + moduleKey));

        if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
            config.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getCategoryLabel() != null && !request.getCategoryLabel().trim().isEmpty()) {
            config.setCategoryLabel(request.getCategoryLabel().trim());
        }
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        if (request.getIconName() != null) {
            config.setIconName(request.getIconName());
        }
        if (request.getStatus() != null) {
            config.setStatus(request.getStatus().toUpperCase());
        }
        if (request.getIsEnabled() != null) {
            config.setIsEnabled(request.getIsEnabled());
        }
        if (request.getAllowWorkspaceCreation() != null) {
            config.setAllowWorkspaceCreation(request.getAllowWorkspaceCreation());
        }
        if (request.getShowInPricing() != null) {
            config.setShowInPricing(request.getShowInPricing());
        }
        if (request.getShowInDiscovery() != null) {
            config.setShowInDiscovery(request.getShowInDiscovery());
        }
        if (request.getBadgeText() != null) {
            config.setBadgeText(request.getBadgeText());
        }
        if (request.getBadgeVariant() != null) {
            config.setBadgeVariant(request.getBadgeVariant());
        }
        if (request.getRoutePrefix() != null) {
            config.setRoutePrefix(request.getRoutePrefix());
        }
        if (request.getDisplayOrder() != null) {
            config.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getTargetLaunchDate() != null) {
            config.setTargetLaunchDate(request.getTargetLaunchDate());
        }
        if (request.getMaintenanceMessage() != null) {
            config.setMaintenanceMessage(request.getMaintenanceMessage());
        }
        config.setUpdatedBy(adminUserId);

        config = moduleRepository.save(config);
        log.info("[OrganizationModuleService] Updated module: {} by admin: {}", moduleKey, adminUserId);
        return mapToDto(config);
    }

    @Transactional
    public OrganizationModuleConfigDto toggleModuleStatus(String moduleKey, Long adminUserId) {
        OrganizationModuleConfig config = moduleRepository.findByModuleKeyIgnoreCase(moduleKey)
                .orElseThrow(() -> new ResourceNotFoundException("Organization module not found with key: " + moduleKey));

        boolean nextEnabled = !Boolean.TRUE.equals(config.getIsEnabled());
        config.setIsEnabled(nextEnabled);
        if (!nextEnabled && "ACTIVE".equalsIgnoreCase(config.getStatus())) {
            config.setStatus("DISABLED");
        } else if (nextEnabled && "DISABLED".equalsIgnoreCase(config.getStatus())) {
            config.setStatus("ACTIVE");
        }
        config.setUpdatedBy(adminUserId);

        config = moduleRepository.save(config);
        log.info("[OrganizationModuleService] Toggled module {} enabled={} by admin: {}", moduleKey, nextEnabled, adminUserId);
        return mapToDto(config);
    }

    @Transactional
    public void deleteModule(String moduleKey, Long adminUserId) {
        OrganizationModuleConfig config = moduleRepository.findByModuleKeyIgnoreCase(moduleKey)
                .orElseThrow(() -> new ResourceNotFoundException("Organization module not found with key: " + moduleKey));

        if (Boolean.TRUE.equals(config.getIsSystemCore())) {
            throw new BadRequestException("Core system module '" + config.getDisplayName() + "' cannot be deleted. You can set its status to DISABLED instead.");
        }

        moduleRepository.delete(config);
        log.info("[OrganizationModuleService] Deleted custom module: {} by admin: {}", moduleKey, adminUserId);
    }

    @Transactional
    public void reorderModules(List<String> moduleKeys) {
        if (moduleKeys == null || moduleKeys.isEmpty()) return;
        for (int i = 0; i < moduleKeys.size(); i++) {
            String key = moduleKeys.get(i);
            final int order = i + 1;
            moduleRepository.findByModuleKeyIgnoreCase(key).ifPresent(m -> {
                m.setDisplayOrder(order);
                moduleRepository.save(m);
            });
        }
    }

    @Transactional(readOnly = true)
    public boolean isWorkspaceCreationAllowed(String organizationType) {
        if (organizationType == null || organizationType.trim().isEmpty()) {
            return true;
        }

        String normalizedType = organizationType.trim().toUpperCase();
        if ("VENUE".equals(normalizedType)) {
            normalizedType = "COURT";
        }

        return moduleRepository.findByModuleKeyIgnoreCase(normalizedType)
                .map(m -> Boolean.TRUE.equals(m.getIsEnabled()) && Boolean.TRUE.equals(m.getAllowWorkspaceCreation()) && !"DISABLED".equalsIgnoreCase(m.getStatus()))
                .orElse(true);
    }

    private OrganizationModuleConfigDto mapToDto(OrganizationModuleConfig entity) {
        OrganizationModuleConfigDto dto = new OrganizationModuleConfigDto();
        dto.setModuleKey(entity.getModuleKey());
        dto.setDisplayName(entity.getDisplayName());
        dto.setCategoryLabel(entity.getCategoryLabel());
        dto.setDescription(entity.getDescription());
        dto.setIconName(entity.getIconName());
        dto.setStatus(entity.getStatus());
        dto.setIsEnabled(entity.getIsEnabled());
        dto.setIsSystemCore(entity.getIsSystemCore());
        dto.setAllowWorkspaceCreation(entity.getAllowWorkspaceCreation());
        dto.setShowInPricing(entity.getShowInPricing());
        dto.setShowInDiscovery(entity.getShowInDiscovery());
        dto.setBadgeText(entity.getBadgeText());
        dto.setBadgeVariant(entity.getBadgeVariant());
        dto.setRoutePrefix(entity.getRoutePrefix());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setTargetLaunchDate(entity.getTargetLaunchDate());
        dto.setMaintenanceMessage(entity.getMaintenanceMessage());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
