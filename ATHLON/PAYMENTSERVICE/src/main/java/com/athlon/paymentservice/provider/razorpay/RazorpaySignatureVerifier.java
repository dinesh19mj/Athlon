package com.athlon.paymentservice.provider.razorpay;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.athlon.paymentservice.config.RazorpayConfig;

@Component
public class RazorpaySignatureVerifier {

    private static final Logger log = LoggerFactory.getLogger(RazorpaySignatureVerifier.class);
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final RazorpayConfig razorpayConfig;

    public RazorpaySignatureVerifier(RazorpayConfig razorpayConfig) {
        this.razorpayConfig = razorpayConfig;
    }

    /**
     * Verify payment signature returned from client checkout.
     * signature = HMAC_SHA256(orderId + "|" + paymentId, keySecret)
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        try {
            String data = orderId + "|" + paymentId;
            String calculatedSignature = calculateHmacSha256(data, razorpayConfig.getKeySecret());
            return MessageDigest.isEqual(
                calculatedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify payment signature for orderId: {}", orderId, e);
            return false;
        }
    }

    /**
     * Verify webhook signature from Razorpay.
     * signature = HMAC_SHA256(payloadBody, webhookSecret)
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (payload == null || signature == null) {
            return false;
        }
        try {
            String calculatedSignature = calculateHmacSha256(payload, razorpayConfig.getWebhookSecret());
            return MessageDigest.isEqual(
                calculatedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("Failed to verify webhook signature", e);
            return false;
        }
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
