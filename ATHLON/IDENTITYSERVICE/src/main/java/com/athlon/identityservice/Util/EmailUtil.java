package com.athlon.identityservice.Util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailUtil {
	
	@Autowired
    private JavaMailSender mailSender;
	
	@Value("${spring.mail.username}")
	private String fromEmail;

	public String sendPasswordEmail(String toEmail, String firstName, String password) {
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			if (fromEmail != null) {
				message.setFrom(fromEmail.trim());
			}
			message.setTo(toEmail);
			message.setSubject("Welcome to Athlon! Your Account Created - Login Credentials");

			String content = "Dear " + firstName + ",\n\n"
					+ "Greetings from Athlon\n\n"
					+ "Your account has been successfully created.\n"
					+ "To access your account, please use the login credentials below:\n\n" + "Email: " + toEmail + "\n"
					+ "Temporary Password: " + password + "\n\n"
					+ "For your security, please log in immediately and update your password.\n\n"
					+ "If you did not request this account, kindly ignore this message.\n\n" + "Best regards,\n"
					+ "Athlon Team\n";

			message.setText(content);
			mailSender.send(message);
			return "success";
		} catch (Exception e) {
			System.out.println("Email sending error :> " + e.getMessage());
			e.printStackTrace();
		}
		return "failed";
	}
}
