package com.athlon.identityservice.seo.dto;

public class SeoDashboardStatsDto {
    private int totalEligiblePublicPages;
    private int configuredMetadataCount;
    private int missingMetadataCount;
    private int warningCount;
    private int activeTemplatesCount;
    private int redirectRulesCount;
    private int sitemapsCount;
    private int publishedChangesCount;
    private String searchConsoleStatus = "CONNECTED";
    private String lastAuditRun;

    public SeoDashboardStatsDto() {}

    public int getTotalEligiblePublicPages() { return totalEligiblePublicPages; }
    public void setTotalEligiblePublicPages(int totalEligiblePublicPages) { this.totalEligiblePublicPages = totalEligiblePublicPages; }

    public int getConfiguredMetadataCount() { return configuredMetadataCount; }
    public void setConfiguredMetadataCount(int configuredMetadataCount) { this.configuredMetadataCount = configuredMetadataCount; }

    public int getMissingMetadataCount() { return missingMetadataCount; }
    public void setMissingMetadataCount(int missingMetadataCount) { this.missingMetadataCount = missingMetadataCount; }

    public int getWarningCount() { return warningCount; }
    public void setWarningCount(int warningCount) { this.warningCount = warningCount; }

    public int getActiveTemplatesCount() { return activeTemplatesCount; }
    public void setActiveTemplatesCount(int activeTemplatesCount) { this.activeTemplatesCount = activeTemplatesCount; }

    public int getRedirectRulesCount() { return redirectRulesCount; }
    public void setRedirectRulesCount(int redirectRulesCount) { this.redirectRulesCount = redirectRulesCount; }

    public int getSitemapsCount() { return sitemapsCount; }
    public void setSitemapsCount(int sitemapsCount) { this.sitemapsCount = sitemapsCount; }

    public int getPublishedChangesCount() { return publishedChangesCount; }
    public void setPublishedChangesCount(int publishedChangesCount) { this.publishedChangesCount = publishedChangesCount; }

    public String getSearchConsoleStatus() { return searchConsoleStatus; }
    public void setSearchConsoleStatus(String searchConsoleStatus) { this.searchConsoleStatus = searchConsoleStatus; }

    public String getLastAuditRun() { return lastAuditRun; }
    public void setLastAuditRun(String lastAuditRun) { this.lastAuditRun = lastAuditRun; }
}
