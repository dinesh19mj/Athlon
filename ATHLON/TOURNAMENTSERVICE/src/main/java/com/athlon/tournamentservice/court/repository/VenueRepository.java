package com.athlon.tournamentservice.court.repository;

import com.athlon.tournamentservice.court.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    Optional<Venue> findByVenueUuid(UUID uuid);
    List<Venue> findByCityIdAndIsActiveTrue(Long cityId);
}

