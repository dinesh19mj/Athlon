package com.athlon.identityservice.community.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.community.enums.SessionStatus;

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
@Table(name = "community_sessions")
public class CommunitySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id", updatable = false, nullable = false)
    private Long sessionId;

    @Column(name = "session_uuid", updatable = false, nullable = false, unique = true)
    private UUID sessionUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "creator_user_uuid", nullable = false)
    private UUID creatorUserUuid;

    @Column(name = "creator_user_name", length = 150)
    private String creatorUserName;

    @Column(name = "sport", nullable = false, length = 80)
    private String sport;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "venue_id")
    private Long venueId;

    @Column(name = "venue_uuid")
    private UUID venueUuid;

    @Column(name = "venue_name", length = 200)
    private String venueName;

    @Column(name = "court_name", length = 100)
    private String courtName;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "google_map_url", length = 500)
    private String googleMapUrl;

    @Column(name = "location_address", length = 300)
    private String locationAddress;

    @Column(name = "gender_category", length = 30)
    private String genderCategory = "BOTH"; // BOTH, MALE, FEMALE, ANY

    @Column(name = "max_male_players")
    private Integer maxMalePlayers;

    @Column(name = "max_female_players")
    private Integer maxFemalePlayers;

    @Column(name = "max_players")
    private Integer maxPlayers;

    @Column(name = "confirmed_players_count")
    private Integer confirmedPlayersCount = 0;

    @Column(name = "skill_level", length = 50)
    private String skillLevel = "ALL"; // ALL, BEGINNER, INTERMEDIATE, ADVANCED

    @Column(name = "cost_per_player", precision = 10, scale = 2)
    private BigDecimal costPerPlayer;

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;

    @Column(name = "recurrence_rule", length = 100)
    private String recurrenceRule; // WEEKLY, BIWEEKLY

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private SessionStatus status = SessionStatus.SCHEDULED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunitySession() {
    }

    @PrePersist
    public void prePersist() {
        if (sessionUuid == null) {
            sessionUuid = UUID.randomUUID();
        }
        if (confirmedPlayersCount == null) confirmedPlayersCount = 0;
        if (isRecurring == null) isRecurring = false;
        if (status == null) status = SessionStatus.SCHEDULED;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public UUID getCreatorUserUuid() {
        return creatorUserUuid;
    }

    public void setCreatorUserUuid(UUID creatorUserUuid) {
        this.creatorUserUuid = creatorUserUuid;
    }

    public String getCreatorUserName() {
        return creatorUserName;
    }

    public void setCreatorUserName(String creatorUserName) {
        this.creatorUserName = creatorUserName;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public UUID getVenueUuid() {
        return venueUuid;
    }

    public void setVenueUuid(UUID venueUuid) {
        this.venueUuid = venueUuid;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getLocationAddress() {
        return locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public Integer getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public Integer getConfirmedPlayersCount() {
        return confirmedPlayersCount;
    }

    public void setConfirmedPlayersCount(Integer confirmedPlayersCount) {
        this.confirmedPlayersCount = confirmedPlayersCount;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public BigDecimal getCostPerPlayer() {
        return costPerPlayer;
    }

    public void setCostPerPlayer(BigDecimal costPerPlayer) {
        this.costPerPlayer = costPerPlayer;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public String getRecurrenceRule() {
        return recurrenceRule;
    }

    public void setRecurrenceRule(String recurrenceRule) {
        this.recurrenceRule = recurrenceRule;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
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

    public String getGoogleMapUrl() {
        return googleMapUrl;
    }

    public void setGoogleMapUrl(String googleMapUrl) {
        this.googleMapUrl = googleMapUrl;
    }

    public String getGenderCategory() {
        return genderCategory;
    }

    public void setGenderCategory(String genderCategory) {
        this.genderCategory = genderCategory;
    }

    public Integer getMaxMalePlayers() {
        return maxMalePlayers;
    }

    public void setMaxMalePlayers(Integer maxMalePlayers) {
        this.maxMalePlayers = maxMalePlayers;
    }

    public Integer getMaxFemalePlayers() {
        return maxFemalePlayers;
    }

    public void setMaxFemalePlayers(Integer maxFemalePlayers) {
        this.maxFemalePlayers = maxFemalePlayers;
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
