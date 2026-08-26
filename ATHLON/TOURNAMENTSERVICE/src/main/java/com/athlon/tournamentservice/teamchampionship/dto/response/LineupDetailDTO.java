package com.athlon.tournamentservice.teamchampionship.dto.response;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipLineup;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipLineupEntry;
import java.util.List;

public class LineupDetailDTO {
    private TeamChampionshipLineup lineup;
    private List<TeamChampionshipLineupEntry> entries;

    public LineupDetailDTO() {}

    public LineupDetailDTO(TeamChampionshipLineup lineup, List<TeamChampionshipLineupEntry> entries) {
        this.lineup = lineup;
        this.entries = entries;
    }

    public TeamChampionshipLineup getLineup() { return lineup; }
    public void setLineup(TeamChampionshipLineup lineup) { this.lineup = lineup; }

    public List<TeamChampionshipLineupEntry> getEntries() { return entries; }
    public void setEntries(List<TeamChampionshipLineupEntry> entries) { this.entries = entries; }
}
