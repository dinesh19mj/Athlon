package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoGlobalSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SeoGlobalSettingsRepository extends JpaRepository<SeoGlobalSettings, Long> {
    Optional<SeoGlobalSettings> findFirstByOrderByIdAsc();
}
