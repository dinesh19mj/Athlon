package com.athlon.identityservice.organization.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AddOrganizerOfficialRequest;
import com.athlon.identityservice.organization.dto.request.UpdateOrganizerOfficialRequest;
import com.athlon.identityservice.organization.dto.response.OrganizerOfficialResponse;
import com.athlon.identityservice.organization.service.OrganizerOfficialService;
import com.athlon.identityservice.user.dto.response.UserResponse;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/organizer/officials")
public class OrganizerOfficialController {

    private final OrganizerOfficialService officialService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public OrganizerOfficialController(
            OrganizerOfficialService officialService,
            UserProfileRepository userProfileRepository,
            UserRepository userRepository) {
        this.officialService = officialService;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<OrganizerOfficialResponse>>> getOfficials(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "role", required = false) String role) {

        List<OrganizerOfficialResponse> list = officialService.getOfficials(organizationUuid, role);
        return ResponseEntity.ok(ApiResponse.success("Officials retrieved successfully", list));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<OrganizerOfficialResponse>> addOfficial(
            @Valid @RequestBody AddOrganizerOfficialRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerOfficialResponse response = officialService.addOfficialByPhone(request.getOrganizationUuid(), request, userId);
        return ResponseEntity.ok(ApiResponse.success("Official added successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<OrganizerOfficialResponse>> updateOfficial(
            @Valid @RequestBody UpdateOrganizerOfficialRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        OrganizerOfficialResponse response = officialService.updateOfficial(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Official updated successfully", response));
    }

    @PostMapping("/delete/{officialUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteOfficial(
            @PathVariable("officialUuid") UUID officialUuid,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        officialService.deleteOfficial(officialUuid, userId);
        return ResponseEntity.ok(ApiResponse.success("Official access revoked successfully", null));
    }

    @GetMapping("/lookup-user")
    public ResponseEntity<ApiResponse<UserResponse>> lookupUserByPhone(
            @RequestParam("phone") String phone) {

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
        res.setState(profile.getState());
        res.setEmail(user.getEmail());
        res.setIsActive(user.getIsActive());

        return ResponseEntity.ok(ApiResponse.success("Athlon user verified", res));
    }
}
