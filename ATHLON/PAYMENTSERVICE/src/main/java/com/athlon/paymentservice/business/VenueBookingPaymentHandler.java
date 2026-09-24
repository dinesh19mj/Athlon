package com.athlon.paymentservice.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class VenueBookingPaymentHandler implements PaymentBusinessHandler {

    private static final Logger log = LoggerFactory.getLogger(VenueBookingPaymentHandler.class);

    @Override
    public boolean supports(PaymentPurpose purpose) {
        return purpose == PaymentPurpose.VENUE_BOOKING;
    }

    @Override
    public PayableDetails resolvePayable(String referenceId, String payerUserId) {
        log.info("Resolving payable details for venue booking: {}", referenceId);
        PayableDetails details = new PayableDetails();
        details.setReferenceId(referenceId);
        details.setReferenceType("VENUE_BOOKING");
        details.setCurrency("INR");
        details.setDescription("Athlon Venue Court/Turf Booking Reservation");
        details.setTitle("Court Booking");
        return details;
    }

    @Override
    public void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction) {
        log.info("Payment CONFIRMED for venue booking reference: {}. Confirming slot hold.", paymentOrder.getReferenceId());
    }

    @Override
    public void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund) {
        log.info("Refund CONFIRMED for venue booking reference: {}.", paymentOrder.getReferenceId());
    }
}
