package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipCategoryRepository extends JpaRepository<ChampionshipCategory, Long> {
    Optional<ChampionshipCategory> findByCategoryUuid(UUID categoryUuid);
    List<ChampionshipCategory> findByChampionshipIdOrderByDisplayOrderAsc(Long championshipId);
    List<ChampionshipCategory> findByChampionshipUuidOrderByDisplayOrderAsc(UUID championshipUuid);
    void deleteByChampionshipId(Long championshipId);
}
