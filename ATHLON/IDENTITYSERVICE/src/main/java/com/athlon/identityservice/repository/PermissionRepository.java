package com.athlon.identityservice.repository;

import com.athlon.identityservice.entity.Permission;
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
