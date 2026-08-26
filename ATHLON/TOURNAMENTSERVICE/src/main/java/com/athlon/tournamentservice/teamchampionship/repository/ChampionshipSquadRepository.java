package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipSquad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipSquadRepository extends JpaRepository<ChampionshipSquad, Long> {
    Optional<ChampionshipSquad> findBySquadUuid(UUID squadUuid);
    List<ChampionshipSquad> findByTeamId(Long teamId);
    List<ChampionshipSquad> findByTeamUuid(UUID teamUuid);
    List<ChampionshipSquad> findByChampionshipId(Long championshipId);
    List<ChampionshipSquad> findByChampionshipIdAndPlayerId(Long championshipId, Long playerId);
    Optional<ChampionshipSquad> findByTeamIdAndPlayerId(Long teamId, Long playerId);
    int countByTeamId(Long teamId);
}
