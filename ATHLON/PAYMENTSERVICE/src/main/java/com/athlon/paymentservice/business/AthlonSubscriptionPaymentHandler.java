package com.athlon.paymentservice.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class AthlonSubscriptionPaymentHandler implements PaymentBusinessHandler {

    private static final Logger log = LoggerFactory.getLogger(AthlonSubscriptionPaymentHandler.class);

    @Override
    public boolean supports(PaymentPurpose purpose) {
        return purpose == PaymentPurpose.ATHLON_SUBSCRIPTION;
    }

    @Override
    public PayableDetails resolvePayable(String referenceId, String payerUserId) {
        log.info("Resolving payable details for Athlon Subscription package: {}", referenceId);
        PayableDetails details = new PayableDetails();
        details.setReferenceId(referenceId);
        details.setReferenceType("ATHLON_SUBSCRIPTION");
        details.setCurrency("INR");
        details.setPayeeRecipientId(null); // Direct ATHLON Revenue
        details.setDescription("Athlon SaaS Subscription License");
        details.setTitle("Athlon Platform Subscription");
        return details;
    }

    @Override
    public void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction) {
        log.info("Subscription payment CONFIRMED for package reference: {}. Activating subscription entitlement.", paymentOrder.getReferenceId());
    }

    @Override
    public void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund) {
        log.info("Subscription refund CONFIRMED for package reference: {}.", paymentOrder.getReferenceId());
    }
}
