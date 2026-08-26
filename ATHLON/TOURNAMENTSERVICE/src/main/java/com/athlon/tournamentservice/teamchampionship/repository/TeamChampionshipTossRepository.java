package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipToss;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipTossRepository extends JpaRepository<TeamChampionshipToss, Long> {
    Optional<TeamChampionshipToss> findByTossUuid(UUID tossUuid);
    Optional<TeamChampionshipToss> findByFixtureId(Long fixtureId);
}
