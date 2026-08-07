package com.athlon.tournamentservice.performance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournamentservice.performance.entity.LeaderboardStats;

import java.util.List;

@Repository
public interface LeaderboardStatsRepository extends JpaRepository<LeaderboardStats, Long> {
    List<LeaderboardStats> findByOrgIdOrderByPointsDesc(Long orgId);
    LeaderboardStats findByOrgIdAndPlayerId(Long orgId, Long playerId);
}

