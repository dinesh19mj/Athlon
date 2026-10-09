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

    List<Organization> findByUserId(Long userId);

    long countByIsActive(Integer isActive);

    long countByType(String type);

    org.springframework.data.domain.Page<Organization> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Organization o WHERE LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    org.springframework.data.domain.Page<Organization> searchByName(@org.springframework.data.repository.query.Param("query") String query, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Organization> findByType(String type, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Organization> findByIsActive(Integer isActive, org.springframework.data.domain.Pageable pageable);
}
