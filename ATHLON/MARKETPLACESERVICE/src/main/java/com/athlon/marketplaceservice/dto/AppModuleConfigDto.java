package com.athlon.marketplaceservice.dto;

import java.util.ArrayList;
import java.util.List;

public class AppModuleConfigDto {

    private boolean athlonActive;
    private boolean marketActive;
    private String defaultMode;
    private boolean showModeSwitcher;
    private List<String> activeModes = new ArrayList<>();
    private String description;

    public AppModuleConfigDto() {}

    public AppModuleConfigDto(boolean athlonActive, boolean marketActive, String defaultMode, String description) {
        this.athlonActive = athlonActive;
        this.marketActive = marketActive;
        this.defaultMode = defaultMode != null ? defaultMode : "ATHLON";
        this.showModeSwitcher = athlonActive && marketActive;
        this.description = description;

        this.activeModes = new ArrayList<>();
        if (athlonActive) this.activeModes.add("ATHLON");
        if (marketActive) this.activeModes.add("MARKET");
    }

    public boolean isAthlonActive() { return athlonActive; }
    public void setAthlonActive(boolean athlonActive) { 
        this.athlonActive = athlonActive; 
        this.showModeSwitcher = this.athlonActive && this.marketActive;
    }

    public boolean isMarketActive() { return marketActive; }
    public void setMarketActive(boolean marketActive) { 
        this.marketActive = marketActive; 
        this.showModeSwitcher = this.athlonActive && this.marketActive;
    }

    public String getDefaultMode() { return defaultMode; }
    public void setDefaultMode(String defaultMode) { this.defaultMode = defaultMode; }

    public boolean isShowModeSwitcher() { return showModeSwitcher; }
    public void setShowModeSwitcher(boolean showModeSwitcher) { this.showModeSwitcher = showModeSwitcher; }

    public List<String> getActiveModes() { return activeModes; }
    public void setActiveModes(List<String> activeModes) { this.activeModes = activeModes; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
