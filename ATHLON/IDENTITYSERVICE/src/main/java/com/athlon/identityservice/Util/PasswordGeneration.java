package com.athlon.identityservice.util;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class PasswordGeneration {

	int MIN_LENGTH = 8;
	String DIGITS = "0123456789";
    String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    String SPECIAL = "@#$%&*!";
    
    int OTP_LENGTH = 4;
    int PASSWORD_LENGTH = 6;
    
    SecureRandom random = new SecureRandom();

	public String generateOtp() {
        StringBuilder otp = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        }
        return otp.toString();
    }
	
	public String generatePassword() {
        String allChars = DIGITS + UPPERCASE + SPECIAL;
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);

        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        return password.toString();


    }

    public boolean isValidPassword(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return false;
        }

        boolean hasDigit = false;
        boolean hasUppercase = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (DIGITS.indexOf(c) >= 0) hasDigit = true;
            else if (UPPERCASE.indexOf(c) >= 0) hasUppercase = true;
            else if (SPECIAL.indexOf(c) >= 0) hasSpecial = true;
        }

        return hasDigit && hasUppercase && hasSpecial;
    }
}
