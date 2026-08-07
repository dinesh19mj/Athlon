package com.athlon.tournamentservice.score.repository;

import com.athlon.tournamentservice.score.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    Optional<Score> findByScoreUuid(UUID scoreUuid);
    Optional<Score> findByMatchIdAndIsActiveTrue(Long matchId);
}

