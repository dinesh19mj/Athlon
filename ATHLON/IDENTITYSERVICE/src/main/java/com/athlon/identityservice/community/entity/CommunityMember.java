package com.athlon.identityservice.community.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.identityservice.community.enums.CommunityMemberStatus;
import com.athlon.identityservice.community.enums.CommunityRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "community_members")
public class CommunityMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "community_member_id", updatable = false, nullable = false)
    private Long communityMemberId;

    @Column(name = "community_member_uuid", updatable = false, nullable = false, unique = true)
    private UUID communityMemberUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(name = "user_avatar", length = 500)
    private String userAvatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 40)
    private CommunityRole role = CommunityRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private CommunityMemberStatus status = CommunityMemberStatus.ACTIVE;

    @Column(name = "sessions_joined", nullable = false)
    private Integer sessionsJoined = 0;

    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed = 0;

    @Column(name = "attendance_percentage")
    private Double attendancePercentage = 100.0;

    @Column(name = "invited_by_user_uuid")
    private UUID invitedByUserUuid;

    @Column(name = "request_message", length = 500)
    private String requestMessage;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityMember() {
    }

    @PrePersist
    public void prePersist() {
        if (communityMemberUuid == null) {
            communityMemberUuid = UUID.randomUUID();
        }
        if (role == null) role = CommunityRole.MEMBER;
        if (status == null) status = CommunityMemberStatus.ACTIVE;
        if (sessionsJoined == null) sessionsJoined = 0;
        if (matchesPlayed == null) matchesPlayed = 0;
        if (attendancePercentage == null) attendancePercentage = 100.0;
    }

    public Long getCommunityMemberId() {
        return communityMemberId;
    }

    public void setCommunityMemberId(Long communityMemberId) {
        this.communityMemberId = communityMemberId;
    }

    public UUID getCommunityMemberUuid() {
        return communityMemberUuid;
    }

    public void setCommunityMemberUuid(UUID communityMemberUuid) {
        this.communityMemberUuid = communityMemberUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
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

    public CommunityRole getRole() {
        return role;
    }

    public void setRole(CommunityRole role) {
        this.role = role;
    }

    public CommunityMemberStatus getStatus() {
        return status;
    }

    public void setStatus(CommunityMemberStatus status) {
        this.status = status;
    }

    public Integer getSessionsJoined() {
        return sessionsJoined;
    }

    public void setSessionsJoined(Integer sessionsJoined) {
        this.sessionsJoined = sessionsJoined;
    }

    public Integer getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(Integer matchesPlayed) {
        this.matchesPlayed = matchesPlayed;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public UUID getInvitedByUserUuid() {
        return invitedByUserUuid;
    }

    public void setInvitedByUserUuid(UUID invitedByUserUuid) {
        this.invitedByUserUuid = invitedByUserUuid;
    }

    public String getRequestMessage() {
        return requestMessage;
    }

    public void setRequestMessage(String requestMessage) {
        this.requestMessage = requestMessage;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
