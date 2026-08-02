package com.athlon.tournament.facility.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournament.facility.entity.Booking;
import com.athlon.tournament.facility.entity.Facility;
import com.athlon.tournament.facility.service.FacilityService;

import java.util.List;

@RestController
@RequestMapping("/facility")
public class FacilityController {

    @Autowired
    private FacilityService facilityService;

    @PostMapping("/add")
    public ResponseEntity<Facility> addFacility(@RequestBody Facility facility) {
        try {
            Facility saved = facilityService.addFacility(facility);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<Facility>> getFacilitiesByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<Facility> facilities = facilityService.getFacilitiesByOrg(orgId);
            return new ResponseEntity<>(facilities, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/booking/add")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        try {
            Booking saved = facilityService.createBooking(booking);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/booking/org/{orgId}")
    public ResponseEntity<List<Booking>> getBookingsByOrg(@PathVariable("orgId") Long orgId) {
        try {
            List<Booking> bookings = facilityService.getBookingsByOrg(orgId);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
