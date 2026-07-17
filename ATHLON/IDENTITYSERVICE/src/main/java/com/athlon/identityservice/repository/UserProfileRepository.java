package com.athlon.identityservice.repository;

import com.athlon.identityservice.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    
    Optional<UserProfile> findByUuid(UUID uuid);
    
    Optional<UserProfile> findByUserId(Long userId);
    
    Optional<UserProfile> findByUserUuid(UUID userUuid);
}
