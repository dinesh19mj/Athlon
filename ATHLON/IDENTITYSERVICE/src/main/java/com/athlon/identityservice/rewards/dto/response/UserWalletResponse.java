package com.athlon.identityservice.rewards.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserWalletResponse {

    private UUID walletUuid;
    private Long userId;
    private UUID userUuid;
    private String referralCode;
    private String referralLink;
    private Long balance;
    private Long totalEarned;
    private Long totalSpent;
    private Integer totalReferralsCount;
    private LocalDateTime updatedAt;

    public UserWalletResponse() {
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

    public String getReferralLink() {
        return referralLink;
    }

    public void setReferralLink(String referralLink) {
        this.referralLink = referralLink;
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

    public Integer getTotalReferralsCount() {
        return totalReferralsCount;
    }

    public void setTotalReferralsCount(Integer totalReferralsCount) {
        this.totalReferralsCount = totalReferralsCount;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
