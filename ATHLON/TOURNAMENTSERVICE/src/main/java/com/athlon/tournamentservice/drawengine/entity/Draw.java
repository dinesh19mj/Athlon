package com.athlon.tournamentservice.drawengine.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "draws")
public class Draw {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drawid", updatable = false, nullable = false)
    private Long drawId;

    @Column(name = "drawuuid", updatable = false, nullable = false, unique = true)
    private UUID drawUuid;

    @Column(name = "tournamentid", nullable = false)
    private Long tournamentId;

    @Column(name = "categoryid", nullable = false)
    private Long categoryId;

    @Column(name = "drawtype", nullable = false)
    private String drawType;

    @Column(name = "drawsize")
    private Integer drawSize;

    @Column(name = "status", nullable = false)
    private String status = "DRAFT";

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public Draw() {
    }

    public Draw(
            Long tournamentId,
            Long categoryId,
            String drawType,
            Integer drawSize,
            Long createdBy) {

        this.tournamentId = tournamentId;
        this.categoryId = categoryId;
        this.drawType = drawType;
        this.drawSize = drawSize;
        this.createdBy = createdBy;
        this.status = "DRAFT";
        this.isActive = 1;
    }

    @PrePersist
    protected void onCreate() {

        if (this.drawUuid == null) {
            this.drawUuid = UUID.randomUUID();
        }

        if (this.isActive == null) {
            this.isActive = 1;
        }

        if (this.status == null) {
            this.status = "DRAFT";
        }
    }

    public Long getDrawId() {
        return drawId;
    }

    public void setDrawId(Long drawId) {
        this.drawId = drawId;
    }

    public UUID getDrawUuid() {
        return drawUuid;
    }

    public void setDrawUuid(UUID drawUuid) {
        this.drawUuid = drawUuid;
    }

    public Long getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(Long tournamentId) {
        this.tournamentId = tournamentId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getDrawType() {
        return drawType;
    }

    public void setDrawType(String drawType) {
        this.drawType = drawType;
    }

    public Integer getDrawSize() {
        return drawSize;
    }

    public void setDrawSize(Integer drawSize) {
        this.drawSize = drawSize;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof Draw)) {
            return false;
        }

        Draw draw = (Draw) o;

        return Objects.equals(drawId, draw.drawId)
                && Objects.equals(drawUuid, draw.drawUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(drawId, drawUuid);
    }

    @Override
    public String toString() {
        return "Draw{" +
                "drawId=" + drawId +
                ", drawUuid=" + drawUuid +
                ", tournamentId=" + tournamentId +
                ", categoryId=" + categoryId +
                ", drawType='" + drawType + '\'' +
                ", drawSize=" + drawSize +
                ", status='" + status + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", createdBy=" + createdBy +
                ", updatedBy=" + updatedBy +
                '}';
    }
}
