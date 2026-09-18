package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "facility_sports")
public class FacilitySport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "sport_id")
    private Long sportId;

    @Column(name = "sport_name", nullable = false, length = 100)
    private String sportName;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    public FacilitySport() {
    }

    public FacilitySport(Long facilityId, Long sportId, String sportName, Boolean isPrimary) {
        this.facilityId = facilityId;
        this.sportId = sportId;
        this.sportName = sportName;
        this.isPrimary = isPrimary != null ? isPrimary : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public Long getSportId() {
        return sportId;
    }

    public void setSportId(Long sportId) {
        this.sportId = sportId;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }
}
