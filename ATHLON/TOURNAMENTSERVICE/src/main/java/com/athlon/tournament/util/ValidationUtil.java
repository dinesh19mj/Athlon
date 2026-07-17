package com.athlon.tournament.util;

import com.athlon.tournament.exception.ValidationException;
import java.util.regex.Pattern;

public class ValidationUtil {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9. ()-]{7,25}$");

    private ValidationUtil() {
        // Private constructor to prevent instantiation
    }

    public static void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Invalid email format");
        }
    }

    public static void validatePhone(String phone) {
        if (phone != null && !phone.trim().isEmpty() && !PHONE_PATTERN.matcher(phone).matches()) {
            throw new ValidationException("Invalid phone format");
        }
    }

    public static void validateName(String name, String fieldName) {
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException(fieldName + " cannot be empty");
        }
    }

    public static void validateRequired(Object value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " is required");
        }
    }
    
    public static void validateUUID(String uuidStr, String fieldName) {
        if (uuidStr == null || !UUIDUtil.isValidUUID(uuidStr)) {
            throw new ValidationException(fieldName + " must be a valid UUID");
        }
    }
}
