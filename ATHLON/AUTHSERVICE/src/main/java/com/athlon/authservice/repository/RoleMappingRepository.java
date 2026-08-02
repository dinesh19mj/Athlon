package com.athlon.authservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.authservice.model.RoleMapping;

@Repository
public interface RoleMappingRepository extends JpaRepository<RoleMapping, Long> {
    List<RoleMapping> findByAccountId(Long accountId);
}
