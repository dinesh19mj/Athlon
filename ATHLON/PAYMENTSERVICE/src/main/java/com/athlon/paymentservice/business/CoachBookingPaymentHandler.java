package com.athlon.paymentservice.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class CoachBookingPaymentHandler implements PaymentBusinessHandler {

    private static final Logger log = LoggerFactory.getLogger(CoachBookingPaymentHandler.class);

    @Override
    public boolean supports(PaymentPurpose purpose) {
        return purpose == PaymentPurpose.COACH_BOOKING;
    }

    @Override
    public PayableDetails resolvePayable(String referenceId, String payerUserId) {
        log.info("Resolving payable details for private coach session: {}", referenceId);
        PayableDetails details = new PayableDetails();
        details.setReferenceId(referenceId);
        details.setReferenceType("COACH_BOOKING");
        details.setCurrency("INR");
        details.setDescription("Athlon Coach Private Training Session");
        details.setTitle("Coach Session Booking");
        return details;
    }

    @Override
    public void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction) {
        log.info("Payment CONFIRMED for coach session booking reference: {}. Session confirmed.", paymentOrder.getReferenceId());
    }

    @Override
    public void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund) {
        log.info("Refund CONFIRMED for coach session reference: {}.", paymentOrder.getReferenceId());
    }
}
