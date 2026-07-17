package com.athlon.tournament.tournament.repository;

import com.athlon.tournament.tournament.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    Optional<Tournament> findByUuid(UUID uuid);
    List<Tournament> findByOrganizerIdAndIsActiveTrue(Long organizerId);
}
