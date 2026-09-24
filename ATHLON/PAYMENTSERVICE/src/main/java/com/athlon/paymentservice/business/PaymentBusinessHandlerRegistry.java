package com.athlon.paymentservice.business;

import java.util.List;

import org.springframework.stereotype.Component;

import com.athlon.paymentservice.enums.PaymentPurpose;

@Component
public class PaymentBusinessHandlerRegistry {

    private final List<PaymentBusinessHandler> handlers;

    public PaymentBusinessHandlerRegistry(List<PaymentBusinessHandler> handlers) {
        this.handlers = handlers;
    }

    public PaymentBusinessHandler getHandler(PaymentPurpose purpose) {
        return handlers.stream()
                .filter(h -> h.supports(purpose))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No PaymentBusinessHandler registered for purpose: " + purpose));
    }
}
