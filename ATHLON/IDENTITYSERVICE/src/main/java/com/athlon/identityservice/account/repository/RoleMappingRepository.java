package com.athlon.identityservice.account.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import com.athlon.identityservice.account.model.RoleMapping;

public interface RoleMappingRepository extends JpaRepository<RoleMapping, Long>{

    List<RoleMapping> findByAccountId(Long accountId);
    Optional<RoleMapping> findByAccountIdAndRoleName(Long accountId, String roleName);

}
