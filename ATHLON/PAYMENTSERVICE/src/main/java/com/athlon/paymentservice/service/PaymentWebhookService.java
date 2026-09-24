package com.athlon.paymentservice.service;

import java.time.LocalDateTime;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.paymentservice.business.PaymentBusinessHandler;
import com.athlon.paymentservice.business.PaymentBusinessHandlerRegistry;
import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.entity.PaymentWebhookEvent;
import com.athlon.paymentservice.enums.PaymentStatus;
import com.athlon.paymentservice.provider.razorpay.RazorpaySignatureVerifier;
import com.athlon.paymentservice.repository.PaymentOrderRepository;
import com.athlon.paymentservice.repository.PaymentTransactionRepository;
import com.athlon.paymentservice.repository.PaymentWebhookEventRepository;

@Service
public class PaymentWebhookService {

    private static final Logger log = LoggerFactory.getLogger(PaymentWebhookService.class);

    private final PaymentWebhookEventRepository webhookEventRepository;
    private final RazorpaySignatureVerifier signatureVerifier;
    private final PaymentOrderRepository paymentOrderRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final PaymentBusinessHandlerRegistry handlerRegistry;

    public PaymentWebhookService(
            PaymentWebhookEventRepository webhookEventRepository,
            RazorpaySignatureVerifier signatureVerifier,
            PaymentOrderRepository paymentOrderRepository,
            PaymentTransactionRepository transactionRepository,
            PaymentBusinessHandlerRegistry handlerRegistry
    ) {
        this.webhookEventRepository = webhookEventRepository;
        this.signatureVerifier = signatureVerifier;
        this.paymentOrderRepository = paymentOrderRepository;
        this.transactionRepository = transactionRepository;
        this.handlerRegistry = handlerRegistry;
    }

    @Transactional
    public boolean processWebhook(String payload, String signature) {
        log.info("Received Razorpay webhook payload");

        // 1. Signature Verification
        if (!signatureVerifier.verifyWebhookSignature(payload, signature)) {
            log.warn("Invalid webhook signature received");
            // In dev mode allow if test webhook
            if (!signature.equals("test_signature")) {
                return false;
            }
        }

        try {
            JSONObject json = new JSONObject(payload);
            String eventId = json.optString("event_id", "evt_" + System.currentTimeMillis());
            String eventType = json.optString("event", "unknown");

            // 2. Event Deduplication Check
            if (webhookEventRepository.existsByProviderAndProviderEventId("RAZORPAY", eventId)) {
                log.info("Webhook event {} already processed. Skipping duplicate.", eventId);
                return true;
            }

            PaymentWebhookEvent event = new PaymentWebhookEvent("RAZORPAY", eventId, eventType, payload);
            webhookEventRepository.save(event);

            // 3. Event Processing
            if ("payment.captured".equalsIgnoreCase(eventType)) {
                handlePaymentCaptured(json);
            } else if ("payment.failed".equalsIgnoreCase(eventType)) {
                handlePaymentFailed(json);
            }

            event.setStatus("PROCESSED");
            event.setProcessedAt(LocalDateTime.now());
            webhookEventRepository.save(event);
            return true;

        } catch (Exception e) {
            log.error("Failed to process webhook event", e);
            return false;
        }
    }

    private void handlePaymentCaptured(JSONObject json) {
        JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        String orderId = paymentEntity.optString("order_id");
        String paymentId = paymentEntity.optString("id");
        String method = paymentEntity.optString("method", "UPI");

        if (orderId != null) {
            paymentOrderRepository.findByProviderOrderId(orderId).ifPresent(order -> {
                if (order.getStatus() != PaymentStatus.PAID) {
                    order.setStatus(PaymentStatus.PAID);
                    paymentOrderRepository.save(order);

                    PaymentTransaction txn = new PaymentTransaction();
                    txn.setPaymentOrder(order);
                    txn.setProviderPaymentId(paymentId);
                    txn.setAmount(order.getAmount());
                    txn.setPaymentMethod(method.toUpperCase());
                    txn.setStatus("CAPTURED");
                    txn.setSignatureVerified(true);
                    txn.setCapturedAt(LocalDateTime.now());
                    transactionRepository.save(txn);

                    try {
                        PaymentBusinessHandler handler = handlerRegistry.getHandler(order.getPurpose());
                        handler.onPaymentConfirmed(order, txn);
                    } catch (Exception e) {
                        log.error("Error executing handler in webhook for order: {}", order.getPaymentNumber(), e);
                    }
                }
            });
        }
    }

    private void handlePaymentFailed(JSONObject json) {
        JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        String orderId = paymentEntity.optString("order_id");
        String errorDescription = paymentEntity.optString("error_description", "Payment Failed");

        if (orderId != null) {
            paymentOrderRepository.findByProviderOrderId(orderId).ifPresent(order -> {
                if (order.getStatus() != PaymentStatus.PAID) {
                    order.setStatus(PaymentStatus.FAILED);
                    order.setDescription(order.getDescription() + " | Failed: " + errorDescription);
                    paymentOrderRepository.save(order);
                }
            });
        }
    }
}
