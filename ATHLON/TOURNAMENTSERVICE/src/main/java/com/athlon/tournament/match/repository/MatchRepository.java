package com.athlon.tournament.match.repository;

import com.athlon.tournament.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    Optional<Match> findByUuid(UUID uuid);
}
