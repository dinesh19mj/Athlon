package com.athlon.identityservice.security.repository;

import com.athlon.identityservice.security.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query(value = 
        "SELECT r.name FROM roles r " +
        "JOIN user_roles ur ON ur.roleid = r.roleid " +
        "WHERE ur.userid = :userId AND ur.isactive = true AND r.isactive = true", 
        nativeQuery = true)
    List<String> findActiveRoleNamesByUserId(@Param("userId") Long userId);
}
