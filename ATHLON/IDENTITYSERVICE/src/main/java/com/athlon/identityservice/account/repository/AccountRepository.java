package com.athlon.identityservice.account.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.athlon.identityservice.account.model.Accounts;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Accounts, Long>{
	
    Optional<Accounts> findByParentId(Long parentId);
}
