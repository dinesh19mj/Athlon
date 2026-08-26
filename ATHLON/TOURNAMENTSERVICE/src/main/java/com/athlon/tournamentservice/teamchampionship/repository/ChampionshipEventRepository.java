package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipEventRepository extends JpaRepository<ChampionshipEvent, Long> {
    Optional<ChampionshipEvent> findByEventUuid(UUID eventUuid);
    List<ChampionshipEvent> findByChampionshipIdOrderByDisplayOrderAsc(Long championshipId);
    List<ChampionshipEvent> findByChampionshipUuidOrderByDisplayOrderAsc(UUID championshipUuid);
    void deleteByChampionshipId(Long championshipId);
}
