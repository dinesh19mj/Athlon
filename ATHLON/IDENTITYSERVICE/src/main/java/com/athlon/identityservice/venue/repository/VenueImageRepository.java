package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {
    List<VenueImage> findByVenueIdOrderByDisplayOrderAsc(Long venueId);
    void deleteByVenueId(Long venueId);
}
