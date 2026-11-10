package com.athlon.identityservice.venue.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.venue.dto.VenueCustomerCreateRequest;
import com.athlon.identityservice.venue.dto.VenueCustomerDto;
import com.athlon.identityservice.venue.service.VenueCustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/identity/venues/customers")
public class VenueCustomerController {

    private final VenueCustomerService customerService;

    public VenueCustomerController(VenueCustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping({"/organization/{orgUuid}", "/organizations/{orgUuid}"})
    public ResponseEntity<ApiResponse<Page<VenueCustomerDto>>> getCustomers(
            @PathVariable("orgUuid") UUID orgUuid,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VenueCustomerDto> result = customerService.getCustomers(orgUuid, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{customerUuid}")
    public ResponseEntity<ApiResponse<VenueCustomerDto>> getCustomerDetail(@PathVariable("customerUuid") UUID customerUuid) {
        VenueCustomerDto result = customerService.getCustomerByUuid(customerUuid);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VenueCustomerDto>> createOrUpdateCustomer(@Valid @RequestBody VenueCustomerCreateRequest request) {
        VenueCustomerDto result = customerService.createOrUpdateCustomer(request);
        return ResponseEntity.ok(ApiResponse.success("Customer profile saved successfully", result));
    }
}

