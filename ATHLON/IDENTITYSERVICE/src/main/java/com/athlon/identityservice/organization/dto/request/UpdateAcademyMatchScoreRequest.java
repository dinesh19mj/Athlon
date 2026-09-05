package com.athlon.identityservice.organization.dto.request;

public class UpdateAcademyMatchScoreRequest {

    private Integer team1Score;
    private Integer team2Score;
    private String scoresDetail; // "21-18, 19-21, 21-15"
    private Integer winnerTeam; // 1 or 2
    private String winnerName;
    private String status = "COMPLETED"; // IN_PROGRESS, COMPLETED, CANCELLED
    private String notes;

    public UpdateAcademyMatchScoreRequest() {
    }

    public Integer getTeam1Score() {
        return team1Score;
    }

    public void setTeam1Score(Integer team1Score) {
        this.team1Score = team1Score;
    }

    public Integer getTeam2Score() {
        return team2Score;
    }

    public void setTeam2Score(Integer team2Score) {
        this.team2Score = team2Score;
    }

    public String getScoresDetail() {
        return scoresDetail;
    }

    public void setScoresDetail(String scoresDetail) {
        this.scoresDetail = scoresDetail;
    }

    public Integer getWinnerTeam() {
        return winnerTeam;
    }

    public void setWinnerTeam(Integer winnerTeam) {
        this.winnerTeam = winnerTeam;
    }

    public String getWinnerName() {
        return winnerName;
    }

    public void setWinnerName(String winnerName) {
        this.winnerName = winnerName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
