package com.athlon.identityservice.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class CreateSportsProfileRequest {

    private UUID userUuid;

    @NotBlank(message = "Sport name is required")
    @Size(max = 100, message = "Sport name must not exceed 100 characters")
    private String sportName;

    private Integer currentRanking;
    private String careerHighlights;

    public CreateSportsProfileRequest() {
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public Integer getCurrentRanking() {
        return currentRanking;
    }

    public void setCurrentRanking(Integer currentRanking) {
        this.currentRanking = currentRanking;
    }

    public String getCareerHighlights() {
        return careerHighlights;
    }

    public void setCareerHighlights(String careerHighlights) {
        this.careerHighlights = careerHighlights;
    }
}
