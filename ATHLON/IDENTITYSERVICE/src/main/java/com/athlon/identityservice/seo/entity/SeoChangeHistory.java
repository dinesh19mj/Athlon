package com.athlon.identityservice.seo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seo_change_history")
public class SeoChangeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", length = 50, nullable = false)
    private String entityType;

    @Column(name = "entity_id", length = 100)
    private String entityId;

    @Column(name = "entity_name")
    private String entityName;

    @Column(name = "action", length = 50, nullable = false)
    private String action;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "old_values_json", columnDefinition = "TEXT")
    private String oldValuesJson;

    @Column(name = "new_values_json", columnDefinition = "TEXT")
    private String newValuesJson;

    @Column(name = "changed_by", length = 100)
    private String changedBy = "Super Admin";

    @Column(name = "changed_at")
    private LocalDateTime changedAt = LocalDateTime.now();

    public SeoChangeHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getOldValuesJson() { return oldValuesJson; }
    public void setOldValuesJson(String oldValuesJson) { this.oldValuesJson = oldValuesJson; }

    public String getNewValuesJson() { return newValuesJson; }
    public void setNewValuesJson(String newValuesJson) { this.newValuesJson = newValuesJson; }

    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }

    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
