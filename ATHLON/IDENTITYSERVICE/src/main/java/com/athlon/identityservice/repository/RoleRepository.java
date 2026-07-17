package com.athlon.identityservice.repository;

import com.athlon.identityservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByUuid(UUID uuid);
    
    Optional<Role> findByName(String name);
    
    boolean existsByName(String name);
}
