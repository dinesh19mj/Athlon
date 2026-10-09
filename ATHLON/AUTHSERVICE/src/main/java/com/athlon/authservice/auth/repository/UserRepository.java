package com.athlon.authservice.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.authservice.auth.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUserUuid(UUID userUuid);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query(value = 
        "SELECT r.name FROM roles r " +
        "JOIN user_roles ur ON ur.roleid = r.roleid " +
        "WHERE ur.userid = :userId AND ur.isactive = true AND r.isactive = true", 
        nativeQuery = true)
    java.util.List<String> findActiveRoleNamesByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
