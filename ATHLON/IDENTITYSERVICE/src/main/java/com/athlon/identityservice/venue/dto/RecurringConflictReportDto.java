package com.athlon.identityservice.venue.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class RecurringConflictReportDto {
    private Boolean hasConflicts;
    private Integer totalOccurrences;
    private Integer conflictingOccurrencesCount;
    private List<OccurrenceConflictDto> conflicts;
    private List<LocalDate> validOccurrenceDates;

    public static class OccurrenceConflictDto {
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private String conflictType; // BOOKING, BLOCK, MAINTENANCE, RESERVATION
        private String conflictDescription;
        private String referenceNumber;

        public OccurrenceConflictDto() {}

        public OccurrenceConflictDto(LocalDate date, LocalTime startTime, LocalTime endTime, String conflictType, String conflictDescription, String referenceNumber) {
            this.date = date;
            this.startTime = startTime;
            this.endTime = endTime;
            this.conflictType = conflictType;
            this.conflictDescription = conflictDescription;
            this.referenceNumber = referenceNumber;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
        public String getConflictType() { return conflictType; }
        public void setConflictType(String conflictType) { this.conflictType = conflictType; }
        public String getConflictDescription() { return conflictDescription; }
        public void setConflictDescription(String conflictDescription) { this.conflictDescription = conflictDescription; }
        public String getReferenceNumber() { return referenceNumber; }
        public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    }

    public RecurringConflictReportDto() {}

    public Boolean getHasConflicts() { return hasConflicts; }
    public void setHasConflicts(Boolean hasConflicts) { this.hasConflicts = hasConflicts; }
    public Integer getTotalOccurrences() { return totalOccurrences; }
    public void setTotalOccurrences(Integer totalOccurrences) { this.totalOccurrences = totalOccurrences; }
    public Integer getConflictingOccurrencesCount() { return conflictingOccurrencesCount; }
    public void setConflictingOccurrencesCount(Integer conflictingOccurrencesCount) { this.conflictingOccurrencesCount = conflictingOccurrencesCount; }
    public List<OccurrenceConflictDto> getConflicts() { return conflicts; }
    public void setConflicts(List<OccurrenceConflictDto> conflicts) { this.conflicts = conflicts; }
    public List<LocalDate> getValidOccurrenceDates() { return validOccurrenceDates; }
    public void setValidOccurrenceDates(List<LocalDate> validOccurrenceDates) { this.validOccurrenceDates = validOccurrenceDates; }
}
