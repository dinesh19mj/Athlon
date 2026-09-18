package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.FacilitySport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilitySportRepository extends JpaRepository<FacilitySport, Long> {
    List<FacilitySport> findByFacilityId(Long facilityId);
    void deleteByFacilityId(Long facilityId);
}
