package com.athlon.tournament.court.repository;

import com.athlon.tournament.court.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    Optional<Court> findByUuid(UUID uuid);
    List<Court> findByVenueIdAndIsActiveTrue(Long venueId);
}
