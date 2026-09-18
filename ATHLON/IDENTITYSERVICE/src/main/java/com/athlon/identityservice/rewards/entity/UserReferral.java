package com.athlon.identityservice.rewards.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.rewards.enums.ReferralStatus;

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
@Table(name = "user_referrals")
public class UserReferral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "referral_id", updatable = false, nullable = false)
    private Long referralId;

    @Column(name = "referral_uuid", updatable = false, nullable = false, unique = true)
    private UUID referralUuid;

    @Column(name = "referrer_user_id", nullable = false)
    private Long referrerUserId;

    @Column(name = "referrer_user_uuid", nullable = false)
    private UUID referrerUserUuid;

    @Column(name = "referee_user_id", nullable = false, unique = true)
    private Long refereeUserId;

    @Column(name = "referee_user_uuid", nullable = false)
    private UUID refereeUserUuid;

    @Column(name = "referral_code", nullable = false, length = 30)
    private String referralCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ReferralStatus status = ReferralStatus.COMPLETED;

    @Column(name = "referrer_credits_awarded", nullable = false)
    private Integer referrerCreditsAwarded = 0;

    @Column(name = "referee_credits_awarded", nullable = false)
    private Integer refereeCreditsAwarded = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserReferral() {
    }

    public UserReferral(Long referrerUserId, UUID referrerUserUuid, Long refereeUserId, UUID refereeUserUuid, String referralCode, Integer referrerCreditsAwarded, Integer refereeCreditsAwarded) {
        this.referrerUserId = referrerUserId;
        this.referrerUserUuid = referrerUserUuid;
        this.refereeUserId = refereeUserId;
        this.refereeUserUuid = refereeUserUuid;
        this.referralCode = referralCode;
        this.referrerCreditsAwarded = referrerCreditsAwarded != null ? referrerCreditsAwarded : 0;
        this.refereeCreditsAwarded = refereeCreditsAwarded != null ? refereeCreditsAwarded : 0;
        this.status = ReferralStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (referralUuid == null) {
            referralUuid = UUID.randomUUID();
        }
        if (status == null) {
            status = ReferralStatus.COMPLETED;
        }
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }

    public Long getReferralId() {
        return referralId;
    }

    public void setReferralId(Long referralId) {
        this.referralId = referralId;
    }

    public UUID getReferralUuid() {
        return referralUuid;
    }

    public void setReferralUuid(UUID referralUuid) {
        this.referralUuid = referralUuid;
    }

    public Long getReferrerUserId() {
        return referrerUserId;
    }

    public void setReferrerUserId(Long referrerUserId) {
        this.referrerUserId = referrerUserId;
    }

    public UUID getReferrerUserUuid() {
        return referrerUserUuid;
    }

    public void setReferrerUserUuid(UUID referrerUserUuid) {
        this.referrerUserUuid = referrerUserUuid;
    }

    public Long getRefereeUserId() {
        return refereeUserId;
    }

    public void setRefereeUserId(Long refereeUserId) {
        this.refereeUserId = refereeUserId;
    }

    public UUID getRefereeUserUuid() {
        return refereeUserUuid;
    }

    public void setRefereeUserUuid(UUID refereeUserUuid) {
        this.refereeUserUuid = refereeUserUuid;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public ReferralStatus getStatus() {
        return status;
    }

    public void setStatus(ReferralStatus status) {
        this.status = status;
    }

    public Integer getReferrerCreditsAwarded() {
        return referrerCreditsAwarded;
    }

    public void setReferrerCreditsAwarded(Integer referrerCreditsAwarded) {
        this.referrerCreditsAwarded = referrerCreditsAwarded;
    }

    public Integer getRefereeCreditsAwarded() {
        return refereeCreditsAwarded;
    }

    public void setRefereeCreditsAwarded(Integer refereeCreditsAwarded) {
        this.refereeCreditsAwarded = refereeCreditsAwarded;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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
        if (!(o instanceof UserReferral)) return false;
        UserReferral that = (UserReferral) o;
        return Objects.equals(referralId, that.referralId) &&
               Objects.equals(referralUuid, that.referralUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(referralId, referralUuid);
    }
}
