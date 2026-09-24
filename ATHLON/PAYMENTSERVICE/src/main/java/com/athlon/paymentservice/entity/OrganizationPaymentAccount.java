package com.athlon.paymentservice.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.paymentservice.enums.OnboardingStatus;
import com.athlon.paymentservice.enums.PaymentMode;
import com.athlon.paymentservice.enums.RecipientType;

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
@Table(name = "organization_payment_account")
public class OrganizationPaymentAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, unique = true)
    private UUID organizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_type", nullable = false, length = 32)
    private RecipientType recipientType;

    @Enumerated(EnumType.STRING)
    @Column(name = "default_payment_mode", nullable = false, length = 32)
    private PaymentMode defaultPaymentMode = PaymentMode.BOTH;

    // --- Razorpay / Online Gateway Details ---
    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "RAZORPAY";

    @Column(name = "provider_account_id", length = 64, unique = true)
    private String providerAccountId; // e.g. acc_xxxx

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_status", nullable = false, length = 32)
    private OnboardingStatus onboardingStatus = OnboardingStatus.NOT_STARTED;

    @Column(name = "provider_status", length = 64)
    private String providerStatus;

    @Column(name = "payments_enabled", nullable = false)
    private Boolean paymentsEnabled = false;

    @Column(name = "settlements_enabled", nullable = false)
    private Boolean settlementsEnabled = false;

    @Column(name = "business_name", length = 255)
    private String businessName;

    @Column(name = "contact_email", length = 128)
    private String contactEmail;

    @Column(name = "contact_phone", length = 32)
    private String contactPhone;

    @Column(name = "masked_bank_account", length = 32)
    private String maskedBankAccount;

    @Column(name = "bank_name", length = 128)
    private String bankName;

    @Column(name = "ifsc_code", length = 32)
    private String ifscCode;

    // --- Offline Payment Details ---
    @Column(name = "offline_upi_id", length = 128)
    private String offlineUpiId;

    @Column(name = "offline_upi_qr_url", length = 512)
    private String offlineUpiQrUrl;

    @Column(name = "offline_account_holder", length = 128)
    private String offlineAccountHolder;

    @Column(name = "offline_account_number", length = 64)
    private String offlineAccountNumber;

    @Column(name = "offline_ifsc_code", length = 32)
    private String offlineIfscCode;

    @Column(name = "offline_bank_name", length = 128)
    private String offlineBankName;

    @Column(name = "offline_instructions", columnDefinition = "TEXT")
    private String offlineInstructions;

    @Column(name = "offline_cash_allowed", nullable = false)
    private Boolean offlineCashAllowed = true;

    @Column(name = "offline_upi_allowed", nullable = false)
    private Boolean offlineUpiAllowed = true;

    @Column(name = "offline_bank_transfer_allowed", nullable = false)
    private Boolean offlineBankTransferAllowed = true;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OrganizationPaymentAccount() {
    }

    public OrganizationPaymentAccount(UUID organizationId, RecipientType recipientType, String businessName) {
        this.organizationId = organizationId;
        this.recipientType = recipientType;
        this.businessName = businessName;
        this.onboardingStatus = OnboardingStatus.NOT_STARTED;
        this.defaultPaymentMode = PaymentMode.BOTH;
        this.paymentsEnabled = false;
        this.settlementsEnabled = false;
        this.offlineCashAllowed = true;
        this.offlineUpiAllowed = true;
        this.offlineBankTransferAllowed = true;
    }

    @PrePersist
    public void prePersist() {
        if (this.onboardingStatus == null) {
            this.onboardingStatus = OnboardingStatus.NOT_STARTED;
        }
        if (this.defaultPaymentMode == null) {
            this.defaultPaymentMode = PaymentMode.BOTH;
        }
        if (this.paymentsEnabled == null) {
            this.paymentsEnabled = false;
        }
        if (this.settlementsEnabled == null) {
            this.settlementsEnabled = false;
        }
        if (this.provider == null) {
            this.provider = "RAZORPAY";
        }
        if (this.offlineCashAllowed == null) {
            this.offlineCashAllowed = true;
        }
        if (this.offlineUpiAllowed == null) {
            this.offlineUpiAllowed = true;
        }
        if (this.offlineBankTransferAllowed == null) {
            this.offlineBankTransferAllowed = true;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public PaymentMode getDefaultPaymentMode() {
        return defaultPaymentMode;
    }

    public void setDefaultPaymentMode(PaymentMode defaultPaymentMode) {
        this.defaultPaymentMode = defaultPaymentMode;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderAccountId() {
        return providerAccountId;
    }

    public void setProviderAccountId(String providerAccountId) {
        this.providerAccountId = providerAccountId;
    }

    public OnboardingStatus getOnboardingStatus() {
        return onboardingStatus;
    }

    public void setOnboardingStatus(OnboardingStatus onboardingStatus) {
        this.onboardingStatus = onboardingStatus;
    }

    public String getProviderStatus() {
        return providerStatus;
    }

    public void setProviderStatus(String providerStatus) {
        this.providerStatus = providerStatus;
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

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
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

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
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

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
