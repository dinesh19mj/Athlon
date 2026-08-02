package com.athlon.identityservice.account.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.athlon.identityservice.account.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByRoleNameIgnoreCase(String roleName);
}
