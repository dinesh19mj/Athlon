package com.athlon.identityservice.organization.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.organization.dto.request.AddClubPostCommentRequest;
import com.athlon.identityservice.organization.dto.request.CreateClubPostRequest;
import com.athlon.identityservice.organization.dto.request.UpdateClubPostRequest;
import com.athlon.identityservice.organization.dto.response.ClubPostCommentResponse;
import com.athlon.identityservice.organization.dto.response.ClubPostResponse;
import com.athlon.identityservice.organization.service.ClubPostService;
import com.athlon.identityservice.util.DocumentUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/club/posts")
public class ClubPostController {

    private final ClubPostService postService;
    private final DocumentUtil documentUtil;

    public ClubPostController(ClubPostService postService, DocumentUtil documentUtil) {
        this.postService = postService;
        this.documentUtil = documentUtil;
    }

    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty() || "undefined".equalsIgnoreCase(userIdHeader) || "null".equalsIgnoreCase(userIdHeader)) {
            return 1L;
        }
        try {
            return Long.parseLong(userIdHeader.trim());
        } catch (Exception e) {
            return 1L;
        }
    }

    private UUID parseUserUuid(String userUuidHeader) {
        if (userUuidHeader == null || userUuidHeader.trim().isEmpty() || "undefined".equalsIgnoreCase(userUuidHeader) || "null".equalsIgnoreCase(userUuidHeader)) {
            return null;
        }
        try {
            return UUID.fromString(userUuidHeader.trim());
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/org/{organizationUuid}")
    public ResponseEntity<ApiResponse<List<ClubPostResponse>>> getPosts(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "type", required = false) String postType,
            @RequestParam(value = "scope", required = false) String targetScope,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "approvalStatus", required = false) String approvalStatus,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        List<ClubPostResponse> list = postService.getPosts(
                organizationUuid, postType, targetScope, search, approvalStatus, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Club posts retrieved successfully", list));
    }

    @PostMapping("/{postUuid}/approve")
    public ResponseEntity<ApiResponse<ClubPostResponse>> approvePost(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr,
            @RequestParam(value = "approverName", required = false) String approverName) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        ClubPostResponse response = postService.approvePost(postUuid, currentUserUuid, approverName);
        return ResponseEntity.ok(ApiResponse.success("Post approved and published successfully", response));
    }

    @PostMapping("/{postUuid}/reject")
    public ResponseEntity<ApiResponse<ClubPostResponse>> rejectPost(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr,
            @RequestParam(value = "approverName", required = false) String approverName,
            @RequestParam(value = "reason", required = false) String reason) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        ClubPostResponse response = postService.rejectPost(postUuid, currentUserUuid, approverName, reason);
        return ResponseEntity.ok(ApiResponse.success("Post rejected successfully", response));
    }

    @GetMapping("/{postUuid}")
    public ResponseEntity<ApiResponse<ClubPostResponse>> getPost(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        ClubPostResponse response = postService.getPostByUuid(postUuid, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Club post retrieved successfully", response));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ClubPostResponse>> createPost(
            @Valid @RequestBody CreateClubPostRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserIdStr,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        Long currentUserId = parseUserId(currentUserIdStr);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);

        ClubPostResponse response = postService.createPost(request, currentUserId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Club post created successfully", response));
    }

    @PostMapping(value = "/createMultipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ClubPostResponse>> createPostMultipart(
            @ModelAttribute CreateClubPostRequest request,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
            @RequestParam(value = "mediaFiles", required = false) List<MultipartFile> mediaFiles,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserIdStr,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) throws IOException {

        Long currentUserId = parseUserId(currentUserIdStr);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);

        ClubPostResponse response = postService.createPostWithFiles(
                request, coverFile, mediaFiles, currentUserId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Club post with media created successfully", response));
    }

    @PostMapping(value = "/uploadMedia", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "posts/media") String folder) throws IOException {

        String fileUrl = postService.uploadFileToDisk(file, folder);
        return ResponseEntity.ok(ApiResponse.success("Media uploaded successfully", fileUrl));
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<ClubPostResponse>> updatePost(
            @Valid @RequestBody UpdateClubPostRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserIdStr,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        Long currentUserId = parseUserId(currentUserIdStr);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);

        ClubPostResponse response = postService.updatePost(request, currentUserId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Club post updated successfully", response));
    }

    @PostMapping("/delete/{postUuid}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable("postUuid") UUID postUuid) {
        postService.deletePost(postUuid);
        return ResponseEntity.ok(ApiResponse.success("Club post deleted successfully", null));
    }

    @PostMapping("/{postUuid}/like")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserIdStr,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        Long currentUserId = parseUserId(currentUserIdStr);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);

        boolean liked = postService.toggleLike(postUuid, currentUserId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success(liked ? "Post liked" : "Post unliked", liked));
    }

    @PostMapping("/{postUuid}/comment")
    public ResponseEntity<ApiResponse<ClubPostCommentResponse>> addComment(
            @PathVariable("postUuid") UUID postUuid,
            @Valid @RequestBody AddClubPostCommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String currentUserIdStr,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        request.setPostUuid(postUuid);
        Long currentUserId = parseUserId(currentUserIdStr);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);

        ClubPostCommentResponse response = postService.addComment(request, currentUserId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", response));
    }

    @GetMapping("/{postUuid}/comments")
    public ResponseEntity<ApiResponse<List<ClubPostCommentResponse>>> getComments(
            @PathVariable("postUuid") UUID postUuid) {

        List<ClubPostCommentResponse> list = postService.getComments(postUuid);
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", list));
    }

    @PostMapping("/comments/{commentUuid}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable("commentUuid") UUID commentUuid) {
        postService.deleteComment(commentUuid);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }

    @PostMapping("/{postUuid}/pin")
    public ResponseEntity<ApiResponse<ClubPostResponse>> togglePin(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        ClubPostResponse response = postService.togglePin(postUuid, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Post pin status toggled", response));
    }
}
