package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.AppModuleConfigDto;
import com.athlon.marketplaceservice.entity.AppModuleConfig;
import com.athlon.marketplaceservice.repository.AppModuleConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping({"/api/marketplace/config/modules", "/api/platform/modules"})
public class AppModuleConfigController {

    private static final String DEFAULT_CONFIG_KEY = "GLOBAL_APP_MODES";

    private final AppModuleConfigRepository configRepository;

    public AppModuleConfigController(AppModuleConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    private AppModuleConfig getOrCreateDefaultConfig() {
        return configRepository.findByConfigKey(DEFAULT_CONFIG_KEY)
                .orElseGet(() -> {
                    AppModuleConfig initial = new AppModuleConfig(
                            DEFAULT_CONFIG_KEY,
                            true,
                            true,
                            "ATHLON"
                    );
                    initial.setDescription("Global application modules (Athlon & Market)");
                    return configRepository.save(initial);
                });
    }

    private AppModuleConfigDto toDto(AppModuleConfig entity) {
        return new AppModuleConfigDto(
                Boolean.TRUE.equals(entity.getAthlonActive()),
                Boolean.TRUE.equals(entity.getMarketActive()),
                entity.getDefaultMode(),
                entity.getDescription()
        );
    }

    /**
     * Fetch active application module configuration.
     */
    @GetMapping({"", "/getModuleConfig"})
    public ResponseEntity<AppModuleConfigDto> getModuleConfig() {
        AppModuleConfig config = getOrCreateDefaultConfig();
        return ResponseEntity.ok(toDto(config));
    }

    /**
     * Fetch all application module configurations in array/list format.
     */
    @GetMapping("/getAllModuleConfigs")
    public ResponseEntity<List<AppModuleConfigDto>> getAllModuleConfigs() {
        AppModuleConfig config = getOrCreateDefaultConfig();
        return ResponseEntity.ok(Collections.singletonList(toDto(config)));
    }

    /**
     * Update active application module configuration dynamically.
     */
    @PostMapping({"", "/updateModuleConfig"})
    public ResponseEntity<AppModuleConfigDto> updateModuleConfig(@RequestBody AppModuleConfigDto request) {
        AppModuleConfig config = getOrCreateDefaultConfig();

        boolean newAthlon = request.isAthlonActive();
        boolean newMarket = request.isMarketActive();

        // Safety rule: at least one module must remain active
        if (!newAthlon && !newMarket) {
            newAthlon = true;
        }

        config.setAthlonActive(newAthlon);
        config.setMarketActive(newMarket);

        if (request.getDefaultMode() != null && !request.getDefaultMode().trim().isEmpty()) {
            String mode = request.getDefaultMode().trim().toUpperCase();
            if ("MARKET".equals(mode) && newMarket) {
                config.setDefaultMode("MARKET");
            } else {
                config.setDefaultMode("ATHLON");
            }
        }

        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }

        AppModuleConfig saved = configRepository.save(config);
        return ResponseEntity.ok(toDto(saved));
    }

    /**
     * Dynamically toggle specific module status (ATHLON or MARKET).
     */
    @PostMapping("/toggleModuleStatus/{module}")
    public ResponseEntity<AppModuleConfigDto> toggleModuleStatus(@PathVariable("module") String module) {
        AppModuleConfig config = getOrCreateDefaultConfig();
        String target = module != null ? module.trim().toUpperCase() : "";

        if ("ATHLON".equals(target)) {
            boolean current = Boolean.TRUE.equals(config.getAthlonActive());
            if (!current || Boolean.TRUE.equals(config.getMarketActive())) {
                config.setAthlonActive(!current);
            }
        } else if ("MARKET".equals(target)) {
            boolean current = Boolean.TRUE.equals(config.getMarketActive());
            if (!current || Boolean.TRUE.equals(config.getAthlonActive())) {
                config.setMarketActive(!current);
            }
        }

        // Adjust defaultMode if inactive
        if (Boolean.FALSE.equals(config.getAthlonActive()) && "ATHLON".equalsIgnoreCase(config.getDefaultMode())) {
            config.setDefaultMode("MARKET");
        } else if (Boolean.FALSE.equals(config.getMarketActive()) && "MARKET".equalsIgnoreCase(config.getDefaultMode())) {
            config.setDefaultMode("ATHLON");
        }

        AppModuleConfig saved = configRepository.save(config);
        return ResponseEntity.ok(toDto(saved));
    }

    /**
     * Dynamically set default landing mode (ATHLON or MARKET).
     */
    @PostMapping("/setDefaultMode/{mode}")
    public ResponseEntity<AppModuleConfigDto> setDefaultMode(@PathVariable("mode") String mode) {
        AppModuleConfig config = getOrCreateDefaultConfig();
        String target = mode != null ? mode.trim().toUpperCase() : "ATHLON";
        if ("MARKET".equals(target)) {
            config.setDefaultMode("MARKET");
        } else {
            config.setDefaultMode("ATHLON");
        }
        AppModuleConfig saved = configRepository.save(config);
        return ResponseEntity.ok(toDto(saved));
    }

    /**
     * Reset module configuration to factory defaults.
     */
    @PostMapping("/resetDefaultConfig")
    public ResponseEntity<AppModuleConfigDto> resetDefaultConfig() {
        AppModuleConfig config = getOrCreateDefaultConfig();
        config.setAthlonActive(true);
        config.setMarketActive(true);
        config.setDefaultMode("ATHLON");
        config.setDescription("Global application modules (Athlon & Market)");
        AppModuleConfig saved = configRepository.save(config);
        return ResponseEntity.ok(toDto(saved));
    }
}
