package com.athlon.authservice.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.athlon.authservice.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{

	Optional<User> findByUserUuid(UUID userUuid);
}
