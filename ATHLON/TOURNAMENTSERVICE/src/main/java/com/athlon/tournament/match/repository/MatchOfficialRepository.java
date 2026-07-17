package com.athlon.tournament.match.repository;

import com.athlon.tournament.match.entity.MatchOfficial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MatchOfficialRepository extends JpaRepository<MatchOfficial, Long> {
    Optional<MatchOfficial> findByUuid(UUID uuid);
    List<MatchOfficial> findByMatchIdAndIsActiveTrue(Long matchId);
}
