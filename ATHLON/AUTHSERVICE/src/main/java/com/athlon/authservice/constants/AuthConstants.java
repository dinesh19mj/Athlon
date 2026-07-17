package com.athlon.authservice.constants;

/**
 * Authentication related constants.
 */
public class AuthConstants {

	private AuthConstants() {
    }

    // Authentication Messages
    public static final String LOGIN_SUCCESS = "Login successful.";
    public static final String LOGOUT_SUCCESS = "Logout successful.";
    public static final String REGISTRATION_SUCCESS = "Registration completed successfully.";

    // Password
    public static final String PASSWORD_RESET_SUCCESS = "Password reset successful.";
    public static final String PASSWORD_CHANGED_SUCCESS = "Password changed successfully.";
    public static final String PASSWORD_RESET_EMAIL_SENT = "Password reset email sent.";

    // Email Verification
    public static final String EMAIL_VERIFIED = "Email verified successfully.";
    public static final String EMAIL_ALREADY_VERIFIED = "Email is already verified.";

    // Error Messages
    public static final String INVALID_CREDENTIALS = "Invalid email or password.";
    public static final String ACCOUNT_LOCKED = "Your account has been locked.";
    public static final String ACCOUNT_DISABLED = "Your account is disabled.";
    public static final String USER_NOT_FOUND = "User not found.";
    public static final String EMAIL_ALREADY_EXISTS = "Email address already exists.";
    public static final String INVALID_REFRESH_TOKEN = "Invalid refresh token.";
    public static final String REFRESH_TOKEN_EXPIRED = "Refresh token has expired.";
    public static final String INVALID_RESET_TOKEN = "Invalid password reset token.";
    public static final String RESET_TOKEN_EXPIRED = "Password reset token has expired.";

}
