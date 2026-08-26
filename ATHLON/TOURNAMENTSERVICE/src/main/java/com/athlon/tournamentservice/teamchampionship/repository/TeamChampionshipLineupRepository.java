package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipLineup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipLineupRepository extends JpaRepository<TeamChampionshipLineup, Long> {
    Optional<TeamChampionshipLineup> findByLineupUuid(UUID lineupUuid);
    List<TeamChampionshipLineup> findByFixtureId(Long fixtureId);
    Optional<TeamChampionshipLineup> findByFixtureIdAndTeamId(Long fixtureId, Long teamId);
    Optional<TeamChampionshipLineup> findByFixtureIdAndTeamIdAndVersion(Long fixtureId, Long teamId, Integer version);
}
