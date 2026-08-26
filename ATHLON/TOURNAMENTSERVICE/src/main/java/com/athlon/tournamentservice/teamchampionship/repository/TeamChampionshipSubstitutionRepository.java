package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipSubstitution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipSubstitutionRepository extends JpaRepository<TeamChampionshipSubstitution, Long> {
    Optional<TeamChampionshipSubstitution> findBySubstitutionUuid(UUID substitutionUuid);
    List<TeamChampionshipSubstitution> findByFixtureId(Long fixtureId);
    List<TeamChampionshipSubstitution> findBySubMatchId(Long subMatchId);
    int countByFixtureIdAndTeamId(Long fixtureId, Long teamId);
}
