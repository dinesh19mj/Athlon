package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "venue_images")
public class VenueImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "caption")
    private String caption;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_cover")
    private Boolean isCover = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public VenueImage() {
    }

    public VenueImage(Long venueId, String imageUrl, String caption, Integer displayOrder, Boolean isCover) {
        this.venueId = venueId;
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.isCover = isCover != null ? isCover : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsCover() {
        return isCover;
    }

    public void setIsCover(Boolean isCover) {
        this.isCover = isCover;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
