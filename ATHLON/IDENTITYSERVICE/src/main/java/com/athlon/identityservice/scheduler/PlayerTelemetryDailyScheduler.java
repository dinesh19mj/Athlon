package com.athlon.identityservice.scheduler;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.athlon.identityservice.user.entity.SportsProfile;
import com.athlon.identityservice.user.repository.SportsProfileRepository;

@Component
public class PlayerTelemetryDailyScheduler {

    private static final Logger log = LoggerFactory.getLogger(PlayerTelemetryDailyScheduler.class);

    private final SportsProfileRepository sportsProfileRepository;

    public PlayerTelemetryDailyScheduler(SportsProfileRepository sportsProfileRepository) {
        this.sportsProfileRepository = sportsProfileRepository;
    }

    /**
     * Daily scheduler running at 02:00 AM to aggregate and refresh player telemetry,
     * win rates, and ranking metrics across public tournaments and championships.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void syncDailyPlayerTelemetry() {
        log.info("Starting Daily Player Telemetry & Match Statistics Synchronization Job...");
        
        List<SportsProfile> profiles = sportsProfileRepository.findAll();
        int updatedCount = 0;

        for (SportsProfile sp : profiles) {
            int total = sp.getTotalMatches() != null ? sp.getTotalMatches() : 0;
            int won = sp.getMatchesWon() != null ? sp.getMatchesWon() : 0;

            if (total > 0) {
                double winRate = ((double) won / total) * 100.0;
                sp.setWinRate(Math.round(winRate * 10.0) / 10.0);
            } else {
                sp.setWinRate(0.0);
                sp.setEloRating(0);
                sp.setHighestElo(0);
            }
            
            sportsProfileRepository.save(sp);
            updatedCount++;
        }

        log.info("Daily Player Telemetry Sync Job completed successfully. Processed {} sports profiles.", updatedCount);
    }
}
