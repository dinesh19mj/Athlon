package com.athlon.tournamentservice.facility.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.tournamentservice.facility.entity.Booking;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByFacilityId(Long facilityId);
    List<Booking> findByOrgId(Long orgId);
}

