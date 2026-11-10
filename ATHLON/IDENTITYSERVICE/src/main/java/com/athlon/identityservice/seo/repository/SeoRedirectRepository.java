package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoRedirect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SeoRedirectRepository extends JpaRepository<SeoRedirect, Long> {
    Optional<SeoRedirect> findBySourcePath(String sourcePath);
    List<SeoRedirect> findByEnabledTrue();
}
