package com.athlon.paymentservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.paymentservice.enums.OnboardingStatus;
import com.athlon.paymentservice.enums.RecipientType;

public class OnboardingStatusResponse {

    private UUID organizationId;
    private RecipientType recipientType;
    private OnboardingStatus onboardingStatus;
    private String providerAccountId; // acc_xxxx
    private boolean paymentsEnabled;
    private boolean settlementsEnabled;
    private String businessName;
    private String maskedBankAccount;
    private String bankName;
    private LocalDateTime lastSyncedAt;

    public OnboardingStatusResponse() {
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public RecipientType getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(RecipientType recipientType) {
        this.recipientType = recipientType;
    }

    public OnboardingStatus getOnboardingStatus() {
        return onboardingStatus;
    }

    public void setOnboardingStatus(OnboardingStatus onboardingStatus) {
        this.onboardingStatus = onboardingStatus;
    }

    public String getProviderAccountId() {
        return providerAccountId;
    }

    public void setProviderAccountId(String providerAccountId) {
        this.providerAccountId = providerAccountId;
    }

    public boolean isPaymentsEnabled() {
        return paymentsEnabled;
    }

    public void setPaymentsEnabled(boolean paymentsEnabled) {
        this.paymentsEnabled = paymentsEnabled;
    }

    public boolean isSettlementsEnabled() {
        return settlementsEnabled;
    }

    public void setSettlementsEnabled(boolean settlementsEnabled) {
        this.settlementsEnabled = settlementsEnabled;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getMaskedBankAccount() {
        return maskedBankAccount;
    }

    public void setMaskedBankAccount(String maskedBankAccount) {
        this.maskedBankAccount = maskedBankAccount;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }
}
