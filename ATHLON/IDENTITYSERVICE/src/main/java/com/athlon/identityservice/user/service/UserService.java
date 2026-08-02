package com.athlon.identityservice.user.service;

import com.athlon.identityservice.user.dto.request.CreateSportsProfileRequest;
import com.athlon.identityservice.user.dto.request.CreateUserRequest;
import com.athlon.identityservice.user.dto.request.UpdateUserRequest;
import com.athlon.identityservice.user.dto.request.UserSearchRequest;
import com.athlon.identityservice.user.dto.response.UserResponse;
import com.athlon.identityservice.user.entity.User;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.user.repository.SportsProfileRepository;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.user.repository.UserRepository;
import com.athlon.identityservice.user.entity.SportsProfile;
import com.athlon.identityservice.user.dto.response.SportsProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SportsProfileRepository sportsProfileRepository;
    private final WebClient webClient;

    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository, SportsProfileRepository sportsProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.sportsProfileRepository = sportsProfileRepository;
        this.webClient = WebClient.create();
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, Long currentUserId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User already exists with email: " + request.getEmail());
        }

        User user = new User(request.getEmail(), currentUserId);
        user = userRepository.save(user);

        UserProfile profile = new UserProfile(
                user.getUserId(),
                user.getUserUuid(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone(),
                currentUserId
        );
        userProfileRepository.save(profile);
        
        // Sync credential with AUTHSERVICE
        try {
            var credentialRequest = new java.util.HashMap<String, Object>();
            credentialRequest.put("userUuid", user.getUserUuid().toString());
            credentialRequest.put("email", request.getEmail());
            credentialRequest.put("phone", request.getPhone());
            credentialRequest.put("password", request.getPassword());
            
            webClient.post()
                    .uri("http://localhost:5051/api/auth/internal/credentials")
                    .bodyValue(credentialRequest)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Failed to register credentials with AUTHSERVICE", e);
        }

        return mapToResponse(user, profile, null);
    }

    @Transactional
    public UserResponse updateUser(UpdateUserRequest request, Long currentUserId) {
        User user = userRepository.findByUserUuid(request.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + request.getUuid()));
                
        UserProfile profile = userProfileRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found for User UUID: " + request.getUuid()));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhone(request.getPhone());
        profile.setModifiedBy(currentUserId);
        
        userProfileRepository.save(profile);

        var sportsProfiles = sportsProfileRepository.findByUserId(user.getUserId());
        return mapToResponse(user, profile, sportsProfiles);
    }

    @Transactional
    public void deleteUser(UUID uuid, Long currentUserId) {
        User user = userRepository.findByUserUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + uuid));
        
        user.setIsActive(0);
        user.setModifiedBy(currentUserId);
        userRepository.save(user);

        userProfileRepository.findByUserId(user.getUserId()).ifPresent(profile -> {
            profile.setIsActive(0);
            profile.setModifiedBy(currentUserId);
            userProfileRepository.save(profile);
        });
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUuid(UUID uuid) {
        User user = userRepository.findByUserUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + uuid));
                
        UserProfile profile = userProfileRepository.findByUserId(user.getUserId()).orElse(null);
        var sportsProfiles = sportsProfileRepository.findByUserId(user.getUserId());

        return mapToResponse(user, profile, sportsProfiles);
    }
    
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(UserSearchRequest request) {
        // Simplified search for demonstration. A full implementation might use CriteriaBuilder or QueryDSL
        List<User> users = userRepository.findAll();
        
        return users.stream().map(user -> {
            UserProfile profile = userProfileRepository.findByUserId(user.getUserId()).orElse(null);
            var sportsProfiles = sportsProfileRepository.findByUserId(user.getUserId());
            return mapToResponse(user, profile, sportsProfiles);
        }).collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user, UserProfile profile, List<SportsProfile> sportsProfiles) {
        UserResponse response = new UserResponse();
        response.setUuid(user.getUserUuid());
        response.setEmail(user.getEmail());
        response.setIsActive(1);
        
        if (profile != null) {
            response.setFirstName(profile.getFirstName());
            response.setLastName(profile.getLastName());
            response.setPhone(profile.getPhone());
        }

        if (sportsProfiles != null) {
            List<SportsProfileResponse> sportsProfileResponses = sportsProfiles.stream().map(sp -> {
                SportsProfileResponse spr = new SportsProfileResponse();
                spr.setUuid(sp.getUuid());
                spr.setSportName(sp.getSportName());
                spr.setCurrentRanking(sp.getCurrentRanking());
                spr.setVerificationStatus(sp.getVerificationStatus());
                spr.setCareerHighlights(sp.getCareerHighlights());
                spr.setActive(sp.isActive());
                return spr;
            }).collect(Collectors.toList());
            response.setSportsProfiles(sportsProfileResponses);
        }
        return response;
    }

    @Transactional
    public SportsProfileResponse createSportsProfile(CreateSportsProfileRequest request) {
        User user = userRepository.findByUserUuid(request.getUserUuid())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + request.getUserUuid()));

        if (sportsProfileRepository.findByUserUuidAndSportName(request.getUserUuid(), request.getSportName()).isPresent()) {
            throw new DuplicateResourceException("Sports Profile already exists for this sport: " + request.getSportName());
        }

        SportsProfile profile = new SportsProfile(user.getUserId(), user.getUserUuid(), request.getSportName());
        profile.setCurrentRanking(request.getCurrentRanking());
        profile.setCareerHighlights(request.getCareerHighlights());
        
        profile = sportsProfileRepository.save(profile);
        
        SportsProfileResponse response = new SportsProfileResponse();
        response.setUuid(profile.getUuid());
        response.setSportName(profile.getSportName());
        response.setCurrentRanking(profile.getCurrentRanking());
        response.setVerificationStatus(profile.getVerificationStatus());
        response.setCareerHighlights(profile.getCareerHighlights());
        response.setActive(profile.isActive());
        
        return response;
    }
}
