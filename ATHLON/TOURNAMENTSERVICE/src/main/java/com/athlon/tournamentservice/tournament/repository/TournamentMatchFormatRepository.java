package com.athlon.tournamentservice.tournament.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.athlon.tournamentservice.tournament.entity.TournamentMatchFormat;

@Repository
public interface TournamentMatchFormatRepository extends JpaRepository<TournamentMatchFormat, Long> {

    Optional<TournamentMatchFormat> findByFormatUuid(UUID formatUuid);

    List<TournamentMatchFormat> findBySportTypeIgnoreCaseAndIsActiveOrderByDisplayOrderAsc(String sportType, Integer isActive);

    List<TournamentMatchFormat> findByIsActiveOrderByDisplayOrderAsc(Integer isActive);

    boolean existsBySportTypeIgnoreCaseAndFormatNameIgnoreCase(String sportType, String formatName);
}
