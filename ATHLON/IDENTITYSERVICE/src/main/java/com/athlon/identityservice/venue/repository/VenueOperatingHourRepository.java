package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueOperatingHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueOperatingHourRepository extends JpaRepository<VenueOperatingHour, Long> {
    List<VenueOperatingHour> findByVenueId(Long venueId);
    void deleteByVenueId(Long venueId);
}
