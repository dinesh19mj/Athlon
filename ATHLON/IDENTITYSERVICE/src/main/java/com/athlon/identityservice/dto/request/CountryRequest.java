package com.athlon.identityservice.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CountryRequest {

    @NotBlank(message = "Country name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "ISO code is required")
    @Size(min = 2, max = 10, message = "ISO code must be between 2 and 10 characters")
    private String isoCode;

    public CountryRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIsoCode() {
        return isoCode;
    }

    public void setIsoCode(String isoCode) {
        this.isoCode = isoCode;
    }
}
