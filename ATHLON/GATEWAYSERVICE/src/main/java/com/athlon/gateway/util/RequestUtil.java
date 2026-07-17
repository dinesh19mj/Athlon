package com.athlon.gateway.util;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

public class RequestUtil {

    private RequestUtil() {
        // Utility class
    }

    public static String extractBearerToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    public static String generateRequestId() {
        return UUID.randomUUID().toString();
    }
}
