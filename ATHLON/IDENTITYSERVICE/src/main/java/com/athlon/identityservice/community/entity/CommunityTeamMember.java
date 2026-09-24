package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "community_team_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "user_uuid"})
})
public class CommunityTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_member_id", updatable = false, nullable = false)
    private Long teamMemberId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "team_uuid", nullable = false)
    private UUID teamUuid;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "user_avatar", length = 500)
    private String userAvatar;

    @Column(name = "role_in_team", length = 50)
    private String roleInTeam = "PLAYER"; // CAPTAIN, VICE_CAPTAIN, PLAYER

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    public CommunityTeamMember() {
    }

    public CommunityTeamMember(Long teamId, UUID teamUuid, UUID userUuid, Long userId, String userName, String userAvatar, String roleInTeam) {
        this.teamId = teamId;
        this.teamUuid = teamUuid;
        this.userUuid = userUuid;
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.roleInTeam = roleInTeam != null ? roleInTeam : "PLAYER";
    }

    public Long getTeamMemberId() {
        return teamMemberId;
    }

    public void setTeamMemberId(Long teamMemberId) {
        this.teamMemberId = teamMemberId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public UUID getTeamUuid() {
        return teamUuid;
    }

    public void setTeamUuid(UUID teamUuid) {
        this.teamUuid = teamUuid;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getRoleInTeam() {
        return roleInTeam;
    }

    public void setRoleInTeam(String roleInTeam) {
        this.roleInTeam = roleInTeam;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
