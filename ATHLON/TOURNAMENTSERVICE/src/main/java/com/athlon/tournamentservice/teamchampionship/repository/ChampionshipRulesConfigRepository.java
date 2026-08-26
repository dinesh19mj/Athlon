package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipRulesConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipRulesConfigRepository extends JpaRepository<ChampionshipRulesConfig, Long> {
    Optional<ChampionshipRulesConfig> findByChampionshipId(Long championshipId);
    Optional<ChampionshipRulesConfig> findByChampionshipUuid(UUID championshipUuid);
}
