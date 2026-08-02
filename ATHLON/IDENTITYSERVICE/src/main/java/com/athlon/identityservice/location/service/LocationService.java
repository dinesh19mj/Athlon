package com.athlon.identityservice.location.service;

import com.athlon.identityservice.dto.request.CountryRequest;
import com.athlon.identityservice.location.dto.request.StateRequest;
import com.athlon.identityservice.location.dto.response.CountryResponse;
import com.athlon.identityservice.location.dto.response.StateResponse;
import com.athlon.identityservice.location.entity.Country;
import com.athlon.identityservice.location.entity.State;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.location.repository.CountryRepository;
import com.athlon.identityservice.location.repository.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;

    public LocationService(CountryRepository countryRepository, StateRepository stateRepository) {
        this.countryRepository = countryRepository;
        this.stateRepository = stateRepository;
    }

    @Transactional
    public CountryResponse createCountry(CountryRequest request, Long currentUserId) {
        if (countryRepository.existsByName(request.getName()) || countryRepository.existsByIsoCode(request.getIsoCode())) {
            throw new DuplicateResourceException("Country already exists with name or ISO code");
        }

        Country country = new Country(request.getName(), request.getIsoCode(), currentUserId);
        country = countryRepository.save(country);

        return mapToCountryResponse(country);
    }

    @Transactional
    public StateResponse createState(StateRequest request, Long currentUserId) {
        Country country = countryRepository.findByUuid(request.getCountryUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found"));

        if (stateRepository.existsByNameAndCountryId(request.getName(), country.getId())) {
            throw new DuplicateResourceException("State already exists in this country");
        }

        State state = new State(country.getId(), country.getUuid(), request.getName(), currentUserId);
        state = stateRepository.save(state);

        return mapToStateResponse(state);
    }

    @Transactional(readOnly = true)
    public List<CountryResponse> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(this::mapToCountryResponse)
                .collect(Collectors.toList());
    }

    private CountryResponse mapToCountryResponse(Country country) {
        CountryResponse response = new CountryResponse();
        response.setUuid(country.getUuid());
        response.setName(country.getName());
        response.setIsoCode(country.getIsoCode());
        response.setActive(country.isActive());
        return response;
    }

    private StateResponse mapToStateResponse(State state) {
        StateResponse response = new StateResponse();
        response.setUuid(state.getUuid());
        response.setCountryUuid(state.getCountryUuid());
        response.setName(state.getName());
        response.setActive(state.isActive());
        return response;
    }
}
