package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChampionshipRepository extends JpaRepository<TeamChampionship, Long> {
    Optional<TeamChampionship> findByChampionshipUuid(UUID championshipUuid);
    List<TeamChampionship> findByOrganizerId(Long organizerId);
    List<TeamChampionship> findByOrganizerUuid(UUID organizerUuid);
    List<TeamChampionship> findByStatus(String status);
    List<TeamChampionship> findByVisibility(String visibility);

    @Query("SELECT c FROM TeamChampionship c WHERE c.visibility IS NULL OR UPPER(c.visibility) = 'PUBLIC' OR c.stage = 'AUCTION_STAGE' OR c.stage = 'AUCTION_PAUSED'")
    List<TeamChampionship> findAllPublicChampionships();
}
