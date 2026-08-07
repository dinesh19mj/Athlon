package com.athlon.tournamentservice.tournament.repository;

import com.athlon.tournamentservice.tournament.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByUuid(UUID uuid);
    List<Report> findByTournamentIdAndIsActiveTrue(Long tournamentId);
}

