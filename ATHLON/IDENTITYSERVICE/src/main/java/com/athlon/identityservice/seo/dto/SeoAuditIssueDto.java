package com.athlon.identityservice.seo.dto;

public class SeoAuditIssueDto {
    private String id;
    private String pageRoute;
    private String pageName;
    private String issueType;
    private String severity;
    private String explanation;
    private String recommendedFix;
    private String status;

    public SeoAuditIssueDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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
}
