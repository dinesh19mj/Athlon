package com.athlon.paymentservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.paymentservice.enums.OnboardingStatus;
import com.athlon.paymentservice.enums.PaymentMode;
import com.athlon.paymentservice.enums.RecipientType;

public class OrganizationPaymentConfigDTO {

    private UUID organizationId;
    private RecipientType recipientType;
    private String businessName;
    private PaymentMode defaultPaymentMode;

    // Online Razorpay details
    private OnboardingStatus onlineOnboardingStatus;
    private Boolean paymentsEnabled;
    private Boolean settlementsEnabled;
    private String maskedBankAccount;
    private String bankName;

    // Offline details
    private String offlineUpiId;
    private String offlineUpiQrUrl;
    private String offlineAccountHolder;
    private String offlineAccountNumber;
    private String offlineIfscCode;
    private String offlineBankName;
    private String offlineInstructions;
    private Boolean offlineCashAllowed;
    private Boolean offlineUpiAllowed;
    private Boolean offlineBankTransferAllowed;

    private LocalDateTime updatedAt;

    public OrganizationPaymentConfigDTO() {
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

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public PaymentMode getDefaultPaymentMode() {
        return defaultPaymentMode;
    }

    public void setDefaultPaymentMode(PaymentMode defaultPaymentMode) {
        this.defaultPaymentMode = defaultPaymentMode;
    }

    public OnboardingStatus getOnlineOnboardingStatus() {
        return onlineOnboardingStatus;
    }

    public void setOnlineOnboardingStatus(OnboardingStatus onlineOnboardingStatus) {
        this.onlineOnboardingStatus = onlineOnboardingStatus;
    }

    public Boolean getPaymentsEnabled() {
        return paymentsEnabled;
    }

    public void setPaymentsEnabled(Boolean paymentsEnabled) {
        this.paymentsEnabled = paymentsEnabled;
    }

    public Boolean getSettlementsEnabled() {
        return settlementsEnabled;
    }

    public void setSettlementsEnabled(Boolean settlementsEnabled) {
        this.settlementsEnabled = settlementsEnabled;
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

    public String getOfflineUpiId() {
        return offlineUpiId;
    }

    public void setOfflineUpiId(String offlineUpiId) {
        this.offlineUpiId = offlineUpiId;
    }

    public String getOfflineUpiQrUrl() {
        return offlineUpiQrUrl;
    }

    public void setOfflineUpiQrUrl(String offlineUpiQrUrl) {
        this.offlineUpiQrUrl = offlineUpiQrUrl;
    }

    public String getOfflineAccountHolder() {
        return offlineAccountHolder;
    }

    public void setOfflineAccountHolder(String offlineAccountHolder) {
        this.offlineAccountHolder = offlineAccountHolder;
    }

    public String getOfflineAccountNumber() {
        return offlineAccountNumber;
    }

    public void setOfflineAccountNumber(String offlineAccountNumber) {
        this.offlineAccountNumber = offlineAccountNumber;
    }

    public String getOfflineIfscCode() {
        return offlineIfscCode;
    }

    public void setOfflineIfscCode(String offlineIfscCode) {
        this.offlineIfscCode = offlineIfscCode;
    }

    public String getOfflineBankName() {
        return offlineBankName;
    }

    public void setOfflineBankName(String offlineBankName) {
        this.offlineBankName = offlineBankName;
    }

    public String getOfflineInstructions() {
        return offlineInstructions;
    }

    public void setOfflineInstructions(String offlineInstructions) {
        this.offlineInstructions = offlineInstructions;
    }

    public Boolean getOfflineCashAllowed() {
        return offlineCashAllowed;
    }

    public void setOfflineCashAllowed(Boolean offlineCashAllowed) {
        this.offlineCashAllowed = offlineCashAllowed;
    }

    public Boolean getOfflineUpiAllowed() {
        return offlineUpiAllowed;
    }

    public void setOfflineUpiAllowed(Boolean offlineUpiAllowed) {
        this.offlineUpiAllowed = offlineUpiAllowed;
    }

    public Boolean getOfflineBankTransferAllowed() {
        return offlineBankTransferAllowed;
    }

    public void setOfflineBankTransferAllowed(Boolean offlineBankTransferAllowed) {
        this.offlineBankTransferAllowed = offlineBankTransferAllowed;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
