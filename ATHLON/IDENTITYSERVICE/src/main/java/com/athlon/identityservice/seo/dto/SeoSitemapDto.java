package com.athlon.identityservice.seo.dto;

public class SeoSitemapDto {
    private String name;
    private String url;
    private int pageCount;
    private String lastGenerated;
    private String status;
    private String description;

    public SeoSitemapDto() {}

    public SeoSitemapDto(String name, String url, int pageCount, String lastGenerated, String status, String description) {
        this.name = name;
        this.url = url;
        this.pageCount = pageCount;
        this.lastGenerated = lastGenerated;
        this.status = status;
        this.description = description;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public int getPageCount() { return pageCount; }
    public void setPageCount(int pageCount) { this.pageCount = pageCount; }

    public String getLastGenerated() { return lastGenerated; }
    public void setLastGenerated(String lastGenerated) { this.lastGenerated = lastGenerated; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
