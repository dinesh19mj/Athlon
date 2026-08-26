package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipMatchFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipMatchFormatRepository extends JpaRepository<ChampionshipMatchFormat, Long> {
    Optional<ChampionshipMatchFormat> findByFormatUuid(UUID formatUuid);
    List<ChampionshipMatchFormat> findByChampionshipIdOrderByDisplayOrderAsc(Long championshipId);
    List<ChampionshipMatchFormat> findByChampionshipUuidOrderByDisplayOrderAsc(UUID championshipUuid);
    void deleteByChampionshipId(Long championshipId);
}
