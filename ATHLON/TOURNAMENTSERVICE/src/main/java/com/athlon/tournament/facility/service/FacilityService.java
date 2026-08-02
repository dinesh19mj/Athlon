package com.athlon.tournament.facility.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.athlon.tournament.facility.entity.Booking;
import com.athlon.tournament.facility.entity.Facility;
import com.athlon.tournament.facility.repository.BookingRepository;
import com.athlon.tournament.facility.repository.FacilityRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Facility addFacility(Facility facility) {
        facility.setCreatedOn(LocalDateTime.now());
        if (facility.getStatus() == null) {
            facility.setStatus("ACTIVE");
        }
        return facilityRepository.save(facility);
    }

    public List<Facility> getFacilitiesByOrg(Long orgId) {
        return facilityRepository.findByOrgId(orgId);
    }

    public Booking createBooking(Booking booking) {
        booking.setCreatedOn(LocalDateTime.now());
        if (booking.getStatus() == null) {
            booking.setStatus("CONFIRMED");
        }
        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsByOrg(Long orgId) {
        return bookingRepository.findByOrgId(orgId);
    }

    public List<Booking> getBookingsByFacility(Long facilityId) {
        return bookingRepository.findByFacilityId(facilityId);
    }
}
