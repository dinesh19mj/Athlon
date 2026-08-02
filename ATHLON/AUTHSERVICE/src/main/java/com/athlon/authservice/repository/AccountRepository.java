package com.athlon.authservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.authservice.model.Accounts;

@Repository
public interface AccountRepository extends JpaRepository<Accounts, Long> {
    Optional<Accounts> findByEmail(String email);
    Optional<Accounts> findByEmailOrPhoneNumber(String email, String phoneNumber);
}
