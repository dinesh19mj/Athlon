package com.athlon.tournamentservice.match.repository;

import com.athlon.tournamentservice.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
	
    Optional<Match> findByMatchUuid(UUID uuid);
    
    java.util.List<Match> findByTournamentUuid(UUID tournamentUuid);
    
    void deleteByTournamentUuid(UUID tournamentUuid);
    
    @Query("SELECT m FROM Match m WHERE m.teamARegistrationId \r\n"
    		+ "IN (SELECT r.registrationId FROM Registration r WHERE r.primaryContactId = :userId)\r\n"
    		+ "OR m.teamBRegistrationId IN (SELECT r.registrationId FROM Registration r WHERE r.primaryContactId = :userId)")
    List<Match> findMatchesByUserId(@Param("userId") Long userId);
    
    List<Match> findByUmpirePhone(String umpirePhone);
    
    List<Match> findByNextMatchUuid(UUID nextMatchUuid);
}

