package com.athlon.authservice.auth.repository;

import com.athlon.authservice.auth.entity.Credentials;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CredentialsRepository extends JpaRepository<Credentials, Long> {
    
    Optional<Credentials> findByEmail(String email);
    Optional<Credentials> findByPhone(String phone);
    
    @Query("SELECT c FROM Credentials c WHERE c.email = :identifier OR c.phone = :identifier")
    Optional<Credentials> findByEmailOrPhone(@Param("identifier") String identifier);
    
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    
    Optional<Credentials> findByCredentialUuid(UUID credentialUuid);
}
