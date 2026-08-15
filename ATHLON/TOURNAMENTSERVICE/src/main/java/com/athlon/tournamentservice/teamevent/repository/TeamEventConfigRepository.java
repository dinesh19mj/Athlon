package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventConfigRepository extends JpaRepository<TeamEventConfig, Long> {
    Optional<TeamEventConfig> findByUuid(UUID uuid);
    Optional<TeamEventConfig> findByTournamentId(Long tournamentId);
}
