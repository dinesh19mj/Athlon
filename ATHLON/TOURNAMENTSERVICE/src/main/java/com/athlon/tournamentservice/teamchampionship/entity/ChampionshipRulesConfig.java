package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "championship_rules_config")
public class ChampionshipRulesConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id", updatable = false, nullable = false)
    private Long configId;

    @Column(name = "config_uuid", updatable = false, nullable = false, unique = true)
    private UUID configUuid;

    @Column(name = "championship_id", nullable = false, unique = true)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false, unique = true)
    private UUID championshipUuid;

    @Column(name = "min_squad_size")
    private Integer minSquadSize = 6;

    @Column(name = "max_squad_size")
    private Integer maxSquadSize = 12;

    @Column(name = "every_player_must_play_league")
    private Boolean everyPlayerMustPlayLeague = false;

    @Column(name = "allow_substitutions")
    private Boolean allowSubstitutions = true;

    // League Stage Rules
    @Column(name = "league_match_format")
    private String leagueMatchFormat = "PLAY_ALL"; // "PLAY_ALL", "BEST_OF_N"

    @Column(name = "league_win_points")
    private Integer leagueWinPoints = 2;

    @Column(name = "league_draw_points")
    private Integer leagueDrawPoints = 1;

    @Column(name = "league_loss_points")
    private Integer leagueLossPoints = 0;

    @Column(name = "league_lineup_deadline_minutes")
    private Integer leagueLineupDeadlineMinutes = 30;

    @Column(name = "league_toss_order_rule")
    private String leagueTossOrderRule = "ORGANIZER_DEFINED"; // "ORGANIZER_DEFINED", "TEAM_PREFERENCE_PLUS_TOSS"

    @Column(name = "league_lineup_reveal_policy")
    private String leagueLineupRevealPolicy = "SIMULTANEOUS_REVEAL"; // "SIMULTANEOUS_REVEAL", "AFTER_APPROVAL"

    @Column(name = "league_max_substitutions")
    private Integer leagueMaxSubstitutions = 2;

    // Knockout Stage Rules
    @Column(name = "knockout_match_format")
    private String knockoutMatchFormat = "BEST_OF_N"; // "PLAY_ALL", "BEST_OF_N"

    @Column(name = "knockout_lineup_deadline_minutes")
    private Integer knockoutLineupDeadlineMinutes = 30;

    @Column(name = "knockout_toss_order_rule")
    private String knockoutTossOrderRule = "TEAM_PREFERENCE_PLUS_TOSS"; // "ORGANIZER_DEFINED", "TEAM_PREFERENCE_PLUS_TOSS"

    @Column(name = "knockout_lineup_reveal_policy")
    private String knockoutLineupRevealPolicy = "SIMULTANEOUS_REVEAL"; // "SIMULTANEOUS_REVEAL", "AFTER_APPROVAL"

    @Column(name = "knockout_max_substitutions")
    private Integer knockoutMaxSubstitutions = 1;

    // Legacy Fallback Columns
    @Column(name = "lineup_deadline_minutes")
    private Integer lineupDeadlineMinutes = 30;

    @Column(name = "toss_order_rule")
    private String tossOrderRule = "ORGANIZER_DEFINED";

    @Column(name = "lineup_reveal_policy")
    private String lineupRevealPolicy = "SIMULTANEOUS_REVEAL";

    @Column(name = "max_substitutions_per_fixture")
    private Integer maxSubstitutionsPerFixture = 2;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.configUuid == null) {
            this.configUuid = UUID.randomUUID();
        }
        if (this.minSquadSize == null) this.minSquadSize = 6;
        if (this.maxSquadSize == null) this.maxSquadSize = 12;
        if (this.everyPlayerMustPlayLeague == null) this.everyPlayerMustPlayLeague = false;
        if (this.allowSubstitutions == null) this.allowSubstitutions = true;

        if (this.leagueMatchFormat == null) this.leagueMatchFormat = "PLAY_ALL";
        if (this.leagueWinPoints == null) this.leagueWinPoints = 2;
        if (this.leagueDrawPoints == null) this.leagueDrawPoints = 1;
        if (this.leagueLossPoints == null) this.leagueLossPoints = 0;
        if (this.leagueLineupDeadlineMinutes == null) this.leagueLineupDeadlineMinutes = (this.lineupDeadlineMinutes != null ? this.lineupDeadlineMinutes : 30);
        if (this.leagueTossOrderRule == null) this.leagueTossOrderRule = (this.tossOrderRule != null ? this.tossOrderRule : "ORGANIZER_DEFINED");
        if (this.leagueLineupRevealPolicy == null) this.leagueLineupRevealPolicy = (this.lineupRevealPolicy != null ? this.lineupRevealPolicy : "SIMULTANEOUS_REVEAL");
        if (this.leagueMaxSubstitutions == null) this.leagueMaxSubstitutions = (this.maxSubstitutionsPerFixture != null ? this.maxSubstitutionsPerFixture : 2);

        if (this.knockoutMatchFormat == null) this.knockoutMatchFormat = "BEST_OF_N";
        if (this.knockoutLineupDeadlineMinutes == null) this.knockoutLineupDeadlineMinutes = (this.lineupDeadlineMinutes != null ? this.lineupDeadlineMinutes : 30);
        if (this.knockoutTossOrderRule == null) this.knockoutTossOrderRule = "TEAM_PREFERENCE_PLUS_TOSS";
        if (this.knockoutLineupRevealPolicy == null) this.knockoutLineupRevealPolicy = (this.lineupRevealPolicy != null ? this.lineupRevealPolicy : "SIMULTANEOUS_REVEAL");
        if (this.knockoutMaxSubstitutions == null) this.knockoutMaxSubstitutions = 1;

        if (this.lineupDeadlineMinutes == null) this.lineupDeadlineMinutes = this.leagueLineupDeadlineMinutes;
        if (this.tossOrderRule == null) this.tossOrderRule = this.leagueTossOrderRule;
        if (this.lineupRevealPolicy == null) this.lineupRevealPolicy = this.leagueLineupRevealPolicy;
        if (this.maxSubstitutionsPerFixture == null) this.maxSubstitutionsPerFixture = this.leagueMaxSubstitutions;
    }

    public ChampionshipRulesConfig() {}

    public Long getConfigId() { return configId; }
    public void setConfigId(Long configId) { this.configId = configId; }

    public UUID getConfigUuid() { return configUuid; }
    public void setConfigUuid(UUID configUuid) { this.configUuid = configUuid; }

    public Long getChampionshipId() { return championshipId; }
    public void setChampionshipId(Long championshipId) { this.championshipId = championshipId; }

    public UUID getChampionshipUuid() { return championshipUuid; }
    public void setChampionshipUuid(UUID championshipUuid) { this.championshipUuid = championshipUuid; }

    public Integer getMinSquadSize() { return minSquadSize; }
    public void setMinSquadSize(Integer minSquadSize) { this.minSquadSize = minSquadSize; }

    public Integer getMaxSquadSize() { return maxSquadSize; }
    public void setMaxSquadSize(Integer maxSquadSize) { this.maxSquadSize = maxSquadSize; }

    public Boolean getEveryPlayerMustPlayLeague() { return everyPlayerMustPlayLeague; }
    public void setEveryPlayerMustPlayLeague(Boolean everyPlayerMustPlayLeague) { this.everyPlayerMustPlayLeague = everyPlayerMustPlayLeague; }

    public Boolean getAllowSubstitutions() { return allowSubstitutions; }
    public void setAllowSubstitutions(Boolean allowSubstitutions) { this.allowSubstitutions = allowSubstitutions; }

    public String getLeagueMatchFormat() { return leagueMatchFormat; }
    public void setLeagueMatchFormat(String leagueMatchFormat) { this.leagueMatchFormat = leagueMatchFormat; }

    public Integer getLeagueWinPoints() { return leagueWinPoints; }
    public void setLeagueWinPoints(Integer leagueWinPoints) { this.leagueWinPoints = leagueWinPoints; }

    public Integer getLeagueDrawPoints() { return leagueDrawPoints; }
    public void setLeagueDrawPoints(Integer leagueDrawPoints) { this.leagueDrawPoints = leagueDrawPoints; }

    public Integer getLeagueLossPoints() { return leagueLossPoints; }
    public void setLeagueLossPoints(Integer leagueLossPoints) { this.leagueLossPoints = leagueLossPoints; }

    public Integer getLeagueLineupDeadlineMinutes() { return leagueLineupDeadlineMinutes; }
    public void setLeagueLineupDeadlineMinutes(Integer leagueLineupDeadlineMinutes) { this.leagueLineupDeadlineMinutes = leagueLineupDeadlineMinutes; }

    public String getLeagueTossOrderRule() { return leagueTossOrderRule; }
    public void setLeagueTossOrderRule(String leagueTossOrderRule) { this.leagueTossOrderRule = leagueTossOrderRule; }

    public String getLeagueLineupRevealPolicy() { return leagueLineupRevealPolicy; }
    public void setLeagueLineupRevealPolicy(String leagueLineupRevealPolicy) { this.leagueLineupRevealPolicy = leagueLineupRevealPolicy; }

    public Integer getLeagueMaxSubstitutions() { return leagueMaxSubstitutions; }
    public void setLeagueMaxSubstitutions(Integer leagueMaxSubstitutions) { this.leagueMaxSubstitutions = leagueMaxSubstitutions; }

    public String getKnockoutMatchFormat() { return knockoutMatchFormat; }
    public void setKnockoutMatchFormat(String knockoutMatchFormat) { this.knockoutMatchFormat = knockoutMatchFormat; }

    public Integer getKnockoutLineupDeadlineMinutes() { return knockoutLineupDeadlineMinutes; }
    public void setKnockoutLineupDeadlineMinutes(Integer knockoutLineupDeadlineMinutes) { this.knockoutLineupDeadlineMinutes = knockoutLineupDeadlineMinutes; }

    public String getKnockoutTossOrderRule() { return knockoutTossOrderRule; }
    public void setKnockoutTossOrderRule(String knockoutTossOrderRule) { this.knockoutTossOrderRule = knockoutTossOrderRule; }

    public String getKnockoutLineupRevealPolicy() { return knockoutLineupRevealPolicy; }
    public void setKnockoutLineupRevealPolicy(String knockoutLineupRevealPolicy) { this.knockoutLineupRevealPolicy = knockoutLineupRevealPolicy; }

    public Integer getKnockoutMaxSubstitutions() { return knockoutMaxSubstitutions; }
    public void setKnockoutMaxSubstitutions(Integer knockoutMaxSubstitutions) { this.knockoutMaxSubstitutions = knockoutMaxSubstitutions; }

    public Integer getLineupDeadlineMinutes() { return lineupDeadlineMinutes; }
    public void setLineupDeadlineMinutes(Integer lineupDeadlineMinutes) { this.lineupDeadlineMinutes = lineupDeadlineMinutes; }

    public String getTossOrderRule() { return tossOrderRule; }
    public void setTossOrderRule(String tossOrderRule) { this.tossOrderRule = tossOrderRule; }

    public String getLineupRevealPolicy() { return lineupRevealPolicy; }
    public void setLineupRevealPolicy(String lineupRevealPolicy) { this.lineupRevealPolicy = lineupRevealPolicy; }

    public Integer getMaxSubstitutionsPerFixture() { return maxSubstitutionsPerFixture; }
    public void setMaxSubstitutionsPerFixture(Integer maxSubstitutionsPerFixture) { this.maxSubstitutionsPerFixture = maxSubstitutionsPerFixture; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
