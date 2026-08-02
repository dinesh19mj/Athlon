package com.athlon.identityservice.security.repository;

import com.athlon.identityservice.security.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    Optional<UserRole> findByUuid(UUID uuid);
    
    List<UserRole> findByUserId(Long userId);
    
    List<UserRole> findByRoleId(Long roleId);
    
    boolean existsByUserIdAndRoleId(Long userId, Long roleId);
}
