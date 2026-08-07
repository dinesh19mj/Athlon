package com.athlon.tournamentservice.tournament.repository;

import com.athlon.tournamentservice.tournament.entity.TournamentSponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentSponsorRepository extends JpaRepository<TournamentSponsor, Long> {
    Optional<TournamentSponsor> findByUuid(UUID uuid);
    List<TournamentSponsor> findByTournamentIdAndIsActiveTrue(Long tournamentId);
}

