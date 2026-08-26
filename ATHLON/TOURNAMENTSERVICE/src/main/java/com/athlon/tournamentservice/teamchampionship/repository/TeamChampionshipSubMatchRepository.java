package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipSubMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipSubMatchRepository extends JpaRepository<TeamChampionshipSubMatch, Long> {
    Optional<TeamChampionshipSubMatch> findBySubMatchUuid(UUID subMatchUuid);
    List<TeamChampionshipSubMatch> findByFixtureIdOrderByOrderSequenceAsc(Long fixtureId);
    List<TeamChampionshipSubMatch> findByChampionshipId(Long championshipId);
    void deleteByFixtureId(Long fixtureId);
}
