package com.athlon.tournamentservice.streaming.service;

import com.athlon.tournamentservice.streaming.entity.TournamentStreamConfig;
import com.athlon.tournamentservice.streaming.repository.TournamentStreamConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TournamentStreamConfigService {

    private final TournamentStreamConfigRepository repository;

    public TournamentStreamConfigService(TournamentStreamConfigRepository repository) {
        this.repository = repository;
    }

    public List<TournamentStreamConfig> getConfigsByTournament(UUID tournamentUuid) {
        return repository.findByTournamentUuid(tournamentUuid);
    }

    @Transactional
    public List<TournamentStreamConfig> saveConfigs(UUID tournamentUuid, List<TournamentStreamConfig> configs) {
        List<TournamentStreamConfig> existingConfigs = repository.findByTournamentUuid(tournamentUuid);
        
        // Find IDs of incoming configs
        List<Long> incomingIds = configs.stream()
                .filter(c -> c.getId() != null)
                .map(TournamentStreamConfig::getId)
                .toList();
        
        // Delete configs that are no longer present
        for (TournamentStreamConfig existing : existingConfigs) {
            if (!incomingIds.contains(existing.getId())) {
                repository.delete(existing);
            }
        }
        
        // Update or insert incoming configs
        for (TournamentStreamConfig config : configs) {
            config.setTournamentUuid(tournamentUuid);
            if (config.getId() != null) {
                // If it exists, let saveAll handle the update
            }
        }
        
        return repository.saveAll(configs);
    }
}
