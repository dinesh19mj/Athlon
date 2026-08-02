package com.athlon.identityservice.location.repository;

import com.athlon.identityservice.location.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StateRepository extends JpaRepository<State, Long> {
    
    Optional<State> findByUuid(UUID uuid);
    
    List<State> findByCountryId(Long countryId);
    
    boolean existsByNameAndCountryId(String name, Long countryId);
}
