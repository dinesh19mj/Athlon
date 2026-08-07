package com.athlon.authservice.auth.service;

import com.athlon.authservice.auth.dto.request.*;
import com.athlon.authservice.token.dto.request.*;
import com.athlon.authservice.dto.request.LogoutRequest;
import com.athlon.authservice.auth.dto.response.LoginResponse;
import com.athlon.authservice.token.dto.response.RefreshTokenResponse;
import com.athlon.authservice.dto.response.UserResponse;
import com.athlon.authservice.auth.entity.*;
import com.athlon.authservice.token.entity.*;
import com.athlon.authservice.exception.*;
import com.athlon.authservice.auth.repository.*;
import com.athlon.authservice.token.repository.*;
import com.athlon.authservice.security.SecurityProperties;
import com.athlon.authservice.util.TokenGenerator;
import com.athlon.authservice.service.JwtService;
import com.athlon.authservice.token.service.RefreshTokenService;
import com.athlon.authservice.token.service.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
	private final CredentialsRepository credentialsRepository;
	private final LoginHistoryRepository loginHistoryRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final EmailVerificationTokenRepository emailVerificationTokenRepository;
	private final JwtService jwtService;
	private final RefreshTokenService refreshTokenService;
	private final PasswordService passwordService;
	private final EmailService emailService;
	private final SecurityProperties securityProperties;
	private final UserRepository userRepository;

	public AuthService(CredentialsRepository credentialsRepository, LoginHistoryRepository loginHistoryRepository,
			PasswordResetTokenRepository passwordResetTokenRepository,
			EmailVerificationTokenRepository emailVerificationTokenRepository, JwtService jwtService,
			RefreshTokenService refreshTokenService, PasswordService passwordService, EmailService emailService,
			SecurityProperties securityProperties, UserRepository userRepository) {
		this.credentialsRepository = credentialsRepository;
		this.loginHistoryRepository = loginHistoryRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.emailVerificationTokenRepository = emailVerificationTokenRepository;
		this.jwtService = jwtService;
		this.refreshTokenService = refreshTokenService;
		this.passwordService = passwordService;
		this.emailService = emailService;
		this.securityProperties = securityProperties;
		this.userRepository = userRepository;
	}

	@Transactional
	public void createCredential(CreateCredentialRequest request) {
		if (request.getEmail() != null && credentialsRepository.existsByEmail(request.getEmail())) {
			throw new ConflictException("Email is already in use.");
		}
		if (request.getPhone() != null && credentialsRepository.existsByPhone(request.getPhone())) {
			throw new ConflictException("Phone is already in use.");
		}

		Credentials credentials = new Credentials();
		credentials.setUserUuid(request.getUserUuid());
		credentials.setEmail(request.getEmail());
		credentials.setPhone(request.getPhone());
		credentials.setPasswordHash(passwordService.encodePassword(request.getPassword()));
		credentials.setCredentialUuid(UUID.randomUUID());
		credentials.setFailedLoginAttempts(0);
		credentials.setAccountLocked(false);
		credentials.setEmailVerified(false);

		credentialsRepository.save(credentials);

		// We can skip email verification token creation for now if it's handled
		// differently,
		// or generate one if email is provided.
		if (request.getEmail() != null) {
			String token = TokenGenerator.generateUniqueToken();
			EmailVerificationToken verificationToken = new EmailVerificationToken(credentials.getCredentialId(),
					credentials.getCredentialUuid(), token, LocalDateTime.now().plusHours(24));
			emailVerificationTokenRepository.save(verificationToken);
			emailService.sendWelcomeEmail(request.getEmail());
			emailService.sendEmailVerification(request.getEmail(), token);
		}
	}

	@Transactional
	public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
		Optional<Credentials> optCreds = credentialsRepository.findByEmailOrPhone(request.getIdentifier());
		if (optCreds.isEmpty()) {
			throw new AuthenticationException("Invalid email or password");
		}
		Credentials creds = optCreds.get();
		if (creds.isAccountLocked()) {
			loginHistoryRepository.save(new LoginHistory(creds.getCredentialId(), creds.getCredentialUuid(), ipAddress,
					userAgent, "FAILED_ACCOUNT_LOCKED"));
			throw new AuthenticationException("Account is locked");
		}

		if (!passwordService.matches(request.getPassword(), creds.getPasswordHash())) {
			creds.setFailedLoginAttempts(creds.getFailedLoginAttempts() + 1);
			if (creds.getFailedLoginAttempts() >= securityProperties.getMaxLoginAttempts()) {
				creds.setAccountLocked(true);
			}
			credentialsRepository.save(creds);
			loginHistoryRepository.save(new LoginHistory(creds.getCredentialId(), creds.getCredentialUuid(), ipAddress,
					userAgent, "FAILED_BAD_CREDENTIALS"));
			throw new AuthenticationException("Invalid email or password");
		}

		creds.setFailedLoginAttempts(0);
		credentialsRepository.save(creds);
		loginHistoryRepository.save(
				new LoginHistory(creds.getCredentialId(), creds.getCredentialUuid(), ipAddress, userAgent, "SUCCESS"));

		String jwt = jwtService.generateAccessToken(creds.getEmail(), creds.getUserUuid());
		String refreshToken = refreshTokenService.createRefreshToken(creds.getCredentialId(), creds.getCredentialUuid())
				.getToken();

		User user = userRepository.findByUserUuid(creds.getUserUuid())
				.orElseThrow(() -> new AuthenticationException("User not found"));

		return new LoginResponse(jwt, refreshToken, user.getUserId(), user.getUserUuid());
	}

	@Transactional
	public void logout(LogoutRequest request) {
		refreshTokenService.revokeToken(request.getRefreshToken());
	}

	@Transactional
	public RefreshTokenResponse refresh(RefreshTokenRequest request) {
		RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
		refreshToken = refreshTokenService.verifyExpiration(refreshToken);
		Credentials credentials = credentialsRepository.findById(refreshToken.getCredentialsId())
				.orElseThrow(() -> new AuthenticationException("User not found"));

		String token = jwtService.generateAccessToken(credentials.getEmail(), credentials.getUserUuid());
		return new RefreshTokenResponse(token, refreshToken.getToken());
	}

	@Transactional
	public void forgotPassword(ForgotPasswordRequest request) {
		Optional<Credentials> optCreds = credentialsRepository.findByEmail(request.getEmail());
		if (optCreds.isPresent()) {
			Credentials creds = optCreds.get();
			String token = TokenGenerator.generateUniqueToken();
			PasswordResetToken resetToken = new PasswordResetToken(creds.getCredentialId(), creds.getCredentialUuid(),
					token, LocalDateTime.now().plusHours(1));
			passwordResetTokenRepository.save(resetToken);
			emailService.sendPasswordResetEmail(creds.getEmail(), token);
		}
	}

	@Transactional
	public void resetPassword(ResetPasswordRequest request) {
		PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
				.orElseThrow(() -> new BadRequestException("Invalid reset token"));

		if (resetToken.isUsed() || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
			throw new BadRequestException("Token is invalid or expired");
		}

		Credentials credentials = credentialsRepository.findById(resetToken.getCredentialsId())
				.orElseThrow(() -> new BadRequestException("User not found"));

		credentials.setPasswordHash(passwordService.encodePassword(request.getNewPassword()));
		credentialsRepository.save(credentials);

		resetToken.setUsed(true);
		passwordResetTokenRepository.save(resetToken);
	}

	@Transactional
	public void changePassword(ChangePasswordRequest request, UUID userUuid) {
		Credentials credentials = credentialsRepository.findByCredentialUuid(userUuid)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		if (!passwordService.matches(request.getOldPassword(), credentials.getPasswordHash())) {
			throw new BadRequestException("Invalid old password");
		}

		credentials.setPasswordHash(passwordService.encodePassword(request.getNewPassword()));
		credentialsRepository.save(credentials);
	}

	@Transactional
	public void verifyEmail(String token) {
		EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
				.orElseThrow(() -> new BadRequestException("Invalid verification token"));

		if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
			throw new BadRequestException("Verification token has expired");
		}

		Credentials credentials = credentialsRepository.findById(verificationToken.getCredentialsId())
				.orElseThrow(() -> new BadRequestException("User not found"));

		credentials.setEmailVerified(true);
		credentialsRepository.save(credentials);

		emailVerificationTokenRepository.delete(verificationToken);
	}

	public UserResponse getMe(UUID userUuid) {
		Credentials credentials = credentialsRepository.findByCredentialUuid(userUuid)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		return new UserResponse(credentials.getCredentialUuid(), credentials.getEmail(), credentials.isEmailVerified());
	}
}
