package com.athlon.identityservice.organization.repository;

import com.athlon.identityservice.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
	Optional<Organization> findByOrganizationUuid(UUID organizationUuid);

    Optional<Organization> findByName(String name);

    boolean existsByName(String name);

    List<Organization> findByUserUuid(UUID userUuid);
}
