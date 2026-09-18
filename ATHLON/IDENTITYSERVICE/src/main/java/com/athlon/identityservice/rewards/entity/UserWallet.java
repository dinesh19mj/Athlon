package com.athlon.identityservice.rewards.entity;

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
import jakarta.persistence.Version;

@Entity
@Table(name = "user_wallets")
public class UserWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_id", updatable = false, nullable = false)
    private Long walletId;

    @Column(name = "wallet_uuid", updatable = false, nullable = false, unique = true)
    private UUID walletUuid;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "referral_code", nullable = false, unique = true, length = 30)
    private String referralCode;

    @Column(name = "balance", nullable = false)
    private Long balance = 0L;

    @Column(name = "total_earned", nullable = false)
    private Long totalEarned = 0L;

    @Column(name = "total_spent", nullable = false)
    private Long totalSpent = 0L;

    @Column(name = "is_active", nullable = false)
    private Integer isActive = 1;

    @Version
    @Column(name = "version")
    private Long version = 0L;

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

    public UserWallet() {
    }

    public UserWallet(Long userId, UUID userUuid, String referralCode, Long createdBy) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.referralCode = referralCode;
        this.balance = 0L;
        this.totalEarned = 0L;
        this.totalSpent = 0L;
        this.isActive = 1;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void prePersist() {
        if (walletUuid == null) {
            walletUuid = UUID.randomUUID();
        }
        if (balance == null) {
            balance = 0L;
        }
        if (totalEarned == null) {
            totalEarned = 0L;
        }
        if (totalSpent == null) {
            totalSpent = 0L;
        }
        if (isActive == null) {
            isActive = 1;
        }
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public UUID getWalletUuid() {
        return walletUuid;
    }

    public void setWalletUuid(UUID walletUuid) {
        this.walletUuid = walletUuid;
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

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public Long getBalance() {
        return balance;
    }

    public void setBalance(Long balance) {
        this.balance = balance;
    }

    public Long getTotalEarned() {
        return totalEarned;
    }

    public void setTotalEarned(Long totalEarned) {
        this.totalEarned = totalEarned;
    }

    public Long getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Long totalSpent) {
        this.totalSpent = totalSpent;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
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
        if (this == o) return true;
        if (!(o instanceof UserWallet)) return false;
        UserWallet that = (UserWallet) o;
        return Objects.equals(walletId, that.walletId) &&
               Objects.equals(walletUuid, that.walletUuid) &&
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(walletId, walletUuid, userId);
    }
}
