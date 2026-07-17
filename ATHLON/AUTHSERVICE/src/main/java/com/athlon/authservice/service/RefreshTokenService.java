package com.athlon.authservice.service;

import com.athlon.authservice.entity.RefreshToken;
import com.athlon.authservice.exception.AuthenticationException;
import com.athlon.authservice.repository.RefreshTokenRepository;
import com.athlon.authservice.security.JwtProperties;
import com.athlon.authservice.util.TokenGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {
	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtProperties jwtProperties;

	public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
		this.refreshTokenRepository = refreshTokenRepository;
		this.jwtProperties = jwtProperties;
	}

	@Transactional
	public RefreshToken createRefreshToken(Long credentialsId, UUID credentialsUuid) {
		refreshTokenRepository.deleteByCredentialsId(credentialsId);

		RefreshToken refreshToken = new RefreshToken(
			credentialsId,
			credentialsUuid,
			TokenGenerator.generateUniqueToken(),
			LocalDateTime.now().plus(jwtProperties.getRefreshExpirationMs(), java.time.temporal.ChronoUnit.MILLIS)
		);

		return refreshTokenRepository.save(refreshToken);
	}

	public RefreshToken verifyExpiration(RefreshToken token) {
		if (token.getExpiryDate().isBefore(LocalDateTime.now()) || token.isRevoked()) {
			refreshTokenRepository.delete(token);
			throw new AuthenticationException("Refresh token was expired or revoked. Please make a new signin request");
		}
		return token;
	}

	public void revokeToken(String token) {
		refreshTokenRepository.findByToken(token).ifPresent(rt -> {
			rt.setRevoked(true);
			refreshTokenRepository.save(rt);
		});
	}

	public RefreshToken findByToken(String token) {
		return refreshTokenRepository.findByToken(token)
				.orElseThrow(() -> new AuthenticationException("Refresh token is not in database!"));
	}
}
