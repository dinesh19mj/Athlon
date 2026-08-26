package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipPlayerRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipPlayerRegistrationRepository extends JpaRepository<ChampionshipPlayerRegistration, Long> {
    Optional<ChampionshipPlayerRegistration> findByPlayerUuid(UUID playerUuid);
    List<ChampionshipPlayerRegistration> findByChampionshipId(Long championshipId);
    List<ChampionshipPlayerRegistration> findByChampionshipUuid(UUID championshipUuid);
    List<ChampionshipPlayerRegistration> findByChampionshipIdAndCategoryId(Long championshipId, Long categoryId);
    List<ChampionshipPlayerRegistration> findByChampionshipIdAndStatus(Long championshipId, String status);
    List<ChampionshipPlayerRegistration> findByUserId(Long userId);
}
