package com.athlon.identityservice.organization.repository;

import com.athlon.identityservice.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
    Optional<Organization> findByUuid(UUID uuid);
    
    boolean existsByName(String name);
}
