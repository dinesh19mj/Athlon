package com.athlon.authservice.service;

import com.athlon.authservice.dto.request.*;
import com.athlon.authservice.dto.response.LoginResponse;
import com.athlon.authservice.dto.response.RefreshTokenResponse;
import com.athlon.authservice.dto.response.UserResponse;
import com.athlon.authservice.entity.*;
import com.athlon.authservice.exception.*;
import com.athlon.authservice.repository.*;
import com.athlon.authservice.security.SecurityProperties;
import com.athlon.authservice.util.TokenGenerator;
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

    public AuthService(CredentialsRepository credentialsRepository, LoginHistoryRepository loginHistoryRepository, PasswordResetTokenRepository passwordResetTokenRepository, EmailVerificationTokenRepository emailVerificationTokenRepository, JwtService jwtService, RefreshTokenService refreshTokenService, PasswordService passwordService, EmailService emailService, SecurityProperties securityProperties) {
        this.credentialsRepository = credentialsRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordService = passwordService;
        this.emailService = emailService;
        this.securityProperties = securityProperties;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (credentialsRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already in use.");
        }
        Credentials credentials = new Credentials(request.getEmail(), passwordService.encodePassword(request.getPassword()));
        credentials = credentialsRepository.save(credentials);

        String token = TokenGenerator.generateUniqueToken();
        EmailVerificationToken verificationToken = new EmailVerificationToken(credentials.getId(), credentials.getUuid(), token, LocalDateTime.now().plusHours(24));
        emailVerificationTokenRepository.save(verificationToken);

        emailService.sendWelcomeEmail(request.getEmail());
        emailService.sendEmailVerification(request.getEmail(), token);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress, String userAgent) {
        Optional<Credentials> optCreds = credentialsRepository.findByEmail(request.getEmail());
        if (optCreds.isEmpty()) {
            throw new AuthenticationException("Invalid email or password");
        }
        Credentials creds = optCreds.get();
        if (creds.isAccountLocked()) {
            loginHistoryRepository.save(new LoginHistory(creds.getId(), creds.getUuid(), ipAddress, userAgent, "FAILED_ACCOUNT_LOCKED"));
            throw new AuthenticationException("Account is locked");
        }

        if (!passwordService.matches(request.getPassword(), creds.getPasswordHash())) {
            creds.setFailedLoginAttempts(creds.getFailedLoginAttempts() + 1);
            if (creds.getFailedLoginAttempts() >= securityProperties.getMaxLoginAttempts()) {
                creds.setAccountLocked(true);
            }
            credentialsRepository.save(creds);
            loginHistoryRepository.save(new LoginHistory(creds.getId(), creds.getUuid(), ipAddress, userAgent, "FAILED_BAD_CREDENTIALS"));
            throw new AuthenticationException("Invalid email or password");
        }

        creds.setFailedLoginAttempts(0);
        credentialsRepository.save(creds);
        loginHistoryRepository.save(new LoginHistory(creds.getId(), creds.getUuid(), ipAddress, userAgent, "SUCCESS"));

        String jwt = jwtService.generateAccessToken(creds.getEmail(), creds.getUuid());
        String refreshToken = refreshTokenService.createRefreshToken(creds.getId(), creds.getUuid()).getToken();
        
        return new LoginResponse(jwt, refreshToken);
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
        
        String token = jwtService.generateAccessToken(credentials.getEmail(), credentials.getUuid());
        return new RefreshTokenResponse(token, refreshToken.getToken());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<Credentials> optCreds = credentialsRepository.findByEmail(request.getEmail());
        if (optCreds.isPresent()) {
            Credentials creds = optCreds.get();
            String token = TokenGenerator.generateUniqueToken();
            PasswordResetToken resetToken = new PasswordResetToken(creds.getId(), creds.getUuid(), token, LocalDateTime.now().plusHours(1));
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
        Credentials credentials = credentialsRepository.findByUuid(userUuid)
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
        Credentials credentials = credentialsRepository.findByUuid(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserResponse(credentials.getUuid(), credentials.getEmail(), credentials.isEmailVerified());
    }
}
