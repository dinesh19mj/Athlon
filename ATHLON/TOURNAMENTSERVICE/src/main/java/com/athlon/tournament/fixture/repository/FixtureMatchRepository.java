package com.athlon.tournament.fixture.repository;

import com.athlon.tournament.fixture.entity.FixtureMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FixtureMatchRepository extends JpaRepository<FixtureMatch, Long> {
    Optional<FixtureMatch> findByUuid(UUID uuid);
    List<FixtureMatch> findByFixtureIdAndIsActiveTrue(Long fixtureId);
}
