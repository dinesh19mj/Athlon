package com.athlon.identityservice.seo.repository;

import com.athlon.identityservice.seo.entity.SeoAuditIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeoAuditIssueRepository extends JpaRepository<SeoAuditIssue, Long> {
    List<SeoAuditIssue> findByStatus(String status);
    List<SeoAuditIssue> findBySeverity(String severity);
}
