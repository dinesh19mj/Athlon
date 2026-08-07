package com.athlon.tournamentservice.registration.repository;

import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Optional<Registration> findByUuid(UUID uuid);
    List<Registration> findByTournamentIdAndIsActiveTrue(Long tournamentId);
    List<Registration> findByCategoryIdAndIsActiveTrue(Long categoryId);
}

