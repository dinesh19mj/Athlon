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
import com.athlon.identityservice.organization.dto.request.AddPostCommentRequest;
import com.athlon.identityservice.organization.dto.request.CreateAcademyPostRequest;
import com.athlon.identityservice.organization.dto.request.UpdateAcademyPostRequest;
import com.athlon.identityservice.organization.dto.response.AcademyPostCommentResponse;
import com.athlon.identityservice.organization.dto.response.AcademyPostResponse;
import com.athlon.identityservice.organization.service.AcademyPostService;
import com.athlon.identityservice.util.DocumentUtil;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/academy/posts")
public class AcademyPostController {

    private final AcademyPostService postService;
    private final DocumentUtil documentUtil;

    public AcademyPostController(AcademyPostService postService, DocumentUtil documentUtil) {
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
    public ResponseEntity<ApiResponse<List<AcademyPostResponse>>> getPosts(
            @PathVariable("organizationUuid") UUID organizationUuid,
            @RequestParam(value = "type", required = false) String postType,
            @RequestParam(value = "scope", required = false) String targetScope,
            @RequestParam(value = "batchUuid", required = false) UUID batchUuid,
            @RequestParam(value = "centreUuid", required = false) UUID centreUuid,
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        List<AcademyPostResponse> list = postService.getPosts(
                organizationUuid, postType, targetScope, batchUuid, centreUuid, search, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Academy posts retrieved successfully", list));
    }

    @GetMapping("/{postUuid}")
    public ResponseEntity<ApiResponse<AcademyPostResponse>> getPostByUuid(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        AcademyPostResponse response = postService.getPostByUuid(postUuid, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Post retrieved successfully", response));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AcademyPostResponse>> createPost(
            @Valid @RequestBody CreateAcademyPostRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        Long userId = parseUserId(userIdHeader);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        AcademyPostResponse response = postService.createPost(request, userId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Post published successfully", response));
    }

    @PostMapping(value = "/createMultipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AcademyPostResponse>> createPostMultipart(
            @ModelAttribute CreateAcademyPostRequest request,
            @RequestParam(value = "coverFile", required = false) MultipartFile coverFile,
            @RequestParam(value = "galleryFiles", required = false) List<MultipartFile> galleryFiles,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) throws IOException {

        Long userId = parseUserId(userIdHeader);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        AcademyPostResponse response = postService.createPostWithFiles(request, coverFile, galleryFiles, userId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Post published successfully with files", response));
    }

    @PostMapping(value = "/uploadMedia", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<String>>> uploadMedia(
            @RequestParam("files") List<MultipartFile> files) throws IOException {
        List<String> urls = postService.uploadMediaFiles(files);
        return ResponseEntity.ok(ApiResponse.success("Media files uploaded successfully", urls));
    }

    @GetMapping("/media/{fileName}")
    public ResponseEntity<byte[]> getPostMedia(@PathVariable("fileName") String fileName) {
        String filePath = postService.getUploadBaseDir() + File.separator + "academy" + File.separator + "posts" + File.separator + fileName;
        return documentUtil.getFile(filePath);
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<AcademyPostResponse>> updatePost(
            @Valid @RequestBody UpdateAcademyPostRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        Long userId = parseUserId(userIdHeader);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        AcademyPostResponse response = postService.updatePost(request, userId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully", response));
    }

    @PostMapping("/delete/{postUuid}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable("postUuid") UUID postUuid) {

        postService.deletePost(postUuid);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

    @PostMapping("/{postUuid}/like")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        Long userId = parseUserId(userIdHeader);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        boolean liked = postService.toggleLike(postUuid, userId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success(liked ? "Post liked" : "Post unliked", liked));
    }

    @PostMapping("/{postUuid}/comment")
    public ResponseEntity<ApiResponse<AcademyPostCommentResponse>> addComment(
            @PathVariable("postUuid") UUID postUuid,
            @Valid @RequestBody AddPostCommentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        request.setPostUuid(postUuid);
        Long userId = parseUserId(userIdHeader);
        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        AcademyPostCommentResponse response = postService.addComment(request, userId, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", response));
    }

    @GetMapping("/{postUuid}/comments")
    public ResponseEntity<ApiResponse<List<AcademyPostCommentResponse>>> getComments(
            @PathVariable("postUuid") UUID postUuid) {

        List<AcademyPostCommentResponse> list = postService.getComments(postUuid);
        return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", list));
    }

    @PostMapping("/{postUuid}/pin")
    public ResponseEntity<ApiResponse<AcademyPostResponse>> togglePin(
            @PathVariable("postUuid") UUID postUuid,
            @RequestHeader(value = "X-User-Uuid", required = false) String currentUserUuidStr) {

        UUID currentUserUuid = parseUserUuid(currentUserUuidStr);
        AcademyPostResponse response = postService.togglePin(postUuid, currentUserUuid);
        return ResponseEntity.ok(ApiResponse.success("Pin status updated successfully", response));
    }
}
