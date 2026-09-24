package com.athlon.marketplaceservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "marketplace_categories")
public class MarketplaceCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    private String sport; // "Badminton", "Cricket", "Football", "All", etc.
    private String iconName; // "Sparkles", "Activity", "ShieldCheck", etc.
    private Integer displayOrder = 0;
    private Boolean active = true;

    public MarketplaceCategory() {}

    public MarketplaceCategory(String slug, String name, String sport, String iconName, Integer displayOrder) {
        this.slug = slug;
        this.name = name;
        this.sport = sport;
        this.iconName = iconName;
        this.displayOrder = displayOrder;
        this.active = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
