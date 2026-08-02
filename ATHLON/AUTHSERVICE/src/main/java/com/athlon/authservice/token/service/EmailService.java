package com.athlon.authservice.token.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendWelcomeEmail(String toEmail) {
        System.out.println("Sending welcome email to " + toEmail);
    }
    public void sendPasswordResetEmail(String toEmail, String token) {
        System.out.println("Sending password reset email to " + toEmail + " with token " + token);
    }
    public void sendEmailVerification(String toEmail, String token) {
        System.out.println("Sending email verification to " + toEmail + " with token " + token);
    }
}
