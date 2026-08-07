package com.athlon.tournamentservice.match.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "match_officials")
public class MatchOfficial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matchofficialid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "matchofficialuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "matchid", nullable = false)
    private Long matchId;

    @Column(name = "matchuuid", nullable = false)
    private UUID matchUuid;

    @Column(name = "officialid", nullable = false)
    private Long officialId;

    @Column(name = "officialuuid", nullable = false)
    private UUID officialUuid;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long updatedBy;

    public MatchOfficial() {
    }

    public MatchOfficial(Long matchId, UUID matchUuid, Long officialId, UUID officialUuid, String role, Long createdBy) {
        this.matchId = matchId;
        this.matchUuid = matchUuid;
        this.officialId = officialId;
        this.officialUuid = officialUuid;
        this.role = role;
        this.createdBy = createdBy;
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public UUID getMatchUuid() { return matchUuid; }
    public void setMatchUuid(UUID matchUuid) { this.matchUuid = matchUuid; }
    public Long getOfficialId() { return officialId; }
    public void setOfficialId(Long officialId) { this.officialId = officialId; }
    public UUID getOfficialUuid() { return officialUuid; }
    public void setOfficialUuid(UUID officialUuid) { this.officialUuid = officialUuid; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MatchOfficial that = (MatchOfficial) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "MatchOfficial{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", matchId=" + matchId +
                ", officialId=" + officialId +
                ", role='" + role + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}

