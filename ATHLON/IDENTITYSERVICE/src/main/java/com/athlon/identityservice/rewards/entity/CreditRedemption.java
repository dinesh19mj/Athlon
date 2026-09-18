package com.athlon.identityservice.rewards.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.rewards.enums.RedemptionStatus;
import com.athlon.identityservice.rewards.enums.RedemptionType;

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
@Table(name = "credit_redemptions")
public class CreditRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "redemption_id", updatable = false, nullable = false)
    private Long redemptionId;

    @Column(name = "redemption_uuid", updatable = false, nullable = false, unique = true)
    private UUID redemptionUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "redemption_type", nullable = false, length = 50)
    private RedemptionType redemptionType;

    @Column(name = "credits_spent", nullable = false)
    private Integer creditsSpent;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RedemptionStatus status = RedemptionStatus.APPLIED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CreditRedemption() {
    }

    public CreditRedemption(Long userId, UUID userUuid, RedemptionType redemptionType, Integer creditsSpent, String targetId) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.redemptionType = redemptionType;
        this.creditsSpent = creditsSpent;
        this.targetId = targetId;
        this.status = RedemptionStatus.APPLIED;
    }

    @PrePersist
    public void prePersist() {
        if (redemptionUuid == null) {
            redemptionUuid = UUID.randomUUID();
        }
        if (status == null) {
            status = RedemptionStatus.APPLIED;
        }
    }

    public Long getRedemptionId() {
        return redemptionId;
    }

    public void setRedemptionId(Long redemptionId) {
        this.redemptionId = redemptionId;
    }

    public UUID getRedemptionUuid() {
        return redemptionUuid;
    }

    public void setRedemptionUuid(UUID redemptionUuid) {
        this.redemptionUuid = redemptionUuid;
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

    public RedemptionType getRedemptionType() {
        return redemptionType;
    }

    public void setRedemptionType(RedemptionType redemptionType) {
        this.redemptionType = redemptionType;
    }

    public Integer getCreditsSpent() {
        return creditsSpent;
    }

    public void setCreditsSpent(Integer creditsSpent) {
        this.creditsSpent = creditsSpent;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public RedemptionStatus getStatus() {
        return status;
    }

    public void setStatus(RedemptionStatus status) {
        this.status = status;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CreditRedemption)) return false;
        CreditRedemption that = (CreditRedemption) o;
        return Objects.equals(redemptionId, that.redemptionId) &&
               Objects.equals(redemptionUuid, that.redemptionUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(redemptionId, redemptionUuid);
    }
}
