package com.athlon.authservice.repository;

import com.athlon.authservice.entity.Credentials;
import com.athlon.authservice.entity.RefreshToken;
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
