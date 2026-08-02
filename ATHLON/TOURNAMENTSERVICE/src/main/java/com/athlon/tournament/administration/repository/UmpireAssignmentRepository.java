package com.athlon.tournament.administration.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournament.administration.entity.UmpireAssignment;

import java.util.List;

@Repository
public interface UmpireAssignmentRepository extends JpaRepository<UmpireAssignment, Long> {
    List<UmpireAssignment> findByTournamentId(Long tournamentId);
    List<UmpireAssignment> findByUmpireId(Long umpireId);
    List<UmpireAssignment> findByOrgId(Long orgId);
}
