package com.athlon.identityservice.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "sports_profiles")
public class SportsProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sportsprofileid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "sportsprofileuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "userid", nullable = false)
    private Long userId;

    @Column(name = "useruuid", nullable = false)
    private UUID userUuid;

    @Column(name = "sportname", nullable = false, length = 100)
    private String sportName;

    @Column(name = "currentranking")
    private Integer currentRanking;

    @Column(name = "verificationstatus", length = 50)
    private String verificationStatus; // e.g., PENDING, APPROVED, REJECTED

    @Column(name = "careerhighlights", columnDefinition = "TEXT")
    private String careerHighlights;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    public SportsProfile() {
    }

    public SportsProfile(Long userId, UUID userUuid, String sportName) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.sportName = sportName;
        this.verificationStatus = "PENDING";
    }

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public UUID getUserUuid() { return userUuid; }
    public void setUserUuid(UUID userUuid) { this.userUuid = userUuid; }

    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }

    public Integer getCurrentRanking() { return currentRanking; }
    public void setCurrentRanking(Integer currentRanking) { this.currentRanking = currentRanking; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getCareerHighlights() { return careerHighlights; }
    public void setCareerHighlights(String careerHighlights) { this.careerHighlights = careerHighlights; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SportsProfile that = (SportsProfile) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }
}
