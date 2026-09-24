package com.athlon.paymentservice.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.paymentservice.dto.OrganizationPaymentConfigDTO;
import com.athlon.paymentservice.entity.OrganizationPaymentAccount;
import com.athlon.paymentservice.enums.OnboardingStatus;
import com.athlon.paymentservice.enums.PaymentMode;
import com.athlon.paymentservice.enums.RecipientType;
import com.athlon.paymentservice.repository.OrganizationPaymentAccountRepository;

@Service
public class PaymentConfigService {

    private static final Logger log = LoggerFactory.getLogger(PaymentConfigService.class);

    private final OrganizationPaymentAccountRepository accountRepository;

    public PaymentConfigService(OrganizationPaymentAccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * Get organization payment configuration (both online status and offline settings).
     */
    public OrganizationPaymentConfigDTO getPaymentConfig(UUID organizationId) {
        OrganizationPaymentAccount account = accountRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    OrganizationPaymentAccount defaultAccount = new OrganizationPaymentAccount();
                    defaultAccount.setOrganizationId(organizationId);
                    defaultAccount.setRecipientType(RecipientType.ORGANIZER);
                    defaultAccount.setDefaultPaymentMode(PaymentMode.BOTH);
                    defaultAccount.setOnboardingStatus(OnboardingStatus.NOT_STARTED);
                    defaultAccount.setPaymentsEnabled(false);
                    defaultAccount.setSettlementsEnabled(false);
                    defaultAccount.setOfflineCashAllowed(true);
                    defaultAccount.setOfflineUpiAllowed(true);
                    defaultAccount.setOfflineBankTransferAllowed(true);
                    return defaultAccount;
                });

        return mapToConfigDTO(account);
    }

    /**
     * Update organization payment configuration.
     */
    @Transactional
    public OrganizationPaymentConfigDTO updatePaymentConfig(UUID organizationId, OrganizationPaymentConfigDTO dto) {
        log.info("Updating payment config for organization: {}", organizationId);

        OrganizationPaymentAccount account = accountRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    OrganizationPaymentAccount newAcc = new OrganizationPaymentAccount();
                    newAcc.setOrganizationId(organizationId);
                    newAcc.setRecipientType(dto.getRecipientType() != null ? dto.getRecipientType() : RecipientType.ORGANIZER);
                    newAcc.setBusinessName(dto.getBusinessName() != null ? dto.getBusinessName() : "Athlon Organization");
                    return newAcc;
                });

        if (dto.getDefaultPaymentMode() != null) {
            account.setDefaultPaymentMode(dto.getDefaultPaymentMode());
        }
        if (dto.getBusinessName() != null) {
            account.setBusinessName(dto.getBusinessName());
        }
        if (dto.getRecipientType() != null) {
            account.setRecipientType(dto.getRecipientType());
        }

        // Offline details
        account.setOfflineUpiId(dto.getOfflineUpiId());
        account.setOfflineUpiQrUrl(dto.getOfflineUpiQrUrl());
        account.setOfflineAccountHolder(dto.getOfflineAccountHolder());
        account.setOfflineAccountNumber(dto.getOfflineAccountNumber());
        account.setOfflineIfscCode(dto.getOfflineIfscCode());
        account.setOfflineBankName(dto.getOfflineBankName());
        account.setOfflineInstructions(dto.getOfflineInstructions());

        if (dto.getOfflineCashAllowed() != null) {
            account.setOfflineCashAllowed(dto.getOfflineCashAllowed());
        }
        if (dto.getOfflineUpiAllowed() != null) {
            account.setOfflineUpiAllowed(dto.getOfflineUpiAllowed());
        }
        if (dto.getOfflineBankTransferAllowed() != null) {
            account.setOfflineBankTransferAllowed(dto.getOfflineBankTransferAllowed());
        }

        account.setLastSyncedAt(LocalDateTime.now());
        OrganizationPaymentAccount saved = accountRepository.save(account);
        return mapToConfigDTO(saved);
    }

    private OrganizationPaymentConfigDTO mapToConfigDTO(OrganizationPaymentAccount acc) {
        OrganizationPaymentConfigDTO dto = new OrganizationPaymentConfigDTO();
        dto.setOrganizationId(acc.getOrganizationId());
        dto.setRecipientType(acc.getRecipientType());
        dto.setBusinessName(acc.getBusinessName());
        dto.setDefaultPaymentMode(acc.getDefaultPaymentMode() != null ? acc.getDefaultPaymentMode() : PaymentMode.BOTH);

        dto.setOnlineOnboardingStatus(acc.getOnboardingStatus());
        dto.setPaymentsEnabled(Boolean.TRUE.equals(acc.getPaymentsEnabled()));
        dto.setSettlementsEnabled(Boolean.TRUE.equals(acc.getSettlementsEnabled()));
        dto.setMaskedBankAccount(acc.getMaskedBankAccount());
        dto.setBankName(acc.getBankName());

        dto.setOfflineUpiId(acc.getOfflineUpiId());
        dto.setOfflineUpiQrUrl(acc.getOfflineUpiQrUrl());
        dto.setOfflineAccountHolder(acc.getOfflineAccountHolder());
        dto.setOfflineAccountNumber(acc.getOfflineAccountNumber());
        dto.setOfflineIfscCode(acc.getOfflineIfscCode());
        dto.setOfflineBankName(acc.getOfflineBankName());
        dto.setOfflineInstructions(acc.getOfflineInstructions());
        dto.setOfflineCashAllowed(acc.getOfflineCashAllowed());
        dto.setOfflineUpiAllowed(acc.getOfflineUpiAllowed());
        dto.setOfflineBankTransferAllowed(acc.getOfflineBankTransferAllowed());
        dto.setUpdatedAt(acc.getUpdatedAt());
        return dto;
    }
}
