package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.community.enums.CommunityPlanType;
import com.athlon.identityservice.community.enums.CommunityVisibility;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "community_details")
public class CommunityDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "community_detail_id", updatable = false, nullable = false)
    private Long communityDetailId;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false, unique = true)
    private UUID organizationUuid;

    @Column(name = "primary_sport", nullable = false, length = 80)
    private String primarySport;

    @Column(name = "additional_sports", length = 500)
    private String additionalSports;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 40)
    private CommunityVisibility visibility = CommunityVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false, length = 40)
    private CommunityPlanType planType = CommunityPlanType.COMMUNITY_FREE;

    @Column(name = "rules", columnDefinition = "TEXT")
    private String rules;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country = "India";

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "member_count", nullable = false)
    private Integer memberCount = 1;

    @Column(name = "max_members")
    private Integer maxMembers = 50;

    @Column(name = "sessions_count", nullable = false)
    private Integer sessionsCount = 0;

    @Column(name = "matches_count", nullable = false)
    private Integer matchesCount = 0;

    @Column(name = "tournaments_count", nullable = false)
    private Integer tournamentsCount = 0;

    @Column(name = "is_active", nullable = false)
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityDetails() {
    }

    @PrePersist
    public void prePersist() {
        if (visibility == null) visibility = CommunityVisibility.PUBLIC;
        if (planType == null) planType = CommunityPlanType.COMMUNITY_FREE;
        if (memberCount == null) memberCount = 1;
        if (sessionsCount == null) sessionsCount = 0;
        if (matchesCount == null) matchesCount = 0;
        if (tournamentsCount == null) tournamentsCount = 0;
        if (isActive == null) isActive = 1;
    }

    public Long getCommunityDetailId() {
        return communityDetailId;
    }

    public void setCommunityDetailId(Long communityDetailId) {
        this.communityDetailId = communityDetailId;
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

    public String getRules() {
        return rules;
    }

    public void setRules(String rules) {
        this.rules = rules;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Integer getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Integer maxMembers) {
        this.maxMembers = maxMembers;
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

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
