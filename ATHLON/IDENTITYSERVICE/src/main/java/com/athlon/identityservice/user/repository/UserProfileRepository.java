package com.athlon.identityservice.user.repository;

import com.athlon.identityservice.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    
    Optional<UserProfile> findByUserProfileUuid(UUID uuid);
    
    Optional<UserProfile> findByUserId(Long userId);
    
    Optional<UserProfile> findByUserUuid(UUID userUuid);
}
