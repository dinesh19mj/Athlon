package com.athlon.tournament.registration.entity;

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
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registrationid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "registrationuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "tournamentid", nullable = false)
    private Long tournamentId;

    @Column(name = "tournamentuuid", nullable = false)
    private UUID tournamentUuid;

    @Column(name = "categoryid", nullable = false)
    private Long categoryId;

    @Column(name = "categoryuuid", nullable = false)
    private UUID categoryUuid;

    @Column(name = "teamname")
    private String teamName;

    @Column(name = "primarycontactid", nullable = false)
    private Long primaryContactId;

    @Column(name = "primarycontactuuid", nullable = false)
    private UUID primaryContactUuid;

    @Column(name = "status", nullable = false)
    private String status = "PENDING";

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

    public Registration() {
    }

    public Registration(Long tournamentId, UUID tournamentUuid, Long categoryId, UUID categoryUuid, String teamName, Long primaryContactId, UUID primaryContactUuid, Long createdBy) {
        this.tournamentId = tournamentId;
        this.tournamentUuid = tournamentUuid;
        this.categoryId = categoryId;
        this.categoryUuid = categoryUuid;
        this.teamName = teamName;
        this.primaryContactId = primaryContactId;
        this.primaryContactUuid = primaryContactUuid;
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
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public UUID getTournamentUuid() { return tournamentUuid; }
    public void setTournamentUuid(UUID tournamentUuid) { this.tournamentUuid = tournamentUuid; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public UUID getCategoryUuid() { return categoryUuid; }
    public void setCategoryUuid(UUID categoryUuid) { this.categoryUuid = categoryUuid; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public Long getPrimaryContactId() { return primaryContactId; }
    public void setPrimaryContactId(Long primaryContactId) { this.primaryContactId = primaryContactId; }
    public UUID getPrimaryContactUuid() { return primaryContactUuid; }
    public void setPrimaryContactUuid(UUID primaryContactUuid) { this.primaryContactUuid = primaryContactUuid; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
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
        Registration that = (Registration) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "Registration{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", tournamentId=" + tournamentId +
                ", categoryId=" + categoryId +
                ", status='" + status + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
