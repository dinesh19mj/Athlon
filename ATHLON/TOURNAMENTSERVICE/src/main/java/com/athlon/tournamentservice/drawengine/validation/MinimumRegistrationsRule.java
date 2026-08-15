package com.athlon.tournamentservice.drawengine.validation;

import com.athlon.tournamentservice.registration.entity.Registration;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MinimumRegistrationsRule implements DrawValidationRule {

    @Override
    public void validate(List<Registration> registrations, Long categoryId) throws DrawValidationException {
        if (registrations == null || registrations.size() < 2) {
            throw new DrawValidationException(
                "Not enough approved registrations to generate a draw (minimum 2 required).", 
                getRuleCode()
            );
        }
    }

    @Override
    public String getRuleCode() {
        return "MIN_REGISTRATIONS";
    }
}
