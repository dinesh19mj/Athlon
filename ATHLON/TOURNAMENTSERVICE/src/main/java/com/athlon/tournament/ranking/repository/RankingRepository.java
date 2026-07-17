package com.athlon.tournament.ranking.repository;

import com.athlon.tournament.ranking.entity.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RankingRepository extends JpaRepository<Ranking, Long> {
    Optional<Ranking> findByUuid(UUID uuid);
    List<Ranking> findByCategoryIdAndIsActiveTrue(Long categoryId);
}
