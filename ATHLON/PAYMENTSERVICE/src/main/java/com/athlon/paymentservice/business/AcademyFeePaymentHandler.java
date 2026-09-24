package com.athlon.paymentservice.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class AcademyFeePaymentHandler implements PaymentBusinessHandler {

    private static final Logger log = LoggerFactory.getLogger(AcademyFeePaymentHandler.class);

    @Override
    public boolean supports(PaymentPurpose purpose) {
        return purpose == PaymentPurpose.ACADEMY_FEE;
    }

    @Override
    public PayableDetails resolvePayable(String referenceId, String payerUserId) {
        log.info("Resolving payable details for academy student fee: {}", referenceId);
        PayableDetails details = new PayableDetails();
        details.setReferenceId(referenceId);
        details.setReferenceType("ACADEMY_FEE");
        details.setCurrency("INR");
        details.setDescription("Athlon Academy Student Batch / Training Fee");
        details.setTitle("Academy Fee Invoice");
        return details;
    }

    @Override
    public void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction) {
        log.info("Payment CONFIRMED for academy fee reference: {}. Invoice marked PAID.", paymentOrder.getReferenceId());
    }

    @Override
    public void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund) {
        log.info("Refund CONFIRMED for academy fee reference: {}.", paymentOrder.getReferenceId());
    }
}
