package com.athlon.authservice.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.Objects;

@Configuration
@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {

    private int passwordStrength;
    private int maxLoginAttempts;

    public SecurityProperties() {
    }

    public int getPasswordStrength() {
        return passwordStrength;
    }

    public void setPasswordStrength(int passwordStrength) {
        this.passwordStrength = passwordStrength;
    }

    public int getMaxLoginAttempts() {
        return maxLoginAttempts;
    }

    public void setMaxLoginAttempts(int maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SecurityProperties that = (SecurityProperties) o;
        return passwordStrength == that.passwordStrength &&
                maxLoginAttempts == that.maxLoginAttempts;
    }

    @Override
    public int hashCode() {
        return Objects.hash(passwordStrength, maxLoginAttempts);
    }

    @Override
    public String toString() {
        return "SecurityProperties{" +
                "passwordStrength=" + passwordStrength +
                ", maxLoginAttempts=" + maxLoginAttempts +
                '}';
    }
}
