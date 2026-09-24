package com.athlon.paymentservice.business;

import com.athlon.paymentservice.entity.PaymentOrder;
import com.athlon.paymentservice.entity.PaymentRefund;
import com.athlon.paymentservice.entity.PaymentTransaction;
import com.athlon.paymentservice.enums.PaymentPurpose;

public interface PaymentBusinessHandler {

    /**
     * Checks if this handler supports the specified business payment purpose.
     */
    boolean supports(PaymentPurpose purpose);

    /**
     * Validates that the referenced business item is valid, payable, not already completed,
     * and returns the authoritative payable details (amount, currency, payee organization).
     */
    PayableDetails resolvePayable(String referenceId, String payerUserId);

    /**
     * Callback triggered when payment capture is verified by the central ledger.
     * Completes registration, activates booking, marks invoice as paid, etc.
     */
    void onPaymentConfirmed(PaymentOrder paymentOrder, PaymentTransaction transaction);

    /**
     * Callback triggered when refund is processed.
     */
    void onRefundConfirmed(PaymentOrder paymentOrder, PaymentRefund refund);
}
