package com.athlon.identityservice.user.controller;

import java.io.File;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.user.dto.request.CreateSportsProfileRequest;
import com.athlon.identityservice.user.dto.request.CreateUserRequest;
import com.athlon.identityservice.user.dto.request.UpdateUserRequest;
import com.athlon.identityservice.user.dto.request.UserSearchRequest;
import com.athlon.identityservice.user.dto.response.SportsProfileResponse;
import com.athlon.identityservice.user.dto.response.UserResponse;
import com.athlon.identityservice.user.service.UserService;
import com.athlon.identityservice.util.DocumentUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/users")
public class UserController {

    private final UserService userService;
    private final DocumentUtil documentUtil;

    public UserController(UserService userService, DocumentUtil documentUtil) {
        this.userService = userService;
        this.documentUtil = documentUtil;
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

    @PostMapping(value = "/uploadProfilePhoto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfilePhoto(
            @RequestParam("userUuid") UUID userUuid,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        UserResponse response = userService.updateUserPhoto(userUuid, file, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded successfully", response));
    }

    @PostMapping(value = "/uploadPhoto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadPhoto(
            @RequestParam("userUuid") UUID userUuid,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        UserResponse response = userService.updateUserPhoto(userUuid, file, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded successfully", response));
    }

    @PostMapping(value = "/updateProfileWithPhoto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> updateProfileWithPhoto(
            @RequestParam("uuid") UUID userUuid,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        UserResponse response = userService.updateUserWithPhoto(
                userUuid, firstName, lastName, phone, city, district, state, photo, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", response));
    }

    @PostMapping(value = "/updatePhoto/{uuid}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> updateUserPhoto(
            @PathVariable("uuid") UUID uuid,
            @RequestParam("photo") MultipartFile photo,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long currentUserId) {
        UserResponse response = userService.updateUserPhoto(uuid, photo, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("User photo updated successfully", response));
    }

    @GetMapping("/photo/{fileName}")
    public ResponseEntity<byte[]> getUserPhoto(@PathVariable("fileName") String fileName) {
        String filePath = userService.getUserPhotoUploadDir() + File.separator + "photos" + File.separator + fileName;
        File f = new File(filePath);
        if (!f.exists()) {
            filePath = userService.getUserPhotoUploadDir() + File.separator + fileName;
        }
        return documentUtil.getFile(filePath);
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

    @GetMapping("/getUserByPhone/{phone}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByPhone(@PathVariable("phone") String phone) {
        UserResponse response = userService.getUserByPhone(phone);
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

    @GetMapping("/stats/{uuid}")
    public ResponseEntity<ApiResponse<SportsProfileResponse>> getUserStats(
            @PathVariable("uuid") UUID uuid,
            @RequestParam(value = "sportName", required = false, defaultValue = "Badminton") String sportName) {
        SportsProfileResponse response = userService.getUserStats(uuid, sportName);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
