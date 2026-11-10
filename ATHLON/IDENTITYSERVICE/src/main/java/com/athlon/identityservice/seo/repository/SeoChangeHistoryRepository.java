package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeoChangeHistoryRepository extends JpaRepository<SeoChangeHistory, Long> {
    List<SeoChangeHistory> findTop50ByOrderByChangedAtDesc();
    List<SeoChangeHistory> findByEntityTypeOrderByChangedAtDesc(String entityType);
}
