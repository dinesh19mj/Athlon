package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.AppModuleConfigDto;
import com.athlon.marketplaceservice.entity.AppModuleConfig;
import com.athlon.marketplaceservice.repository.AppModuleConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/marketplace/config/modules", "/api/platform/modules"})
public class AppModuleConfigController {

    private static final String DEFAULT_CONFIG_KEY = "GLOBAL_APP_MODES";

    private final AppModuleConfigRepository configRepository;

    public AppModuleConfigController(AppModuleConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    /**
     * Fetch active application module configuration.
     * If not present, auto-seeds default configuration (both ATHLON and MARKET active).
     */
    @GetMapping
    public ResponseEntity<AppModuleConfigDto> getModuleConfig() {
        AppModuleConfig config = configRepository.findByConfigKey(DEFAULT_CONFIG_KEY)
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

        AppModuleConfigDto dto = new AppModuleConfigDto(
                config.getAthlonActive(),
                config.getMarketActive(),
                config.getDefaultMode(),
                config.getDescription()
        );

        return ResponseEntity.ok(dto);
    }

    /**
     * Update active application module configuration.
     */
    @PutMapping
    public ResponseEntity<AppModuleConfigDto> updateModuleConfig(@RequestBody AppModuleConfigDto request) {
        AppModuleConfig config = configRepository.findByConfigKey(DEFAULT_CONFIG_KEY)
                .orElseGet(() -> new AppModuleConfig(DEFAULT_CONFIG_KEY, true, true, "ATHLON"));

        if (request.isAthlonActive() || request.isMarketActive()) {
            config.setAthlonActive(request.isAthlonActive());
            config.setMarketActive(request.isMarketActive());
        }

        if (request.getDefaultMode() != null && !request.getDefaultMode().trim().isEmpty()) {
            config.setDefaultMode(request.getDefaultMode().trim().toUpperCase());
        }

        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }

        AppModuleConfig saved = configRepository.save(config);

        AppModuleConfigDto responseDto = new AppModuleConfigDto(
                saved.getAthlonActive(),
                saved.getMarketActive(),
                saved.getDefaultMode(),
                saved.getDescription()
        );

        return ResponseEntity.ok(responseDto);
    }
}
