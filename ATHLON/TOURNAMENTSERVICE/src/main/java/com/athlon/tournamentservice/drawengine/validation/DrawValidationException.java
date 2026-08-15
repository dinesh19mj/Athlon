package com.athlon.tournamentservice.drawengine.validation;

public class DrawValidationException extends RuntimeException {
    
    private final String ruleCode;

    public DrawValidationException(String message, String ruleCode) {
        super(message);
        this.ruleCode = ruleCode;
    }

    public String getRuleCode() {
        return ruleCode;
    }
}
