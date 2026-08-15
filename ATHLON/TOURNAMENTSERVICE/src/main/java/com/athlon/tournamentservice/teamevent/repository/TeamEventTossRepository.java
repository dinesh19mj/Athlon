package com.athlon.tournamentservice.teamevent.repository;

import com.athlon.tournamentservice.teamevent.entity.TeamEventToss;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamEventTossRepository extends JpaRepository<TeamEventToss, Long> {
    Optional<TeamEventToss> findByUuid(UUID uuid);
    Optional<TeamEventToss> findByFixtureMatchId(Long fixtureMatchId);
}
