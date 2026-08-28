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
import com.athlon.identityservice.util.FileStorageUtil;
import com.athlon.identityservice.user.entity.SportsProfile;
import com.athlon.identityservice.user.dto.response.SportsProfileResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SportsProfileRepository sportsProfileRepository;
    private final FileStorageUtil fileStorageUtil;
    private final WebClient webClient;
    
    @Value("${athlo.gateway.url:http://localhost:5050}")
    private String gatewayPath;

    @Value("${athlon.user.photo.upload.directory:C:\\Users\\neoni\\Desktop\\Athlon\\User}")
    private String userPhotoUploadDir;

    public UserService(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            SportsProfileRepository sportsProfileRepository,
            FileStorageUtil fileStorageUtil) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.sportsProfileRepository = sportsProfileRepository;
        this.fileStorageUtil = fileStorageUtil;
        this.webClient = WebClient.create();
    }

    public String getUserPhotoUploadDir() {
        return userPhotoUploadDir;
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
            var credentialRequest = new HashMap<String, Object>();
            credentialRequest.put("userUuid", user.getUserUuid().toString());
            credentialRequest.put("email", request.getEmail());
            credentialRequest.put("phone", request.getPhone());
            credentialRequest.put("password", request.getPassword());
            
            webClient.post()
            		.uri(gatewayPath + "/api/auth/internal/credentials")
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
        if (request.getLastName() != null) {
            profile.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if (request.getCity() != null) {
            profile.setCity(request.getCity());
        }
        if (request.getDistrict() != null) {
            profile.setDistrict(request.getDistrict());
        }
        if (request.getState() != null) {
            profile.setState(request.getState());
        }
        if (request.getPhoto() != null) {
            profile.setPhoto(request.getPhoto());
        }
        profile.setUpdatedBy(currentUserId);
        
        userProfileRepository.save(profile);

        var sportsProfiles = sportsProfileRepository.findByUserId(user.getUserId());
        return mapToResponse(user, profile, sportsProfiles);
    }

    @Transactional
    public UserResponse updateUserWithPhoto(
            UUID userUuid,
            String firstName,
            String lastName,
            String phone,
            String city,
            String district,
            String state,
            MultipartFile photoFile,
            Long currentUserId) {
        User user = userRepository.findByUserUuid(userUuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + userUuid));

        UserProfile profile = userProfileRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found for User UUID: " + userUuid));

        if (firstName != null && !firstName.trim().isEmpty()) {
            profile.setFirstName(firstName.trim());
        }
        if (lastName != null) {
            profile.setLastName(lastName.trim());
        }
        if (phone != null) {
            profile.setPhone(phone.trim());
        }
        if (city != null) {
            profile.setCity(city.trim());
        }
        if (district != null) {
            profile.setDistrict(district.trim());
        }
        if (state != null) {
            profile.setState(state.trim());
        }

        if (photoFile != null && !photoFile.isEmpty()) {
            try {
                String savedPhoto = fileStorageUtil.saveFile(photoFile, userPhotoUploadDir, "photos");
                profile.setPhoto(savedPhoto);
            } catch (Exception e) {
                throw new RuntimeException("Failed to save user profile photo", e);
            }
        }

        profile.setUpdatedBy(currentUserId);
        userProfileRepository.save(profile);

        var sportsProfiles = sportsProfileRepository.findByUserId(user.getUserId());
        return mapToResponse(user, profile, sportsProfiles);
    }

    @Transactional
    public UserResponse updateUserPhoto(UUID userUuid, MultipartFile photoFile, Long currentUserId) {
        return updateUserWithPhoto(userUuid, null, null, null, null, null, null, photoFile, currentUserId);
    }

    @Transactional
    public void deleteUser(UUID uuid, Long currentUserId) {
        User user = userRepository.findByUserUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + uuid));
        
        user.setIsActive(0);
        user.setUpdatedBy(currentUserId);
        userRepository.save(user);

        userProfileRepository.findByUserId(user.getUserId()).ifPresent(profile -> {
            profile.setIsActive(0);
            profile.setUpdatedBy(currentUserId);
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
    public UserResponse getUserByPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        String cleaned = phone.replaceAll("[^0-9]", "");
        if (cleaned.isEmpty()) {
            return null;
        }

        UserProfile profile = userProfileRepository.findAll().stream()
                .filter(p -> {
                    if (p.getPhone() == null) return false;
                    String pClean = p.getPhone().replaceAll("[^0-9]", "");
                    if (cleaned.length() >= 10 && pClean.length() >= 10) {
                        return pClean.endsWith(cleaned.substring(cleaned.length() - 10)) || cleaned.endsWith(pClean.substring(pClean.length() - 10));
                    }
                    return pClean.equals(cleaned);
                })
                .findFirst()
                .orElse(null);

        if (profile == null) {
            return null;
        }

        User user = userRepository.findById(profile.getUserId()).orElse(null);
        if (user == null) {
            return null;
        }
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
            response.setPhoto(profile.getPhoto());
            response.setCity(profile.getCity());
            response.setDistrict(profile.getDistrict());
            response.setState(profile.getState());
        }

        if (sportsProfiles != null) {
            List<SportsProfileResponse> sportsProfileResponses = sportsProfiles.stream().map(sp -> {
                SportsProfileResponse spr = new SportsProfileResponse();
                spr.setUuid(sp.getSportsProfileUuid());
                spr.setSportName(sp.getSportName());
                spr.setCategory(sp.getCategory());
                spr.setCurrentRanking(sp.getCurrentRanking());
                spr.setEloRating(sp.getEloRating() != null ? sp.getEloRating() : 1200);
                spr.setHighestElo(sp.getHighestElo() != null ? sp.getHighestElo() : 1200);
                spr.setTotalMatches(sp.getTotalMatches() != null ? sp.getTotalMatches() : 0);
                spr.setMatchesWon(sp.getMatchesWon() != null ? sp.getMatchesWon() : 0);
                spr.setMatchesLost(sp.getMatchesLost() != null ? sp.getMatchesLost() : 0);
                spr.setWinRate(sp.getWinRate() != null ? sp.getWinRate() : 0.0);
                spr.setCurrentStreak(sp.getCurrentStreak() != null ? sp.getCurrentStreak() : 0);

                try {
                    long higherPlayers = sportsProfileRepository.countHigherRankedPlayers(
                            sp.getSportName(),
                            sp.getEloRating() != null ? sp.getEloRating() : 1200,
                            sp.getMatchesWon() != null ? sp.getMatchesWon() : 0
                    );
                    spr.setGlobalRank((int) (higherPlayers + 1));
                } catch (Exception e) {
                    spr.setGlobalRank(null);
                }

                spr.setVerificationStatus(sp.getVerificationStatus());
                spr.setCareerHighlights(sp.getCareerHighlights());
                spr.setActive(sp.isActive());
                return spr;
            }).collect(Collectors.toList());
            response.setSportsProfiles(sportsProfileResponses);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public SportsProfileResponse getUserStats(UUID userUuid, String sportName) {
        String sport = (sportName != null && !sportName.trim().isEmpty()) ? sportName.trim() : "Badminton";
        SportsProfile sp = sportsProfileRepository.findByUserUuidAndSportName(userUuid, sport)
                .orElseGet(() -> {
                    List<SportsProfile> profiles = sportsProfileRepository.findByUserUuid(userUuid);
                    return profiles.isEmpty() ? null : profiles.get(0);
                });

        if (sp == null) {
            SportsProfileResponse defaultSpr = new SportsProfileResponse();
            defaultSpr.setSportName(sport);
            defaultSpr.setEloRating(1200);
            defaultSpr.setHighestElo(1200);
            defaultSpr.setTotalMatches(0);
            defaultSpr.setMatchesWon(0);
            defaultSpr.setMatchesLost(0);
            defaultSpr.setWinRate(0.0);
            defaultSpr.setCurrentStreak(0);
            defaultSpr.setGlobalRank(1);
            return defaultSpr;
        }

        SportsProfileResponse spr = new SportsProfileResponse();
        spr.setUuid(sp.getSportsProfileUuid());
        spr.setSportName(sp.getSportName());
        spr.setCategory(sp.getCategory());
        spr.setCurrentRanking(sp.getCurrentRanking());
        spr.setEloRating(sp.getEloRating() != null ? sp.getEloRating() : 1200);
        spr.setHighestElo(sp.getHighestElo() != null ? sp.getHighestElo() : 1200);
        spr.setTotalMatches(sp.getTotalMatches() != null ? sp.getTotalMatches() : 0);
        spr.setMatchesWon(sp.getMatchesWon() != null ? sp.getMatchesWon() : 0);
        spr.setMatchesLost(sp.getMatchesLost() != null ? sp.getMatchesLost() : 0);
        spr.setWinRate(sp.getWinRate() != null ? sp.getWinRate() : 0.0);
        spr.setCurrentStreak(sp.getCurrentStreak() != null ? sp.getCurrentStreak() : 0);

        try {
            long higherPlayers = sportsProfileRepository.countHigherRankedPlayers(
                    sp.getSportName(),
                    sp.getEloRating() != null ? sp.getEloRating() : 1200,
                    sp.getMatchesWon() != null ? sp.getMatchesWon() : 0
            );
            spr.setGlobalRank((int) (higherPlayers + 1));
        } catch (Exception e) {
            spr.setGlobalRank(null);
        }

        spr.setVerificationStatus(sp.getVerificationStatus());
        spr.setCareerHighlights(sp.getCareerHighlights());
        spr.setActive(sp.isActive());
        return spr;
    }

    @Transactional
    public SportsProfileResponse createSportsProfile(CreateSportsProfileRequest request) {
        User user = userRepository.findByUserUuid(request.getUserUuid())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + request.getUserUuid()));

        if (sportsProfileRepository.findByUserUuidAndSportName(request.getUserUuid(), request.getSportName()).isPresent()) {
            throw new DuplicateResourceException("Sports Profile already exists for this sport: " + request.getSportName());
        }

        SportsProfile profile = new SportsProfile(user.getUserId(), user.getUserUuid(), request.getSportName(), request.getCategory());
        profile.setCurrentRanking(request.getCurrentRanking());
        profile.setCareerHighlights(request.getCareerHighlights());
        profile.setCategory(request.getCategory());
        profile.setEloRating(1200);
        profile.setHighestElo(1200);
        profile.setTotalMatches(0);
        profile.setMatchesWon(0);
        profile.setMatchesLost(0);
        profile.setWinRate(0.0);
        profile.setCurrentStreak(0);
        
        profile = sportsProfileRepository.save(profile);
        
        SportsProfileResponse response = new SportsProfileResponse();
        response.setUuid(profile.getSportsProfileUuid());
        response.setSportName(profile.getSportName());
        response.setCategory(profile.getCategory());
        response.setCurrentRanking(profile.getCurrentRanking());
        response.setEloRating(profile.getEloRating());
        response.setHighestElo(profile.getHighestElo());
        response.setTotalMatches(profile.getTotalMatches());
        response.setMatchesWon(profile.getMatchesWon());
        response.setMatchesLost(profile.getMatchesLost());
        response.setWinRate(profile.getWinRate());
        response.setCurrentStreak(profile.getCurrentStreak());
        response.setGlobalRank(1);
        response.setVerificationStatus(profile.getVerificationStatus());
        response.setCareerHighlights(profile.getCareerHighlights());
        response.setActive(profile.isActive());
        
        return response;
    }
}
