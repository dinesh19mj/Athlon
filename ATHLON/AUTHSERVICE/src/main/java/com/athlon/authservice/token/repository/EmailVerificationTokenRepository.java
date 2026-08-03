package com.athlon.authservice.token.repository;

import com.athlon.authservice.token.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
	
	Optional<EmailVerificationToken> findByToken(String token);

    Optional<EmailVerificationToken> findByVerificationTokenUuid(UUID verificationTokenUuid);
}
