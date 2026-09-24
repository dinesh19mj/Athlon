package com.athlon.paymentservice.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class ClubMembershipPaymentHandler implements PaymentBusinessHandler {

    private static final Logger log = LoggerFactory.getLogger(ClubMembershipPaymentHandler.class);

    @Override
    public boolean supports(PaymentPurpose purpose) {
        return purpose == PaymentPurpose.CLUB_MEMBERSHIP;
    }

    @Override
    public PayableDetails resolvePayable(String referenceId, String payerUserId) {
        log.info("Resolving payable details for club membership: {}", referenceId);
        PayableDetails details = new PayableDetails();
        details.setReferenceId(referenceId);
        details.setReferenceType("CLUB_MEMBERSHIP");
        details.setCurrency("INR");
        details.setDescription("Athlon Sports Club Membership Subscription");
        details.setTitle("Club Membership");
        return details;
    }

    @Override
    public void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction) {
        log.info("Payment CONFIRMED for club membership reference: {}. Membership activated.", paymentOrder.getReferenceId());
    }

    @Override
    public void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund) {
        log.info("Refund CONFIRMED for club membership reference: {}.", paymentOrder.getReferenceId());
    }
}
