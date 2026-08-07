package com.athlon.tournamentservice.tournament.repository;

import com.athlon.tournamentservice.tournament.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    Optional<Tournament> findByTournamentUuid(UUID tournamentUuid);
    List<Tournament> findByOrganizerIdAndIsActive(Long organizerId, Integer isActive);
    List<Tournament> findByOrganizerUuidAndIsActive(UUID organizerUuid, Integer isActive);
}

