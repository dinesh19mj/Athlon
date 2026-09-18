package com.athlon.identityservice.rewards.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.identityservice.rewards.enums.ReferralStatus;

public class UserReferralResponse {

    private UUID referralUuid;
    private Long refereeUserId;
    private UUID refereeUserUuid;
    private String refereeName;
    private String refereePhone;
    private String referralCode;
    private ReferralStatus status;
    private Integer creditsAwarded;
    private LocalDateTime completedAt;

    public UserReferralResponse() {
    }

    public UUID getReferralUuid() {
        return referralUuid;
    }

    public void setReferralUuid(UUID referralUuid) {
        this.referralUuid = referralUuid;
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

    public String getRefereeName() {
        return refereeName;
    }

    public void setRefereeName(String refereeName) {
        this.refereeName = refereeName;
    }

    public String getRefereePhone() {
        return refereePhone;
    }

    public void setRefereePhone(String refereePhone) {
        this.refereePhone = refereePhone;
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

    public Integer getCreditsAwarded() {
        return creditsAwarded;
    }

    public void setCreditsAwarded(Integer creditsAwarded) {
        this.creditsAwarded = creditsAwarded;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
