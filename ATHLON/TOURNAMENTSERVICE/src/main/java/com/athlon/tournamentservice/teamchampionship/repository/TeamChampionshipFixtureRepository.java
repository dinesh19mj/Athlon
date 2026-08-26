package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipFixture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipFixtureRepository extends JpaRepository<TeamChampionshipFixture, Long> {
    Optional<TeamChampionshipFixture> findByFixtureUuid(UUID fixtureUuid);
    List<TeamChampionshipFixture> findByChampionshipId(Long championshipId);
    List<TeamChampionshipFixture> findByChampionshipUuid(UUID championshipUuid);
    List<TeamChampionshipFixture> findByChampionshipIdAndPoolId(Long championshipId, Long poolId);
    List<TeamChampionshipFixture> findByChampionshipIdAndStage(Long championshipId, String stage);
    void deleteByChampionshipId(Long championshipId);
}
