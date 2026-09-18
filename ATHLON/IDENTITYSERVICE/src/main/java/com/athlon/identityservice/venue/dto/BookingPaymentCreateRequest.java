package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.PaymentMethod;

import java.math.BigDecimal;

public class BookingPaymentCreateRequest {
    private BigDecimal amount;
    private PaymentMethod paymentMethod = PaymentMethod.UPI;
    private String transactionReference;
    private String notes;

    public BookingPaymentCreateRequest() {}

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
