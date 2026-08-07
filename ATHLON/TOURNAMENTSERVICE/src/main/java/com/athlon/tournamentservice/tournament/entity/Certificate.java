package com.athlon.tournamentservice.tournament.entity;

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
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certificateid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "certificateuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "registrationid", nullable = false)
    private Long registrationId;

    @Column(name = "registrationuuid", nullable = false)
    private UUID registrationUuid;

    @Column(name = "playerid")
    private Long playerId;

    @Column(name = "playeruuid")
    private UUID playerUuid;

    @Column(name = "certificatetype", nullable = false)
    private String certificateType;

    @Column(name = "fileurl")
    private String fileUrl;

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

    public Certificate() {
    }

    public Certificate(Long registrationId, UUID registrationUuid, Long playerId, UUID playerUuid, String certificateType, String fileUrl, Long createdBy) {
        this.registrationId = registrationId;
        this.registrationUuid = registrationUuid;
        this.playerId = playerId;
        this.playerUuid = playerUuid;
        this.certificateType = certificateType;
        this.fileUrl = fileUrl;
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
    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }
    public UUID getRegistrationUuid() { return registrationUuid; }
    public void setRegistrationUuid(UUID registrationUuid) { this.registrationUuid = registrationUuid; }
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    public UUID getPlayerUuid() { return playerUuid; }
    public void setPlayerUuid(UUID playerUuid) { this.playerUuid = playerUuid; }
    public String getCertificateType() { return certificateType; }
    public void setCertificateType(String certificateType) { this.certificateType = certificateType; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
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
        Certificate that = (Certificate) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "Certificate{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", registrationId=" + registrationId +
                ", certificateType='" + certificateType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}

