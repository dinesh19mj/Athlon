package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoEntityOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SeoEntityOverrideRepository extends JpaRepository<SeoEntityOverride, Long> {
    Optional<SeoEntityOverride> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<SeoEntityOverride> findByEntityType(String entityType);
}
