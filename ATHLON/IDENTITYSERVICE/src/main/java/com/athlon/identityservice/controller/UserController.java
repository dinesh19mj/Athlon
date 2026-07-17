package com.athlon.identityservice.controller;

import com.athlon.identityservice.dto.request.CreateUserRequest;
import com.athlon.identityservice.dto.request.UpdateUserRequest;
import com.athlon.identityservice.dto.request.UserSearchRequest;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.dto.response.UserResponse;
import com.athlon.identityservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        Long currentUserId = 1L; 
        UserResponse response = userService.createUser(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", response));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@Valid @RequestBody UpdateUserRequest request) {
        Long currentUserId = 1L;
        UserResponse response = userService.updateUser(request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @PostMapping("/delete/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID uuid) {
        Long currentUserId = 1L;
        userService.deleteUser(uuid, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUuid(@PathVariable UUID uuid) {
        UserResponse response = userService.getUserByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestBody UserSearchRequest request) {
        List<UserResponse> responses = userService.searchUsers(request);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
