package com.athlon.tournamentservice.tournament.repository;

import com.athlon.tournamentservice.tournament.entity.TournamentAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TournamentAnnouncementRepository extends JpaRepository<TournamentAnnouncement, Long> {
    
    Optional<TournamentAnnouncement> findByUuid(UUID uuid);
    
    List<TournamentAnnouncement> findByTournamentIdAndIsActiveTrue(Long tournamentId);
    
    List<TournamentAnnouncement> findByIsActiveTrueOrderByCreatedAtDesc();

    List<TournamentAnnouncement> findByUserUuidAndIsActiveTrueOrderByCreatedAtDesc(UUID userUuid);

    List<TournamentAnnouncement> findBySportIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(String sport);

    List<TournamentAnnouncement> findByCityContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(String city);

    List<TournamentAnnouncement> findBySportIgnoreCaseAndCityContainingIgnoreCaseAndIsActiveTrueOrderByCreatedAtDesc(String sport, String city);
}
