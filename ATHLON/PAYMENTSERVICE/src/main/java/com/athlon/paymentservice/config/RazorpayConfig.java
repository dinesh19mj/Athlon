package com.athlon.paymentservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id:rzp_test_AthlonTestKey}")
    private String keyId;

    @Value("${razorpay.key.secret:AthlonTestSecret2026}")
    private String keySecret;

    @Value("${razorpay.webhook.secret:AthlonWebhookSecret2026}")
    private String webhookSecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            return new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to initialize RazorpayClient: " + e.getMessage(), e);
        }
    }

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
