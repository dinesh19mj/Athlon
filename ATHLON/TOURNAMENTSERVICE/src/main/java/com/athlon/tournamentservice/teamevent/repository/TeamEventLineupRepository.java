package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventLineup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventLineupRepository extends JpaRepository<TeamEventLineup, Long> {
    Optional<TeamEventLineup> findByUuid(UUID uuid);
    Optional<TeamEventLineup> findByFixtureMatchIdAndTeamRegistrationId(Long fixtureMatchId, Long teamRegistrationId);
    List<TeamEventLineup> findByFixtureMatchId(Long fixtureMatchId);
}
