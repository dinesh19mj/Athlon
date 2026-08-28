package com.athlon.identityservice.user.repository;

import com.athlon.identityservice.user.entity.SportsProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SportsProfileRepository extends JpaRepository<SportsProfile, Long> {

    Optional<SportsProfile> findBySportsProfileUuid(UUID sportsProfileUuid);

    List<SportsProfile> findByUserId(Long userId);

    List<SportsProfile> findByUserUuid(UUID userUuid);

    Optional<SportsProfile> findByUserUuidAndSportName(UUID userUuid, String sportName);

    @Query("SELECT COUNT(s) FROM SportsProfile s WHERE s.sportName = :sportName AND s.isActive = 1 AND (s.eloRating > :eloRating OR (s.eloRating = :eloRating AND s.matchesWon > :matchesWon))")
    long countHigherRankedPlayers(@Param("sportName") String sportName, @Param("eloRating") Integer eloRating, @Param("matchesWon") Integer matchesWon);

    @Query("SELECT s FROM SportsProfile s WHERE s.sportName = :sportName AND s.isActive = 1 ORDER BY s.eloRating DESC, s.matchesWon DESC")
    List<SportsProfile> findTopRankedProfiles(@Param("sportName") String sportName);
}
