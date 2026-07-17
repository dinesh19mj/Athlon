package com.athlon.tournament.score.repository;

import com.athlon.tournament.score.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    Optional<Score> findByUuid(UUID uuid);
    Optional<Score> findByMatchIdAndIsActiveTrue(Long matchId);
}
