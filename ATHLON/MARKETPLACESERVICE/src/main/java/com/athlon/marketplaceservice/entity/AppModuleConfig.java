package com.athlon.marketplaceservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_module_configs")
public class AppModuleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true)
    private String configKey = "GLOBAL_APP_MODES";

    @Column(name = "athlon_active", nullable = false)
    private Boolean athlonActive = true;

    @Column(name = "market_active", nullable = false)
    private Boolean marketActive = true;

    @Column(name = "default_mode", nullable = false)
    private String defaultMode = "ATHLON"; // "ATHLON" or "MARKET"

    @Column(name = "description")
    private String description = "Global module enablement configuration for Athlon and Market modes";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public AppModuleConfig() {}

    public AppModuleConfig(String configKey, Boolean athlonActive, Boolean marketActive, String defaultMode) {
        this.configKey = configKey;
        this.athlonActive = athlonActive;
        this.marketActive = marketActive;
        this.defaultMode = defaultMode;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }

    public Boolean getAthlonActive() { return athlonActive != null ? athlonActive : true; }
    public void setAthlonActive(Boolean athlonActive) { this.athlonActive = athlonActive; }

    public Boolean getMarketActive() { return marketActive != null ? marketActive : true; }
    public void setMarketActive(Boolean marketActive) { this.marketActive = marketActive; }

    public String getDefaultMode() { return defaultMode != null ? defaultMode : "ATHLON"; }
    public void setDefaultMode(String defaultMode) { this.defaultMode = defaultMode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isShowModeSwitcher() {
        return Boolean.TRUE.equals(this.athlonActive) && Boolean.TRUE.equals(this.marketActive);
    }
}
