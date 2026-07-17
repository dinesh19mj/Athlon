package com.athlon.authservice.util;

import java.util.UUID;

public class TokenGenerator {
    public static String generateUniqueToken() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }
}
