package com.athlon.identityservice.community.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.identityservice.community.enums.CommunityPlanType;
import com.athlon.identityservice.community.enums.CommunityRole;
import com.athlon.identityservice.community.enums.CommunityVisibility;

public class CommunityResponse {

    private Long organizationId;
    private UUID organizationUuid;
    private String name;
    private String primarySport;
    private String additionalSports;
    private CommunityVisibility visibility;
    private CommunityPlanType planType;
    private String description;
    private String rules;
    private String location;
    private String city;
    private String state;
    private String country;
    private String logoUrl;
    private String coverImageUrl;
    private Integer memberCount;
    private Integer sessionsCount;
    private Integer matchesCount;
    private Integer tournamentsCount;
    private CommunityRole currentUserRole;
    private String currentUserStatus;
    private LocalDateTime createdAt;

    public CommunityResponse() {
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public UUID getOrgUuid() {
        return organizationUuid;
    }

    public UUID getCommunityUuid() {
        return organizationUuid;
    }

    public Integer getTotalSessionsHosted() {
        return sessionsCount != null ? sessionsCount : 0;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrimarySport() {
        return primarySport;
    }

    public void setPrimarySport(String primarySport) {
        this.primarySport = primarySport;
    }

    public String getAdditionalSports() {
        return additionalSports;
    }

    public void setAdditionalSports(String additionalSports) {
        this.additionalSports = additionalSports;
    }

    public CommunityVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(CommunityVisibility visibility) {
        this.visibility = visibility;
    }

    public CommunityPlanType getPlanType() {
        return planType;
    }

    public void setPlanType(CommunityPlanType planType) {
        this.planType = planType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public Integer getSessionsCount() {
        return sessionsCount;
    }

    public void setSessionsCount(Integer sessionsCount) {
        this.sessionsCount = sessionsCount;
    }

    public Integer getMatchesCount() {
        return matchesCount;
    }

    public void setMatchesCount(Integer matchesCount) {
        this.matchesCount = matchesCount;
    }

    public Integer getTournamentsCount() {
        return tournamentsCount;
    }

    public void setTournamentsCount(Integer tournamentsCount) {
        this.tournamentsCount = tournamentsCount;
    }

    public CommunityRole getCurrentUserRole() {
        return currentUserRole;
    }

    public void setCurrentUserRole(CommunityRole currentUserRole) {
        this.currentUserRole = currentUserRole;
    }

    public String getCurrentUserStatus() {
        return currentUserStatus;
    }

    public void setCurrentUserStatus(String currentUserStatus) {
        this.currentUserStatus = currentUserStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
