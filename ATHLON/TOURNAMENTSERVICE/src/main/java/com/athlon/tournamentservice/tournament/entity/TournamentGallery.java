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
@Table(name = "gallery")
public class TournamentGallery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tournamentgalleryid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "tournamentgalleryuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "tournamentid", nullable = false)
    private Long tournamentId;

    @Column(name = "tournamentuuid", nullable = false)
    private UUID tournamentUuid;

    @Column(name = "mediaurl", nullable = false)
    private String mediaUrl;

    @Column(name = "mediatype", nullable = false)
    private String mediaType;

    @Column(name = "caption", columnDefinition = "TEXT")
    private String caption;

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

    public TournamentGallery() {
    }

    public TournamentGallery(Long tournamentId, UUID tournamentUuid, String mediaUrl, String mediaType, String caption, Long createdBy) {
        this.tournamentId = tournamentId;
        this.tournamentUuid = tournamentUuid;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.caption = caption;
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
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
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
        TournamentGallery that = (TournamentGallery) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "TournamentGallery{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", tournamentId=" + tournamentId +
                ", mediaType='" + mediaType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}

