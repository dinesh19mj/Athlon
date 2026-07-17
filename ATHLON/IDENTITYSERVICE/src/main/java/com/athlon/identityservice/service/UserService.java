package com.athlon.identityservice.service;

import com.athlon.identityservice.dto.request.CreateUserRequest;
import com.athlon.identityservice.dto.request.UpdateUserRequest;
import com.athlon.identityservice.dto.request.UserSearchRequest;
import com.athlon.identityservice.dto.response.UserResponse;
import com.athlon.identityservice.entity.User;
import com.athlon.identityservice.entity.UserProfile;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.repository.UserProfileRepository;
import com.athlon.identityservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, Long currentUserId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User already exists with email: " + request.getEmail());
        }

        User user = new User(request.getEmail(), request.getPassword(), currentUserId);
        user = userRepository.save(user);

        UserProfile profile = new UserProfile(
                user.getId(),
                user.getUuid(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone(),
                currentUserId
        );
        userProfileRepository.save(profile);

        return mapToResponse(user, profile);
    }

    @Transactional
    public UserResponse updateUser(UpdateUserRequest request, Long currentUserId) {
        User user = userRepository.findByUuid(request.getUuid())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + request.getUuid()));
                
        UserProfile profile = userProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found for User UUID: " + request.getUuid()));

        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setPhone(request.getPhone());
        profile.setUpdatedBy(currentUserId);
        
        userProfileRepository.save(profile);

        return mapToResponse(user, profile);
    }

    @Transactional
    public void deleteUser(UUID uuid, Long currentUserId) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + uuid));
        
        user.setActive(false);
        user.setUpdatedBy(currentUserId);
        userRepository.save(user);

        userProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            profile.setActive(false);
            profile.setUpdatedBy(currentUserId);
            userProfileRepository.save(profile);
        });
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByUuid(UUID uuid) {
        User user = userRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with UUID: " + uuid));
                
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);

        return mapToResponse(user, profile);
    }
    
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(UserSearchRequest request) {
        // Simplified search for demonstration. A full implementation might use CriteriaBuilder or QueryDSL
        List<User> users = userRepository.findAll();
        
        return users.stream().map(user -> {
            UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
            return mapToResponse(user, profile);
        }).collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user, UserProfile profile) {
        UserResponse response = new UserResponse();
        response.setUuid(user.getUuid());
        response.setEmail(user.getEmail());
        response.setActive(user.isActive());
        
        if (profile != null) {
            response.setFirstName(profile.getFirstName());
            response.setLastName(profile.getLastName());
            response.setPhone(profile.getPhone());
        }
        
        return response;
    }
}
