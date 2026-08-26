package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipPool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipPoolRepository extends JpaRepository<TeamChampionshipPool, Long> {
    Optional<TeamChampionshipPool> findByPoolUuid(UUID poolUuid);
    List<TeamChampionshipPool> findByChampionshipId(Long championshipId);
    List<TeamChampionshipPool> findByChampionshipUuid(UUID championshipUuid);
}
