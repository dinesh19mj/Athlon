package com.athlon.identityservice.venue.repository;

import com.athlon.identityservice.venue.entity.FacilityPricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityPricingRuleRepository extends JpaRepository<FacilityPricingRule, Long> {
    List<FacilityPricingRule> findByFacilityId(Long facilityId);
    List<FacilityPricingRule> findByFacilityIdAndIsActiveTrueOrderByPriorityDesc(Long facilityId);
    void deleteByFacilityId(Long facilityId);
}
