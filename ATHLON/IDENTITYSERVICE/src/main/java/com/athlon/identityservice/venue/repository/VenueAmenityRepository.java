package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueAmenityRepository extends JpaRepository<VenueAmenity, Long> {
    List<VenueAmenity> findByVenueId(Long venueId);
    void deleteByVenueId(Long venueId);
}
