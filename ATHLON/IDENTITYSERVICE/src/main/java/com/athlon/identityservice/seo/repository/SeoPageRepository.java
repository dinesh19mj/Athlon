package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SeoPageRepository extends JpaRepository<SeoPage, Long> {
    Optional<SeoPage> findByPageKey(String pageKey);
    Optional<SeoPage> findByRoutePattern(String routePattern);
    List<SeoPage> findByPublicationStatus(String publicationStatus);
    List<SeoPage> findByPageType(String pageType);
}
