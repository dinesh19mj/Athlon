package com.athlon.tournament.score.repository;

import com.athlon.tournament.score.entity.ScoreEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreEventRepository extends JpaRepository<ScoreEvent, Long> {
    Optional<ScoreEvent> findByUuid(UUID uuid);
    List<ScoreEvent> findByScoreIdAndIsActiveTrue(Long scoreId);
}
