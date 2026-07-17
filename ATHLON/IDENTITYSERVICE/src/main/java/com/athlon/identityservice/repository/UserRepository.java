package com.athlon.identityservice.repository;

import com.athlon.identityservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUuid(UUID uuid);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
