package com.athlon.tournament.performance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournament.performance.entity.LeaderboardStats;
import com.athlon.tournament.performance.entity.PlayerPerformance;
import com.athlon.tournament.performance.service.PerformanceService;

import java.util.List;

@RestController
@RequestMapping("/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @PostMapping("/add")
    public ResponseEntity<PlayerPerformance> recordPerformance(@RequestBody PlayerPerformance performance) {
        try {
            PlayerPerformance saved = performanceService.recordPerformance(performance);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<PlayerPerformance>> getPerformancesByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<PlayerPerformance> performances = performanceService.getPerformancesByOrg(orgId);
            return new ResponseEntity<>(performances, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/leaderboard/update")
    public ResponseEntity<LeaderboardStats> updateLeaderboardStats(
            @RequestParam("orgId") Long orgId,
            @RequestParam("playerId") Long playerId,
            @RequestParam("points") Integer points,
            @RequestParam("isWin") Boolean isWin) {
        try {
            LeaderboardStats stats = performanceService.updateLeaderboardStats(orgId, playerId, points, isWin);
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/leaderboard/org/{orgId}")
    public ResponseEntity<List<LeaderboardStats>> getLeaderboard(@PathVariable("orgId") Long orgId) {
        try {
            List<LeaderboardStats> leaderboard = performanceService.getLeaderboard(orgId);
            return new ResponseEntity<>(leaderboard, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
