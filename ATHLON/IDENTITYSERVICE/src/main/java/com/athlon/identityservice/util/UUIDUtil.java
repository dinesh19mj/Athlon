package com.athlon.identityservice.util;

import java.util.UUID;

public class UUIDUtil {

    private UUIDUtil() {
        // Private constructor to prevent instantiation
    }

    public static UUID fromString(String uuidStr) {
        if (uuidStr == null || uuidStr.trim().isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    public static boolean isValidUUID(String uuidStr) {
        return fromString(uuidStr) != null;
    }
}
