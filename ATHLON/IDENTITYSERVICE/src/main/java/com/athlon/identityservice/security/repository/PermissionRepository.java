package com.athlon.identityservice.security.repository;

import com.athlon.identityservice.security.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    Optional<Permission> findByUuid(UUID uuid);
    
    Optional<Permission> findByName(String name);
    
    boolean existsByName(String name);
}
