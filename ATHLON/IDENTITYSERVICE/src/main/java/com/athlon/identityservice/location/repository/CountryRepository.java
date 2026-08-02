package com.athlon.identityservice.location.repository;

import com.athlon.identityservice.location.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {
    
    Optional<Country> findByUuid(UUID uuid);
    
    Optional<Country> findByName(String name);
    
    Optional<Country> findByIsoCode(String isoCode);
    
    boolean existsByName(String name);
    
    boolean existsByIsoCode(String isoCode);
}
