package com.athlon.tournament.registration.repository;

import com.athlon.tournament.registration.entity.RegistrationPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationPlayerRepository extends JpaRepository<RegistrationPlayer, Long> {
    Optional<RegistrationPlayer> findByUuid(UUID uuid);
    List<RegistrationPlayer> findByRegistrationIdAndIsActiveTrue(Long registrationId);
}
