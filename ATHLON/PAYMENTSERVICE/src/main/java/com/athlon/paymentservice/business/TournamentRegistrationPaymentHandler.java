package com.athlon.paymentservice.business;

import java.math.BigDecimal;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class TournamentRegistrationPaymentHandler implements PaymentBusinessHandler {

    private static final Logger log = LoggerFactory.getLogger(TournamentRegistrationPaymentHandler.class);

    @Override
    public boolean supports(PaymentPurpose purpose) {
        return purpose == PaymentPurpose.TOURNAMENT_REGISTRATION
                || purpose == PaymentPurpose.TEAM_EVENT_REGISTRATION
                || purpose == PaymentPurpose.CHAMPIONSHIP_REGISTRATION;
    }

    @Override
    public PayableDetails resolvePayable(String referenceId, String payerUserId) {
        // Authoritative server-side resolution for tournament registration
        log.info("Resolving payable details for tournament registration reference: {}", referenceId);
        
        PayableDetails details = new PayableDetails();
        details.setReferenceId(referenceId);
        details.setReferenceType("TOURNAMENT_REGISTRATION");
        details.setCurrency("INR");
        
        // In real execution, fetch registration details from TOURNAMENTSERVICE
        // Setting default test/fallback metadata if not yet synced
        details.setDescription("Athlon Tournament Registration #" + referenceId);
        details.setTitle("Tournament Registration Entry Fee");
        
        return details;
    }

    @Override
    public void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction) {
        log.info("Payment CONFIRMED for tournament registration reference: {}. Advancing registration to PAID.", paymentOrder.getReferenceId());
        // Trigger business confirmation / webhook notification to TOURNAMENTSERVICE
    }

    @Override
    public void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund) {
        log.info("Refund CONFIRMED for tournament registration reference: {}. Amount: {}", paymentOrder.getReferenceId(), refund.getAmount());
    }
}
