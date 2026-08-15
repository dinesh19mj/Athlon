package com.athlon.tournamentservice.streaming.repository;

import com.athlon.tournamentservice.streaming.entity.TournamentStreamConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TournamentStreamConfigRepository extends JpaRepository<TournamentStreamConfig, Long> {
    List<TournamentStreamConfig> findByTournamentUuid(UUID tournamentUuid);
    void deleteByTournamentUuid(UUID tournamentUuid);
}
