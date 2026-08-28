package com.athlon.identityservice.location.repository;

import com.athlon.identityservice.location.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    
    Optional<District> findByUuid(UUID uuid);
    
    List<District> findByStateId(Long stateId);

    List<District> findByStateUuid(UUID stateUuid);

    Optional<District> findByNameIgnoreCase(String name);
    
    boolean existsByNameAndStateId(String name, Long stateId);
}
