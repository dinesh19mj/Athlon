package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventLineupPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventLineupPlayerRepository extends JpaRepository<TeamEventLineupPlayer, Long> {
    Optional<TeamEventLineupPlayer> findByUuid(UUID uuid);
    List<TeamEventLineupPlayer> findByTeamEventLineupId(Long teamEventLineupId);
}
