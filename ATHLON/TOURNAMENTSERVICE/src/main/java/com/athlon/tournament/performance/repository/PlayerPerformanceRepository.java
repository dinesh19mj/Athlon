package com.athlon.tournament.performance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournament.performance.entity.PlayerPerformance;

import java.util.List;

@Repository
public interface PlayerPerformanceRepository extends JpaRepository<PlayerPerformance, Long> {
    List<PlayerPerformance> findByOrgId(Long orgId);
    List<PlayerPerformance> findByOrgIdAndPlayerId(Long orgId, Long playerId);
}
