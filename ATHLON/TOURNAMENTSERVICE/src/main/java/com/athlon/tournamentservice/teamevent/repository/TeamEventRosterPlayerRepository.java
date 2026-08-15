package com.athlon.tournamentservice.teamevent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventRosterPlayer;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface TeamEventRosterPlayerRepository extends JpaRepository<TeamEventRosterPlayer, Long> {
    
    Optional<TeamEventRosterPlayer> findByRosterPlayerUuid(UUID rosterPlayerUuid);

    List<TeamEventRosterPlayer> findByTeamRegistrationId(Long teamRegistrationId);
    
    List<TeamEventRosterPlayer> findByTournamentId(Long tournamentId);
}
