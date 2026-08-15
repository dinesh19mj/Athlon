package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.match.entity.Match;

import java.time.LocalDateTime;
import java.util.UUID;

public class MatchResponse {

	private Long id;
	private UUID uuid;
	private Long tournamentId;
	private UUID tournamentUuid;
	private Long teamARegistrationId;
	private UUID teamARegistrationUuid;
	private Long teamBRegistrationId;
	private UUID teamBRegistrationUuid;
	private String teamAName;
	private String teamBName;
	private Long courtId;
	private LocalDateTime scheduledTime;
	private String status;
	private Long winnerRegistrationId;
	private UUID winnerRegistrationUuid;
	private UUID nextMatchUuid;
	private String umpirePhone;
	private Long poolId;
	private String poolName;
	
	private String teamALineupStatus;
	private String teamBLineupStatus;
	
	private String tournamentName;
	private String courtName;
	private String sportType;
	private String tournamentType;

	public MatchResponse() {
	}

	public static MatchResponse fromEntity(Match match) {
		if (match == null)
			return null;
		MatchResponse response = new MatchResponse();
		response.setId(match.getMatchId());
		response.setUuid(match.getMatchUuid());
		response.setTournamentId(match.getTournamentId());
		response.setTournamentUuid(match.getTournamentUuid());
		response.setTeamARegistrationId(match.getTeamARegistrationId());
		response.setTeamARegistrationUuid(match.getTeamARegistrationUuid());
		response.setTeamBRegistrationId(match.getTeamBRegistrationId());
		response.setTeamBRegistrationUuid(match.getTeamBRegistrationUuid());
		response.setCourtId(match.getCourtId());
		response.setScheduledTime(match.getScheduledTime());
		response.setStatus(match.getStatus());
		response.setWinnerRegistrationId(match.getWinnerRegistrationId());
		response.setWinnerRegistrationUuid(match.getWinnerRegistrationUuid());
		response.setNextMatchUuid(match.getNextMatchUuid());
		response.setUmpirePhone(match.getUmpirePhone());
		response.setPoolId(match.getPoolId());
		response.setPoolName(match.getPoolName());
		return response;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public UUID getUuid() {
		return uuid;
	}

	public void setUuid(UUID uuid) {
		this.uuid = uuid;
	}

	public Long getTeamARegistrationId() {
		return teamARegistrationId;
	}

	public void setTeamARegistrationId(Long teamARegistrationId) {
		this.teamARegistrationId = teamARegistrationId;
	}

	public Long getTeamBRegistrationId() {
		return teamBRegistrationId;
	}

	public void setTeamBRegistrationId(Long teamBRegistrationId) {
		this.teamBRegistrationId = teamBRegistrationId;
	}

	public String getTeamAName() {
		return teamAName;
	}

	public void setTeamAName(String teamAName) {
		this.teamAName = teamAName;
	}

	public String getTeamBName() {
		return teamBName;
	}

	public void setTeamBName(String teamBName) {
		this.teamBName = teamBName;
	}

	public Long getCourtId() {
		return courtId;
	}

	public void setCourtId(Long courtId) {
		this.courtId = courtId;
	}

	public LocalDateTime getScheduledTime() {
		return scheduledTime;
	}

	public void setScheduledTime(LocalDateTime scheduledTime) {
		this.scheduledTime = scheduledTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getWinnerRegistrationId() {
		return winnerRegistrationId;
	}

	public void setWinnerRegistrationId(Long winnerRegistrationId) {
		this.winnerRegistrationId = winnerRegistrationId;
	}

	public UUID getTeamARegistrationUuid() {
		return teamARegistrationUuid;
	}

	public void setTeamARegistrationUuid(UUID teamARegistrationUuid) {
		this.teamARegistrationUuid = teamARegistrationUuid;
	}

	public UUID getTeamBRegistrationUuid() {
		return teamBRegistrationUuid;
	}

	public void setTeamBRegistrationUuid(UUID teamBRegistrationUuid) {
		this.teamBRegistrationUuid = teamBRegistrationUuid;
	}

	public UUID getWinnerRegistrationUuid() {
		return winnerRegistrationUuid;
	}

	public void setWinnerRegistrationUuid(UUID winnerRegistrationUuid) {
		this.winnerRegistrationUuid = winnerRegistrationUuid;
	}

	public UUID getNextMatchUuid() {
		return nextMatchUuid;
	}

	public void setNextMatchUuid(UUID nextMatchUuid) {
		this.nextMatchUuid = nextMatchUuid;
	}

	public String getUmpirePhone() {
		return umpirePhone;
	}

	public void setUmpirePhone(String umpirePhone) {
		this.umpirePhone = umpirePhone;
	}

	public Long getPoolId() {
		return poolId;
	}

	public void setPoolId(Long poolId) {
		this.poolId = poolId;
	}

	public String getPoolName() {
		return poolName;
	}

	public void setPoolName(String poolName) {
		this.poolName = poolName;
	}

	public Long getTournamentId() {
		return tournamentId;
	}

	public void setTournamentId(Long tournamentId) {
		this.tournamentId = tournamentId;
	}

	public UUID getTournamentUuid() {
		return tournamentUuid;
	}

	public void setTournamentUuid(UUID tournamentUuid) {
		this.tournamentUuid = tournamentUuid;
	}

	public String getTeamALineupStatus() {
		return teamALineupStatus;
	}

	public void setTeamALineupStatus(String teamALineupStatus) {
		this.teamALineupStatus = teamALineupStatus;
	}

	public String getTeamBLineupStatus() {
		return teamBLineupStatus;
	}

	public void setTeamBLineupStatus(String teamBLineupStatus) {
		this.teamBLineupStatus = teamBLineupStatus;
	}

	public String getTournamentName() {
		return tournamentName;
	}

	public void setTournamentName(String tournamentName) {
		this.tournamentName = tournamentName;
	}

	public String getCourtName() {
		return courtName;
	}

	public void setCourtName(String courtName) {
		this.courtName = courtName;
	}

	public String getSportType() {
		return sportType;
	}

	public void setSportType(String sportType) {
		this.sportType = sportType;
	}

	public String getTournamentType() {
		return tournamentType;
	}

	public void setTournamentType(String tournamentType) {
		this.tournamentType = tournamentType;
	}
}
