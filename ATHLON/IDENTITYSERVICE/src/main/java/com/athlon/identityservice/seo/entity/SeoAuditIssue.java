package com.athlon.identityservice.seo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seo_audit_issues")
public class SeoAuditIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "page_route", nullable = false)
    private String pageRoute;

    @Column(name = "page_name", nullable = false)
    private String pageName;

    @Column(name = "issue_type", nullable = false)
    private String issueType;

    @Column(name = "severity", length = 50, nullable = false)
    private String severity = "WARNING";

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "recommended_fix", columnDefinition = "TEXT")
    private String recommendedFix;

    @Column(name = "status", length = 50, nullable = false)
    private String status = "OPEN";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public SeoAuditIssue() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPageRoute() { return pageRoute; }
    public void setPageRoute(String pageRoute) { this.pageRoute = pageRoute; }

    public String getPageName() { return pageName; }
    public void setPageName(String pageName) { this.pageName = pageName; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getRecommendedFix() { return recommendedFix; }
    public void setRecommendedFix(String recommendedFix) { this.recommendedFix = recommendedFix; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
