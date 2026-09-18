package com.athlon.identityservice.rewards.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ApplyReferralRequest {

    @NotBlank(message = "Referral code cannot be blank")
    @Size(min = 3, max = 30, message = "Referral code must be between 3 and 30 characters")
    private String referralCode;

    public ApplyReferralRequest() {
    }

    public ApplyReferralRequest(String referralCode) {
        this.referralCode = referralCode;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }
}
