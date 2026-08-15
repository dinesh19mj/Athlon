package com.athlon.tournamentservice.dto.request;

import java.util.List;
import java.util.UUID;

public class ManualDrawRequest {
    private List<ManualPairing> pairings;
    private String drawType; // KNOCKOUT, etc.

    public List<ManualPairing> getPairings() {
        return pairings;
    }

    public void setPairings(List<ManualPairing> pairings) {
        this.pairings = pairings;
    }

    public String getDrawType() {
        return drawType;
    }

    public void setDrawType(String drawType) {
        this.drawType = drawType;
    }

    public static class ManualPairing {
        private UUID teamAUuid;
        private UUID teamBUuid;
        private int slotIndex; // 1-indexed leaf node slot

        public UUID getTeamAUuid() {
            return teamAUuid;
        }

        public void setTeamAUuid(UUID teamAUuid) {
            this.teamAUuid = teamAUuid;
        }

        public UUID getTeamBUuid() {
            return teamBUuid;
        }

        public void setTeamBUuid(UUID teamBUuid) {
            this.teamBUuid = teamBUuid;
        }

        public int getSlotIndex() {
            return slotIndex;
        }

        public void setSlotIndex(int slotIndex) {
            this.slotIndex = slotIndex;
        }
    }
}
