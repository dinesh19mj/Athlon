package com.athlon.paymentservice.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.paymentservice.dto.OnboardingStatusResponse;
import com.athlon.paymentservice.entity.OrganizationPaymentAccount;
import com.athlon.paymentservice.enums.OnboardingStatus;
import com.athlon.paymentservice.enums.RecipientType;
import com.athlon.paymentservice.provider.razorpay.RazorpayRouteClient;
import com.athlon.paymentservice.repository.OrganizationPaymentAccountRepository;

@Service
public class PaymentOnboardingService {

    private static final Logger log = LoggerFactory.getLogger(PaymentOnboardingService.class);

    private final OrganizationPaymentAccountRepository accountRepository;
    private final RazorpayRouteClient routeClient;

    public PaymentOnboardingService(
            OrganizationPaymentAccountRepository accountRepository,
            RazorpayRouteClient routeClient
    ) {
        this.accountRepository = accountRepository;
        this.routeClient = routeClient;
    }

    /**
     * Start/continue idempotent self-service onboarding for an organization.
     */
    @Transactional
    public OnboardingStatusResponse startOnboarding(UUID organizationId, RecipientType recipientType, String businessName, String email, String phone) {
        log.info("Starting / Continuing payment onboarding for organization: {}", organizationId);

        OrganizationPaymentAccount account = accountRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    OrganizationPaymentAccount newAccount = new OrganizationPaymentAccount();
                    newAccount.setOrganizationId(organizationId);
                    newAccount.setRecipientType(recipientType != null ? recipientType : RecipientType.ORGANIZER);
                    newAccount.setBusinessName(businessName != null ? businessName : "Athlon Organization");
                    newAccount.setOnboardingStatus(OnboardingStatus.NOT_STARTED);
                    return accountRepository.save(newAccount);
                });

        // If not yet ACTIVE, trigger route onboarding client
        if (account.getOnboardingStatus() != OnboardingStatus.ACTIVE || account.getProviderAccountId() == null) {
            account = routeClient.createLinkedAccount(account, businessName, email, phone);
            account.setLastSyncedAt(LocalDateTime.now());
            account = accountRepository.save(account);
        }

        return mapToResponse(account);
    }

    /**
     * Get current onboarding status.
     */
    public OnboardingStatusResponse getOnboardingStatus(UUID organizationId) {
        OrganizationPaymentAccount account = accountRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    OrganizationPaymentAccount unconfigured = new OrganizationPaymentAccount();
                    unconfigured.setOrganizationId(organizationId);
                    unconfigured.setRecipientType(RecipientType.ORGANIZER);
                    unconfigured.setOnboardingStatus(OnboardingStatus.NOT_STARTED);
                    unconfigured.setPaymentsEnabled(false);
                    unconfigured.setSettlementsEnabled(false);
                    return unconfigured;
                });

        return mapToResponse(account);
    }

    /**
     * Toggle online payments enablement for an active organization.
     */
    @Transactional
    public OnboardingStatusResponse togglePaymentsEnabled(UUID organizationId, boolean enabled) {
        OrganizationPaymentAccount account = accountRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization payment account not found for ID: " + organizationId));

        account.setPaymentsEnabled(enabled);
        account.setLastSyncedAt(LocalDateTime.now());
        OrganizationPaymentAccount saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    private OnboardingStatusResponse mapToResponse(OrganizationPaymentAccount acc) {
        OnboardingStatusResponse res = new OnboardingStatusResponse();
        res.setOrganizationId(acc.getOrganizationId());
        res.setRecipientType(acc.getRecipientType());
        res.setOnboardingStatus(acc.getOnboardingStatus());
        res.setProviderAccountId(acc.getProviderAccountId());
        res.setPaymentsEnabled(Boolean.TRUE.equals(acc.getPaymentsEnabled()));
        res.setSettlementsEnabled(Boolean.TRUE.equals(acc.getSettlementsEnabled()));
        res.setBusinessName(acc.getBusinessName());
        res.setMaskedBankAccount(acc.getMaskedBankAccount());
        res.setBankName(acc.getBankName());
        res.setLastSyncedAt(acc.getLastSyncedAt());
        return res;
    }
}
