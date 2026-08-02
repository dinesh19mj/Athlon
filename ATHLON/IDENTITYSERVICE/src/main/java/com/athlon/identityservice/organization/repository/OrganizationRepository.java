package com.athlon.identityservice.organization.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athlon.identityservice.organization.model.Organization;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Organization findByOrgUuid(UUID orgUuid);
}
