package com.athlon.identityservice.community.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.identityservice.community.enums.CommunityMemberStatus;
import com.athlon.identityservice.community.enums.CommunityRole;

public class CommunityMemberDto {

    private Long communityMemberId;
    private UUID communityMemberUuid;
    private UUID communityUuid;
    private Long userId;
    private UUID userUuid;
    private String userName;
    private String userAvatar;
    private CommunityRole role;
    private CommunityMemberStatus status;
    private Integer sessionsJoined;
    private Integer matchesPlayed;
    private Double attendancePercentage;
    private String requestMessage;
    private LocalDateTime joinedAt;

    public CommunityMemberDto() {
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
}
