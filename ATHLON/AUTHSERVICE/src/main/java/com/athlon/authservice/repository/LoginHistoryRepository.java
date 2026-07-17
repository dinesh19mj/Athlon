package com.athlon.authservice.repository;

import com.athlon.authservice.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByCredentialsIdOrderByLoginTimeDesc(Long credentialsId);
    Optional<LoginHistory> findByUuid(UUID uuid);
}
