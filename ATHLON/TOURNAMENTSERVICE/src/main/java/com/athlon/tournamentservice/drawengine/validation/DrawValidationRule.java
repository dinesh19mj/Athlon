package com.athlon.tournamentservice.drawengine.validation;

import com.athlon.tournamentservice.registration.entity.Registration;
import java.util.List;

public interface DrawValidationRule {
    
    /**
     * Executes the validation rule.
     * @param registrations The list of registrations to validate.
     * @param categoryId The category being validated.
     * @throws DrawValidationException if validation fails.
     */
    void validate(List<Registration> registrations, Long categoryId) throws DrawValidationException;
    
    /**
     * @return A unique identifier for this rule.
     */
    String getRuleCode();
}
