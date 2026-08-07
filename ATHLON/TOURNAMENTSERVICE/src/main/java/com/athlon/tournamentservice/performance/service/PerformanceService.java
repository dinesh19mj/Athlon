package com.athlon.tournamentservice.performance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournamentservice.performance.entity.LeaderboardStats;
import com.athlon.tournamentservice.performance.entity.PlayerPerformance;
import com.athlon.tournamentservice.performance.repository.LeaderboardStatsRepository;
import com.athlon.tournamentservice.performance.repository.PlayerPerformanceRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PerformanceService {

    @Autowired
    private PlayerPerformanceRepository playerPerformanceRepository;

    @Autowired
    private LeaderboardStatsRepository leaderboardStatsRepository;

    public PlayerPerformance recordPerformance(PlayerPerformance performance) {
        performance.setCreatedOn(LocalDateTime.now());
        return playerPerformanceRepository.save(performance);
    }

    public List<PlayerPerformance> getPerformancesByOrg(Long orgId) {
        return playerPerformanceRepository.findByOrgId(orgId);
    }

    public List<PlayerPerformance> getPerformancesByPlayer(Long orgId, Long playerId) {
        return playerPerformanceRepository.findByOrgIdAndPlayerId(orgId, playerId);
    }

    public LeaderboardStats updateLeaderboardStats(Long orgId, Long playerId, Integer points, Boolean isWin) {
        LeaderboardStats stats = leaderboardStatsRepository.findByOrgIdAndPlayerId(orgId, playerId);
        if (stats == null) {
            stats = new LeaderboardStats();
            stats.setOrgId(orgId);
            stats.setPlayerId(playerId);
            stats.setMatchesPlayed(0);
            stats.setMatchesWon(0);
            stats.setPoints(0);
        }
        
        stats.setMatchesPlayed(stats.getMatchesPlayed() + 1);
        if (isWin) {
            stats.setMatchesWon(stats.getMatchesWon() + 1);
        }
        stats.setPoints(stats.getPoints() + points);
        stats.setModifiedOn(LocalDateTime.now());
        
        return leaderboardStatsRepository.save(stats);
    }

    public List<LeaderboardStats> getLeaderboard(Long orgId) {
        return leaderboardStatsRepository.findByOrgIdOrderByPointsDesc(orgId);
    }
}

