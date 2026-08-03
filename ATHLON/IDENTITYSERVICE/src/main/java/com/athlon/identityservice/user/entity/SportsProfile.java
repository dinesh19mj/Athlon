package com.athlon.identityservice.user.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "sports_profiles")
public class SportsProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sports_profileid", updatable = false, nullable = false)
    private Long sportsProfileId;

    @Column(name = "sports_profileuuid", updatable = false, nullable = false, unique = true)
    private UUID sportsProfileUuid;

    @Column(name = "userid", nullable = false)
    private Long userId;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "sportname", nullable = false, length = 100)
    private String sportName;

    @Column(name = "current_ranking")
    private Integer currentRanking;

    @Column(name = "verification_status", length = 50)
    private String verificationStatus;

    @Column(name = "career_highlights", columnDefinition = "TEXT")
    private String careerHighlights;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public SportsProfile() {
    }

    public SportsProfile(Long userId, UUID userUuid, String sportName) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.sportName = sportName;
        this.verificationStatus = "PENDING";
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {

        if (sportsProfileUuid == null) {
            sportsProfileUuid = UUID.randomUUID();
        }

        if (isActive == null) {
            isActive = 1;
        }

        if (verificationStatus == null) {
            verificationStatus = "PENDING";
        }
    }

    public Long getSportsProfileId() {
        return sportsProfileId;
    }

    public void setSportsProfileId(Long sportsProfileId) {
        this.sportsProfileId = sportsProfileId;
    }

    public UUID getSportsProfileUuid() {
        return sportsProfileUuid;
    }

    public void setSportsProfileUuid(UUID sportsProfileUuid) {
        this.sportsProfileUuid = sportsProfileUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public Integer getCurrentRanking() {
        return currentRanking;
    }

    public void setCurrentRanking(Integer currentRanking) {
        this.currentRanking = currentRanking;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getCareerHighlights() {
        return careerHighlights;
    }

    public void setCareerHighlights(String careerHighlights) {
        this.careerHighlights = careerHighlights;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public boolean isActive() {
        return isActive != null && isActive == 1;
    }

    public void setActive(boolean active) {
        this.isActive = active ? 1 : 0;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SportsProfile)) return false;
        SportsProfile that = (SportsProfile) o;
        return Objects.equals(sportsProfileId, that.sportsProfileId)
                && Objects.equals(sportsProfileUuid, that.sportsProfileUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sportsProfileId, sportsProfileUuid);
    }

    @Override
    public String toString() {
        return "SportsProfile{" +
                "sportsProfileId=" + sportsProfileId +
                ", sportsProfileUuid=" + sportsProfileUuid +
                ", userId=" + userId +
                ", userUuid=" + userUuid +
                ", sportName='" + sportName + '\'' +
                ", currentRanking=" + currentRanking +
                ", verificationStatus='" + verificationStatus + '\'' +
                ", careerHighlights='" + careerHighlights + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}