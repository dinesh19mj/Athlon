package com.athlon.tournamentservice.registration.repository;

import com.athlon.tournamentservice.registration.entity.RegistrationPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationPlayerRepository extends JpaRepository<RegistrationPlayer, Long> {
	
	Optional<RegistrationPlayer> findByRegistrationPlayerUuid(UUID registrationPlayerUuid);

    List<RegistrationPlayer> findByRegistrationId(Long registrationId);

    List<RegistrationPlayer> findByTournamentId(Long tournamentId);

    List<RegistrationPlayer> findByPlayerId(Long playerId);

    List<RegistrationPlayer> findByTournamentIdAndPlayerId(Long tournamentId, Long playerId);
}

