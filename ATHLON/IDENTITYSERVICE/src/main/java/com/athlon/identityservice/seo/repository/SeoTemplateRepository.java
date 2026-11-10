package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SeoTemplateRepository extends JpaRepository<SeoTemplate, Long> {
    Optional<SeoTemplate> findByEntityType(String entityType);
    List<SeoTemplate> findByEnabledTrue();
}
