package com.athlon.identityservice.user.repository;

import com.athlon.identityservice.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUserUuid(UUID userUuid);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    long countByIsActive(Integer isActive);

    org.springframework.data.domain.Page<User> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    org.springframework.data.domain.Page<User> searchByEmail(@org.springframework.data.repository.query.Param("query") String query, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<User> findByIsActive(Integer isActive, org.springframework.data.domain.Pageable pageable);
}
