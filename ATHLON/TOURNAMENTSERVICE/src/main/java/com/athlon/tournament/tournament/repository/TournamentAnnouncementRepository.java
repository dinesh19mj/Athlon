package com.athlon.tournament.tournament.repository;

import com.athlon.tournament.tournament.entity.TournamentAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentAnnouncementRepository extends JpaRepository<TournamentAnnouncement, Long> {
    Optional<TournamentAnnouncement> findByUuid(UUID uuid);
    List<TournamentAnnouncement> findByTournamentIdAndIsActiveTrue(Long tournamentId);
}
