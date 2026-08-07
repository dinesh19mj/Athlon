package com.athlon.identityservice.user.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.user.dto.request.CreateSportsProfileRequest;
import com.athlon.identityservice.user.dto.request.CreateUserRequest;
import com.athlon.identityservice.user.dto.request.UpdateUserRequest;
import com.athlon.identityservice.user.dto.request.UserSearchRequest;
import com.athlon.identityservice.user.dto.response.SportsProfileResponse;
import com.athlon.identityservice.user.dto.response.UserResponse;
import com.athlon.identityservice.user.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/createUser")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {
        UserResponse response = userService.createUser(request, userId);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
    }

    @PostMapping("/updateUser")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Valid @RequestBody UpdateUserRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        UserResponse response = userService.updateUser(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @PostMapping("/deleteUser/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable UUID uuid,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        userService.deleteUser(uuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/getUserByUuid/{uuid}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUuid(@PathVariable("uuid") UUID uuid) {
        UserResponse response = userService.getUserByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/searchUsers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestBody UserSearchRequest request) {
        List<UserResponse> responses = userService.searchUsers(request);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/addSportsProfile")
    public ResponseEntity<ApiResponse<SportsProfileResponse>> addSportsProfile(@Valid @RequestBody CreateSportsProfileRequest request) {
        SportsProfileResponse response = userService.createSportsProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Sports Profile added successfully", response));
    }
}
