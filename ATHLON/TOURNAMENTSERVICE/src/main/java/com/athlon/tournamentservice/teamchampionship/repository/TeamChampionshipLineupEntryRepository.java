package com.athlon.tournamentservice.teamchampionship.repository;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipLineupEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamChampionshipLineupEntryRepository extends JpaRepository<TeamChampionshipLineupEntry, Long> {
    List<TeamChampionshipLineupEntry> findByLineupId(Long lineupId);
    List<TeamChampionshipLineupEntry> findByLineupIdAndEventId(Long lineupId, Long eventId);
    void deleteByLineupId(Long lineupId);
}
