package com.athlon.identityservice.location.repository;

import com.athlon.identityservice.location.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {
    
    Optional<City> findByUuid(UUID uuid);
    
    List<City> findByDistrictId(Long districtId);

    List<City> findByDistrictUuid(UUID districtUuid);

    Optional<City> findByNameIgnoreCase(String name);
    
    boolean existsByNameAndDistrictId(String name, Long districtId);
}
