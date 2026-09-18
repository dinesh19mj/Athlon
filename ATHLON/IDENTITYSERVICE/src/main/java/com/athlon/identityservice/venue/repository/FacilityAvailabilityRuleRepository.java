package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.FacilityAvailabilityRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface FacilityAvailabilityRuleRepository extends JpaRepository<FacilityAvailabilityRule, Long> {
    List<FacilityAvailabilityRule> findByFacilityId(Long facilityId);
    List<FacilityAvailabilityRule> findByFacilityIdAndDayOfWeekAndIsActiveTrue(Long facilityId, DayOfWeek dayOfWeek);
    void deleteByFacilityId(Long facilityId);
}
