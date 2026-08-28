package com.athlon.identityservice.location.service;

import com.athlon.identityservice.dto.request.CountryRequest;
import com.athlon.identityservice.location.dto.request.CityRequest;
import com.athlon.identityservice.location.dto.request.DistrictRequest;
import com.athlon.identityservice.location.dto.request.StateRequest;
import com.athlon.identityservice.location.dto.response.CityResponse;
import com.athlon.identityservice.location.dto.response.CountryResponse;
import com.athlon.identityservice.location.dto.response.DistrictResponse;
import com.athlon.identityservice.location.dto.response.StateResponse;
import com.athlon.identityservice.location.entity.City;
import com.athlon.identityservice.location.entity.Country;
import com.athlon.identityservice.location.entity.District;
import com.athlon.identityservice.location.entity.State;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.location.repository.CityRepository;
import com.athlon.identityservice.location.repository.CountryRepository;
import com.athlon.identityservice.location.repository.DistrictRepository;
import com.athlon.identityservice.location.repository.StateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final CityRepository cityRepository;

    public LocationService(
            CountryRepository countryRepository,
            StateRepository stateRepository,
            DistrictRepository districtRepository,
            CityRepository cityRepository) {
        this.countryRepository = countryRepository;
        this.stateRepository = stateRepository;
        this.districtRepository = districtRepository;
        this.cityRepository = cityRepository;
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

    @Transactional
    public DistrictResponse createDistrict(DistrictRequest request, Long currentUserId) {
        State state = stateRepository.findByUuid(request.getStateUuid())
                .orElseThrow(() -> new ResourceNotFoundException("State not found"));

        if (districtRepository.existsByNameAndStateId(request.getName(), state.getId())) {
            throw new DuplicateResourceException("District already exists in this state");
        }

        District district = new District(state.getId(), state.getUuid(), request.getName(), currentUserId);
        district = districtRepository.save(district);

        return mapToDistrictResponse(district);
    }

    @Transactional
    public CityResponse createCity(CityRequest request, Long currentUserId) {
        District district = districtRepository.findByUuid(request.getDistrictUuid())
                .orElseThrow(() -> new ResourceNotFoundException("District not found"));

        if (cityRepository.existsByNameAndDistrictId(request.getName(), district.getId())) {
            throw new DuplicateResourceException("City already exists in this district");
        }

        City city = new City(district.getId(), district.getUuid(), request.getName(), currentUserId);
        city = cityRepository.save(city);

        return mapToCityResponse(city);
    }

    @Transactional(readOnly = true)
    public List<CountryResponse> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(this::mapToCountryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StateResponse> getAllStates() {
        return stateRepository.findAll().stream()
                .map(this::mapToStateResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StateResponse> getStatesByCountryUuid(UUID countryUuid) {
        return stateRepository.findByCountryUuid(countryUuid).stream()
                .map(this::mapToStateResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DistrictResponse> getAllDistricts() {
        return districtRepository.findAll().stream()
                .map(this::mapToDistrictResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DistrictResponse> getDistrictsByStateUuid(UUID stateUuid) {
        return districtRepository.findByStateUuid(stateUuid).stream()
                .map(this::mapToDistrictResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DistrictResponse> getDistrictsByStateName(String stateName) {
        if (stateName == null || stateName.trim().isEmpty()) {
            return List.of();
        }
        return stateRepository.findByNameIgnoreCase(stateName.trim())
                .map(state -> districtRepository.findByStateId(state.getId()).stream()
                        .map(this::mapToDistrictResponse)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getCitiesByDistrictUuid(UUID districtUuid) {
        return cityRepository.findByDistrictUuid(districtUuid).stream()
                .map(this::mapToCityResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CityResponse> getCitiesByDistrictName(String districtName) {
        if (districtName == null || districtName.trim().isEmpty()) {
            return List.of();
        }
        return districtRepository.findByNameIgnoreCase(districtName.trim())
                .map(district -> cityRepository.findByDistrictId(district.getId()).stream()
                        .map(this::mapToCityResponse)
                        .collect(Collectors.toList()))
                .orElse(List.of());
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

    private DistrictResponse mapToDistrictResponse(District district) {
        DistrictResponse response = new DistrictResponse();
        response.setUuid(district.getUuid());
        response.setStateUuid(district.getStateUuid());
        response.setName(district.getName());
        response.setActive(district.isActive());
        return response;
    }

    private CityResponse mapToCityResponse(City city) {
        CityResponse response = new CityResponse();
        response.setUuid(city.getUuid());
        response.setDistrictUuid(city.getDistrictUuid());
        response.setName(city.getName());
        response.setActive(city.isActive());
        return response;
    }
}
