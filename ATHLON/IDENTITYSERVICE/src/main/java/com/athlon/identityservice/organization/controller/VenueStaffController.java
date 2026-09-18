package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AddVenueStaffRequest;
import com.athlon.identityservice.organization.dto.request.UpdateVenueStaffRequest;
import com.athlon.identityservice.organization.dto.response.VenueStaffResponse;
import com.athlon.identityservice.organization.service.VenueStaffService;
import com.athlon.identityservice.user.dto.response.UserResponse;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/venue/staff")
public class VenueStaffController {

    private final VenueStaffService staffService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public VenueStaffController(
            VenueStaffService staffService,
            UserProfileRepository userProfileRepository,
            UserRepository userRepository) {
        this.staffService = staffService;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<VenueStaffResponse>>> getStaff(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "role", required = false) String role) {

        List<VenueStaffResponse> list = staffService.getStaff(organizationUuid, role);
        return ResponseEntity.ok(ApiResponse.success("Venue staff retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<VenueStaffResponse>> addStaff(
            @Valid @RequestBody AddVenueStaffRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Long currentUserId = userId != null ? userId : 1L;
        VenueStaffResponse staff = staffService.addStaffByPhone(request.getOrganizationUuid(), request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Venue staff member added successfully", staff));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<VenueStaffResponse>> updateStaff(
            @Valid @RequestBody UpdateVenueStaffRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Long currentUserId = userId != null ? userId : 1L;
        VenueStaffResponse staff = staffService.updateStaff(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Venue staff member updated successfully", staff));
    }

    @DeleteMapping("/{staffUuid}")
    public ResponseEntity<ApiResponse<String>> removeStaff(
            @PathVariable("staffUuid") UUID staffUuid,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {

        Long currentUserId = userId != null ? userId : 1L;
        staffService.removeStaff(staffUuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Venue staff member removed successfully", "Removed"));
    }

    @GetMapping("/verify-phone")
    public ResponseEntity<ApiResponse<UserResponse>> verifyPhone(@RequestParam("phone") String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String cleanPhone = phone.replaceAll("[^0-9]", "");
        UserProfile profile = userProfileRepository.findFirstByPhone(cleanPhone)
                .or(() -> userProfileRepository.findFirstByPhone(phone))
                .orElseThrow(() -> new ResourceNotFoundException("No registered Athlon user found with phone: " + phone));

        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));

        UserResponse res = new UserResponse();
        res.setUuid(user.getUserUuid());
        res.setFirstName(profile.getFirstName());
        res.setLastName(profile.getLastName());
        res.setPhone(profile.getPhone());
        res.setPhoto(profile.getPhoto());
        res.setCity(profile.getCity());
        res.setDistrict(profile.getDistrict());
        res.setState(profile.getState());
        res.setEmail(user.getEmail());
        res.setIsActive(user.getIsActive());

        return ResponseEntity.ok(ApiResponse.success("Athlon user verified", res));
    }
}
