package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipTeamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChampionshipTeamRegistrationRepository extends JpaRepository<ChampionshipTeamRegistration, Long> {
    Optional<ChampionshipTeamRegistration> findByTeamUuid(UUID teamUuid);
    List<ChampionshipTeamRegistration> findByChampionshipId(Long championshipId);
    List<ChampionshipTeamRegistration> findByChampionshipUuid(UUID championshipUuid);
    List<ChampionshipTeamRegistration> findByChampionshipIdAndStatus(Long championshipId, String status);
    List<ChampionshipTeamRegistration> findByOwnerUserId(Long ownerUserId);
}
