package com.athlon.tournamentservice.teamevent.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_event_config")
public class TeamEventConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Column(name = "tournamentid", nullable = false, unique = true)
    private Long tournamentId;

    @Column(name = "tournamentuuid", nullable = false, unique = true)
    private UUID tournamentUuid;

    // "Must play at least one match" vs "Freely selectable"
    @Column(name = "league_participation_rule")
    private String leagueParticipationRule = "FREELY_SELECTABLE"; 

    // ORGANIZER_CONTROLLED or TEAM_PREFERENCE_TOSS
    @Column(name = "knockout_category_order_rule")
    private String knockoutCategoryOrderRule = "ORGANIZER_CONTROLLED";

    // Scoring
    @Column(name = "category_win_points")
    private Integer categoryWinPoints = 1;

    @Column(name = "overall_win_points")
    private Integer overallWinPoints = 3;

    @Column(name = "overall_draw_points")
    private Integer overallDrawPoints = 1;

    @Column(name = "overall_loss_points")
    private Integer overallLossPoints = 0;

    @Column(name = "players_per_team")
    private Integer playersPerTeam = 12;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TeamEventConfig() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }

    public UUID getTournamentUuid() { return tournamentUuid; }
    public void setTournamentUuid(UUID tournamentUuid) { this.tournamentUuid = tournamentUuid; }

    public String getLeagueParticipationRule() { return leagueParticipationRule; }
    public void setLeagueParticipationRule(String leagueParticipationRule) { this.leagueParticipationRule = leagueParticipationRule; }

    public String getKnockoutCategoryOrderRule() { return knockoutCategoryOrderRule; }
    public void setKnockoutCategoryOrderRule(String knockoutCategoryOrderRule) { this.knockoutCategoryOrderRule = knockoutCategoryOrderRule; }

    public Integer getCategoryWinPoints() { return categoryWinPoints; }
    public void setCategoryWinPoints(Integer categoryWinPoints) { this.categoryWinPoints = categoryWinPoints; }

    public Integer getOverallWinPoints() { return overallWinPoints; }
    public void setOverallWinPoints(Integer overallWinPoints) { this.overallWinPoints = overallWinPoints; }

    public Integer getOverallDrawPoints() { return overallDrawPoints; }
    public void setOverallDrawPoints(Integer overallDrawPoints) { this.overallDrawPoints = overallDrawPoints; }

    public Integer getOverallLossPoints() { return overallLossPoints; }
    public void setOverallLossPoints(Integer overallLossPoints) { this.overallLossPoints = overallLossPoints; }

    public Integer getPlayersPerTeam() { return playersPerTeam; }
    public void setPlayersPerTeam(Integer playersPerTeam) { this.playersPerTeam = playersPerTeam; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
