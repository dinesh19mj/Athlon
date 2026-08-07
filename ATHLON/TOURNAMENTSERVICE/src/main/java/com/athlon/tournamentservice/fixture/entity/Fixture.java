package com.athlon.tournamentservice.fixture.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "fixtures")
public class Fixture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fixtureid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "fixtureuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "categoryid", nullable = false)
    private Long categoryId;

    @Column(name = "categoryuuid", nullable = false)
    private UUID categoryUuid;

    @Column(name = "roundname", nullable = false)
    private String roundName;

    @Column(name = "roundnumber", nullable = false)
    private Integer roundNumber;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long updatedBy;

    public Fixture() {
    }

    public Fixture(Long categoryId, UUID categoryUuid, String roundName, Integer roundNumber, Long createdBy) {
        this.categoryId = categoryId;
        this.categoryUuid = categoryUuid;
        this.roundName = roundName;
        this.roundNumber = roundNumber;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public UUID getCategoryUuid() { return categoryUuid; }
    public void setCategoryUuid(UUID categoryUuid) { this.categoryUuid = categoryUuid; }
    public String getRoundName() { return roundName; }
    public void setRoundName(String roundName) { this.roundName = roundName; }
    public Integer getRoundNumber() { return roundNumber; }
    public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Fixture fixture = (Fixture) o;
        return Objects.equals(id, fixture.id) && Objects.equals(uuid, fixture.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "Fixture{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", categoryId=" + categoryId +
                ", roundName='" + roundName + '\'' +
                ", roundNumber=" + roundNumber +
                ", isActive=" + isActive +
                '}';
    }
}

