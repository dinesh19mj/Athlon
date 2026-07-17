package com.athlon.authservice.constants;

/**
 * Security related constants.
 */
public class SecurityConstants {

	private SecurityConstants() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * HTTP Header
     */
    public static final String AUTHORIZATION_HEADER = "Authorization";

    /**
     * JWT Token Prefix
     */
    public static final String BEARER_PREFIX = "Bearer ";

    /**
     * JWT Claims
     */
    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_ROLE = "role";

    /**
     * Token Types
     */
    public static final String ACCESS_TOKEN = "ACCESS";
    public static final String REFRESH_TOKEN = "REFRESH";
    public static final String PASSWORD_RESET_TOKEN = "PASSWORD_RESET";
    public static final String EMAIL_VERIFICATION_TOKEN = "EMAIL_VERIFICATION";

}
