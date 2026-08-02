package com.athlon.authservice.token.repository;

import com.athlon.authservice.auth.entity.Credentials;
import com.athlon.authservice.token.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByUuid(UUID uuid);
    
    void deleteByCredentialsId(Long credentialsId);
}
