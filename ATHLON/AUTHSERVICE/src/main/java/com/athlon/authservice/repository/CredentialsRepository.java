package com.athlon.authservice.repository;

import com.athlon.authservice.entity.Credentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CredentialsRepository extends JpaRepository<Credentials, Long> {
    
    Optional<Credentials> findByEmail(String email);
    
    Optional<Credentials> findByUuid(UUID uuid);

    boolean existsByEmail(String email);
}
