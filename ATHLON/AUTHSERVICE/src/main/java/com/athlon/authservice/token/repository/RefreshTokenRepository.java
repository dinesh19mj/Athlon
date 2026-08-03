package com.athlon.authservice.token.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.authservice.token.entity.RefreshToken;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
	Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByRefreshTokenUuid(UUID refreshTokenUuid);

    void deleteByCredentialsId(Long credentialsId);
}
