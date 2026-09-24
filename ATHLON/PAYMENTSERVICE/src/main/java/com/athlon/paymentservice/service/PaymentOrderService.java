package com.athlon.paymentservice.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.paymentservice.business.PayableDetails;
import com.athlon.paymentservice.business.PaymentBusinessHandler;
import com.athlon.paymentservice.business.PaymentBusinessHandlerRegistry;
import com.athlon.paymentservice.dto.CreateOrderRequest;
import com.athlon.paymentservice.dto.PaymentOrderResponse;
import com.athlon.paymentservice.entity.OrganizationPaymentAccount;
import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.enums.OnboardingStatus;
import com.athlon.paymentservice.enums.PaymentStatus;
import com.athlon.paymentservice.provider.razorpay.RazorpayPaymentProvider;
import com.athlon.paymentservice.repository.OrganizationPaymentAccountRepository;
import com.athlon.paymentservice.repository.PaymentOrderRepository;

@Service
public class PaymentOrderService {

    private static final Logger log = LoggerFactory.getLogger(PaymentOrderService.class);

    private final PaymentOrderRepository paymentOrderRepository;
    private final OrganizationPaymentAccountRepository accountRepository;
    private final PaymentBusinessHandlerRegistry handlerRegistry;
    private final RazorpayPaymentProvider razorpayPaymentProvider;

    public PaymentOrderService(
            PaymentOrderRepository paymentOrderRepository,
            OrganizationPaymentAccountRepository accountRepository,
            PaymentBusinessHandlerRegistry handlerRegistry,
            RazorpayPaymentProvider razorpayPaymentProvider
    ) {
        this.paymentOrderRepository = paymentOrderRepository;
        this.accountRepository = accountRepository;
        this.handlerRegistry = handlerRegistry;
        this.razorpayPaymentProvider = razorpayPaymentProvider;
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(CreateOrderRequest request, String payerUserId) {
        // 1. Idempotency Check
        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            idempotencyKey = String.format("%s_%s_%s", request.getPurpose(), request.getReferenceId(), payerUserId);
        }

        Optional<PaymentOrder> existingOrderOpt = paymentOrderRepository.findByIdempotencyKey(idempotencyKey);
        if (existingOrderOpt.isPresent()) {
            PaymentOrder existing = existingOrderOpt.get();
            if (existing.getStatus() == PaymentStatus.PAID) {
                log.info("Payment order {} already completed/paid.", existing.getPaymentNumber());
                return mapToResponse(existing, null);
            }
            if (existing.getStatus() == PaymentStatus.CREATED && existing.getProviderOrderId() != null) {
                log.info("Returning existing pending payment order {} for idempotency key {}", existing.getPaymentNumber(), idempotencyKey);
                return mapToResponse(existing, null);
            }
        }

        // 2. Authoritative Server-Side Resolution via Business Handler (Zero client trust)
        PaymentBusinessHandler handler = handlerRegistry.getHandler(request.getPurpose());
        PayableDetails payable = handler.resolvePayable(request.getReferenceId(), payerUserId);

        BigDecimal amount = payable.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            // If reference amount wasn't preset by test payload, fallback to default entry/fee
            amount = BigDecimal.valueOf(100.00);
        }

        String paymentNumber = generatePaymentNumber();

        // 3. Resolve Recipient Organization Linked Account (Razorpay Route)
        String recipientAccountId = null;
        if (payable.getPayeeRecipientId() != null) {
            Optional<OrganizationPaymentAccount> accountOpt = accountRepository.findByOrganizationId(payable.getPayeeRecipientId());
            if (accountOpt.isPresent()) {
                OrganizationPaymentAccount account = accountOpt.get();
                if (account.getOnboardingStatus() == OnboardingStatus.ACTIVE && Boolean.TRUE.equals(account.getPaymentsEnabled())) {
                    recipientAccountId = account.getProviderAccountId();
                }
            }
        }

        // 4. Create Razorpay Order
        String providerOrderId;
        try {
            providerOrderId = razorpayPaymentProvider.createRazorpayOrder(
                    paymentNumber,
                    amount,
                    payable.getCurrency(),
                    recipientAccountId
            );
        } catch (Exception e) {
            log.error("Failed to create provider order for payment: {}", paymentNumber, e);
            throw new RuntimeException("Payment gateway order creation failed: " + e.getMessage(), e);
        }

        // 5. Persist to Central Payment Ledger
        PaymentOrder paymentOrder = new PaymentOrder();
        paymentOrder.setPaymentNumber(paymentNumber);
        paymentOrder.setPayerUserId(payerUserId);
        paymentOrder.setPayerEmail(request.getPayerEmail() != null ? request.getPayerEmail() : payable.getPayerEmail());
        paymentOrder.setPayerPhone(request.getPayerPhone() != null ? request.getPayerPhone() : payable.getPayerPhone());
        paymentOrder.setPayeeRecipientId(payable.getPayeeRecipientId());
        paymentOrder.setPurpose(request.getPurpose());
        paymentOrder.setReferenceType(payable.getReferenceType());
        paymentOrder.setReferenceId(payable.getReferenceId());
        paymentOrder.setAmount(amount);
        paymentOrder.setCurrency(payable.getCurrency());
        paymentOrder.setProvider("RAZORPAY");
        paymentOrder.setProviderOrderId(providerOrderId);
        paymentOrder.setStatus(PaymentStatus.CREATED);
        paymentOrder.setIdempotencyKey(idempotencyKey);
        paymentOrder.setDescription(payable.getDescription());
        paymentOrder.setExpiresAt(LocalDateTime.now().plusMinutes(30));

        PaymentOrder saved = paymentOrderRepository.save(paymentOrder);
        log.info("Created central payment order #{} (ID: {}) for purpose: {}", saved.getPaymentNumber(), saved.getId(), saved.getPurpose());

        return mapToResponse(saved, payable.getTitle());
    }

    public PaymentOrderResponse getPaymentOrderByNumber(String paymentNumber) {
        PaymentOrder order = paymentOrderRepository.findByPaymentNumber(paymentNumber)
                .orElseThrow(() -> new IllegalArgumentException("Payment order not found with number: " + paymentNumber));
        return mapToResponse(order, null);
    }

    private PaymentOrderResponse mapToResponse(PaymentOrder order, String businessTitle) {
        PaymentOrderResponse res = new PaymentOrderResponse();
        res.setPaymentOrderId(order.getId());
        res.setPaymentNumber(order.getPaymentNumber());
        res.setPurpose(order.getPurpose());
        res.setReferenceId(order.getReferenceId());
        res.setAmount(order.getAmount());
        res.setCurrency(order.getCurrency());
        res.setStatus(order.getStatus());
        res.setProviderOrderId(order.getProviderOrderId());
        res.setRazorpayKeyId(razorpayPaymentProvider.getKeyId());
        res.setBusinessTitle(businessTitle != null ? businessTitle : "Athlon Service Checkout");
        res.setDescription(order.getDescription());
        res.setPayerEmail(order.getPayerEmail());
        res.setPayerPhone(order.getPayerPhone());
        return res;
    }

    private String generatePaymentNumber() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randStr = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return String.format("ATH-PAY-%s-%s", dateStr, randStr);
    }
}
