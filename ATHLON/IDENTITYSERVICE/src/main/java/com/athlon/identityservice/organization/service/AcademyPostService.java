package com.athlon.identityservice.organization.service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.organization.dto.request.AddPostCommentRequest;
import com.athlon.identityservice.organization.dto.request.CreateAcademyPostRequest;
import com.athlon.identityservice.organization.dto.request.UpdateAcademyPostRequest;
import com.athlon.identityservice.organization.dto.response.AcademyPostCommentResponse;
import com.athlon.identityservice.organization.dto.response.AcademyPostResponse;
import com.athlon.identityservice.organization.entity.AcademyPost;
import com.athlon.identityservice.organization.entity.AcademyPostComment;
import com.athlon.identityservice.organization.entity.AcademyPostLike;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.AcademyPostCommentRepository;
import com.athlon.identityservice.organization.repository.AcademyPostLikeRepository;
import com.athlon.identityservice.organization.repository.AcademyPostRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.util.FileStorageUtil;

@Service
public class AcademyPostService {

    private final AcademyPostRepository postRepository;
    private final AcademyPostLikeRepository likeRepository;
    private final AcademyPostCommentRepository commentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserProfileRepository userProfileRepository;
    private final FileStorageUtil fileStorageUtil;

    @Value("${athlon.org.upload.directory}")
    private String uploadBaseDir;

    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/(?:[^\\/\\n\\s]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})");

    public AcademyPostService(
            AcademyPostRepository postRepository,
            AcademyPostLikeRepository likeRepository,
            AcademyPostCommentRepository commentRepository,
            OrganizationRepository organizationRepository,
            UserProfileRepository userProfileRepository,
            FileStorageUtil fileStorageUtil) {
        this.postRepository = postRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.organizationRepository = organizationRepository;
        this.userProfileRepository = userProfileRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Transactional(readOnly = true)
    public List<AcademyPostResponse> getPosts(
            UUID organizationUuid,
            String postType,
            String targetScope,
            UUID batchUuid,
            UUID centreUuid,
            String search,
            String approvalStatus,
            UUID currentUserUuid) {

        List<AcademyPost> list;

        if (approvalStatus != null && !approvalStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(approvalStatus)) {
            String statusUpper = approvalStatus.trim().toUpperCase();
            if (postType != null && !postType.trim().isEmpty() && !"ALL".equalsIgnoreCase(postType)) {
                list = postRepository.findByOrganizationUuidAndApprovalStatusAndPostTypeOrderByIsPinnedDescCreatedAtDesc(
                        organizationUuid, statusUpper, postType.trim().toUpperCase());
            } else {
                list = postRepository.findByOrganizationUuidAndApprovalStatusOrderByIsPinnedDescCreatedAtDesc(organizationUuid, statusUpper);
            }
        } else if (batchUuid != null) {
            list = postRepository.findByOrganizationUuidAndBatchUuidOrderByIsPinnedDescCreatedAtDesc(organizationUuid, batchUuid);
        } else if (centreUuid != null) {
            list = postRepository.findByOrganizationUuidAndCentreUuidOrderByIsPinnedDescCreatedAtDesc(organizationUuid, centreUuid);
        } else if (postType != null && !postType.trim().isEmpty() && !"ALL".equalsIgnoreCase(postType)) {
            list = postRepository.findByOrganizationUuidAndPostTypeOrderByIsPinnedDescCreatedAtDesc(organizationUuid, postType.trim().toUpperCase());
        } else if (targetScope != null && !targetScope.trim().isEmpty() && !"ALL".equalsIgnoreCase(targetScope)) {
            list = postRepository.findByOrganizationUuidAndTargetScopeOrderByIsPinnedDescCreatedAtDesc(organizationUuid, targetScope.trim().toUpperCase());
        } else {
            list = postRepository.findByOrganizationUuidOrderByIsPinnedDescCreatedAtDesc(organizationUuid);
        }

        // If approvalStatus is not explicitly specified or "ALL", standard feed should show APPROVED posts + current user's own submissions
        if (approvalStatus == null || approvalStatus.trim().isEmpty()) {
            list = list.stream().filter(p -> {
                if ("APPROVED".equalsIgnoreCase(p.getApprovalStatus())) {
                    return true;
                }
                // Allow the author to see their own pending/rejected posts
                if (currentUserUuid != null && currentUserUuid.equals(p.getAuthorUserUuid())) {
                    return true;
                }
                return false;
            }).collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            list = list.stream().filter(p ->
                    (p.getTitle() != null && p.getTitle().toLowerCase().contains(q)) ||
                    (p.getContent() != null && p.getContent().toLowerCase().contains(q)) ||
                    (p.getAuthorName() != null && p.getAuthorName().toLowerCase().contains(q)) ||
                    (p.getCategory() != null && p.getCategory().toLowerCase().contains(q)) ||
                    (p.getTags() != null && p.getTags().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        return list.stream().map(p -> mapToResponse(p, currentUserUuid)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AcademyPostResponse getPostByUuid(UUID postUuid, UUID currentUserUuid) {
        AcademyPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        // Increment view count
        post.setViewsCount((post.getViewsCount() != null ? post.getViewsCount() : 0) + 1);
        postRepository.save(post);

        return mapToResponse(post, currentUserUuid);
    }

    @Transactional
    public AcademyPostResponse createPost(CreateAcademyPostRequest request, Long currentUserId, UUID currentUserUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        AcademyPost post = new AcademyPost();
        post.setOrganizationId(org.getOrganizationId());
        post.setOrganizationUuid(org.getOrganizationUuid());
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());

        String authorRole = request.getAuthorRole() != null ? request.getAuthorRole().trim().toUpperCase() : "STUDENT";
        
        // Students can only post BLOG posts - restriction rule
        if ("STUDENT".equalsIgnoreCase(authorRole)) {
            post.setPostType("BLOG");
            post.setYoutubeVideoUrl(null);
            post.setYoutubeVideoId(null);
        } else {
            post.setPostType(request.getPostType() != null ? request.getPostType().trim().toUpperCase() : "BLOG");
            if (request.getYoutubeVideoUrl() != null && !request.getYoutubeVideoUrl().trim().isEmpty()) {
                String videoUrl = request.getYoutubeVideoUrl().trim();
                post.setYoutubeVideoUrl(videoUrl);
                post.setYoutubeVideoId(extractYouTubeId(videoUrl));
            }
        }

        post.setMediaUrls(request.getMediaUrls());
        post.setCoverImageUrl(request.getCoverImageUrl());

        post.setTargetScope(request.getTargetScope() != null ? request.getTargetScope().trim().toUpperCase() : "ALL");
        post.setCentreUuid(request.getCentreUuid());
        post.setCentreName(request.getCentreName());
        post.setBatchUuid(request.getBatchUuid());
        post.setBatchName(request.getBatchName());
        post.setCategory(request.getCategory());
        post.setTags(request.getTags());

        // Author Details
        post.setAuthorUserId(currentUserId);
        post.setAuthorUserUuid(currentUserUuid);

        String authorName = request.getAuthorName();
        String authorAvatar = request.getAuthorAvatar();

        if (currentUserId != null) {
            Optional<UserProfile> profileOpt = userProfileRepository.findById(currentUserId);
            if (profileOpt.isPresent()) {
                UserProfile p = profileOpt.get();
                if (authorName == null || authorName.trim().isEmpty()) {
                    authorName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                }
                if (authorAvatar == null || authorAvatar.trim().isEmpty()) {
                    authorAvatar = p.getPhoto();
                }
            }
        }

        post.setAuthorName(authorName != null && !authorName.isEmpty() ? authorName : "Academy Member");
        post.setAuthorRole(authorRole);
        post.setAuthorAvatar(authorAvatar);

        // Approval workflow: Admin, Owner, Manager are automatically approved.
        // Coach, Staff, Student require Admin approval before public listing.
        if ("ADMIN".equalsIgnoreCase(authorRole) || "OWNER".equalsIgnoreCase(authorRole) || "MANAGER".equalsIgnoreCase(authorRole) || "SUPER_ADMIN".equalsIgnoreCase(authorRole)) {
            post.setApprovalStatus("APPROVED");
            post.setApprovedByUserUuid(currentUserUuid);
            post.setApprovedByName(post.getAuthorName());
            post.setApprovedAt(LocalDateTime.now());
        } else {
            post.setApprovalStatus("PENDING_APPROVAL");
        }

        AcademyPost saved = postRepository.save(post);
        return mapToResponse(saved, currentUserUuid);
    }

    @Transactional
    public AcademyPostResponse createPostWithFiles(
            CreateAcademyPostRequest request,
            MultipartFile coverFile,
            List<MultipartFile> galleryFiles,
            Long currentUserId,
            UUID currentUserUuid) throws IOException {

        if (coverFile != null && !coverFile.isEmpty()) {
            String savedCover = fileStorageUtil.saveFile(coverFile, uploadBaseDir, "academy" + File.separator + "posts");
            request.setCoverImageUrl("/api/identity/academy/posts/media/" + savedCover);
        }

        if (galleryFiles != null && !galleryFiles.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            if (request.getMediaUrls() != null && !request.getMediaUrls().trim().isEmpty()) {
                sb.append(request.getMediaUrls().trim());
            }
            for (MultipartFile gf : galleryFiles) {
                if (gf != null && !gf.isEmpty()) {
                    String savedGallery = fileStorageUtil.saveFile(gf, uploadBaseDir, "academy" + File.separator + "posts");
                    if (sb.length() > 0) {
                        sb.append(",");
                    }
                    sb.append("/api/identity/academy/posts/media/").append(savedGallery);
                }
            }
            request.setMediaUrls(sb.toString());
        }

        return createPost(request, currentUserId, currentUserUuid);
    }

    public List<String> uploadMediaFiles(List<MultipartFile> files) throws IOException {
        List<String> urls = new java.util.ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String saved = fileStorageUtil.saveFile(file, uploadBaseDir, "academy" + File.separator + "posts");
                    urls.add("/api/identity/academy/posts/media/" + saved);
                }
            }
        }
        return urls;
    }

    public String getUploadBaseDir() {
        return uploadBaseDir;
    }

    @Transactional
    public AcademyPostResponse updatePost(UpdateAcademyPostRequest request, Long currentUserId, UUID currentUserUuid) {
        AcademyPost post = postRepository.findByPostUuid(request.getPostUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            post.setTitle(request.getTitle().trim());
        }
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            post.setContent(request.getContent().trim());
        }
        if (request.getPostType() != null && !request.getPostType().trim().isEmpty()) {
            post.setPostType(request.getPostType().trim().toUpperCase());
        }
        if (request.getMediaUrls() != null) {
            post.setMediaUrls(request.getMediaUrls());
        }
        if (request.getCoverImageUrl() != null) {
            post.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getYoutubeVideoUrl() != null) {
            String videoUrl = request.getYoutubeVideoUrl().trim();
            post.setYoutubeVideoUrl(videoUrl);
            post.setYoutubeVideoId(extractYouTubeId(videoUrl));
        }
        if (request.getTargetScope() != null) {
            post.setTargetScope(request.getTargetScope().trim().toUpperCase());
        }
        if (request.getCentreUuid() != null) {
            post.setCentreUuid(request.getCentreUuid());
        }
        if (request.getCentreName() != null) {
            post.setCentreName(request.getCentreName());
        }
        if (request.getBatchUuid() != null) {
            post.setBatchUuid(request.getBatchUuid());
        }
        if (request.getBatchName() != null) {
            post.setBatchName(request.getBatchName());
        }
        if (request.getCategory() != null) {
            post.setCategory(request.getCategory());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }
        if (request.getIsPinned() != null) {
            post.setIsPinned(request.getIsPinned());
        }
        if (request.getStatus() != null) {
            post.setStatus(request.getStatus().trim().toUpperCase());
        }

        AcademyPost saved = postRepository.save(post);
        return mapToResponse(saved, currentUserUuid);
    }

    @Transactional
    public void deletePost(UUID postUuid) {
        AcademyPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));
        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleLike(UUID postUuid, Long currentUserId, UUID currentUserUuid) {
        AcademyPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        if (currentUserUuid == null) {
            currentUserUuid = UUID.randomUUID();
        }

        Optional<AcademyPostLike> existing = likeRepository.findByPostUuidAndUserUuid(postUuid, currentUserUuid);
        boolean liked;

        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            AcademyPostLike like = new AcademyPostLike();
            like.setPostId(post.getPostId());
            like.setPostUuid(post.getPostUuid());
            like.setOrganizationUuid(post.getOrganizationUuid());
            like.setUserId(currentUserId);
            like.setUserUuid(currentUserUuid);
            like.setReactionType("LIKE");
            likeRepository.save(like);
            liked = true;
        }

        long count = likeRepository.countByPostUuid(postUuid);
        post.setLikesCount((int) count);
        postRepository.save(post);

        return liked;
    }

    @Transactional
    public AcademyPostCommentResponse addComment(AddPostCommentRequest request, Long currentUserId, UUID currentUserUuid) {
        AcademyPost post = postRepository.findByPostUuid(request.getPostUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        if (currentUserUuid == null) {
            currentUserUuid = UUID.randomUUID();
        }

        AcademyPostComment comment = new AcademyPostComment();
        comment.setPostId(post.getPostId());
        comment.setPostUuid(post.getPostUuid());
        comment.setOrganizationUuid(post.getOrganizationUuid());
        comment.setAuthorUserId(currentUserId);
        comment.setAuthorUserUuid(currentUserUuid);
        comment.setCommentText(request.getCommentText().trim());

        String authorName = request.getAuthorName();
        String authorRole = request.getAuthorRole();
        String authorAvatar = request.getAuthorAvatar();

        if (currentUserId != null) {
            Optional<UserProfile> profileOpt = userProfileRepository.findById(currentUserId);
            if (profileOpt.isPresent()) {
                UserProfile p = profileOpt.get();
                if (authorName == null || authorName.trim().isEmpty()) {
                    authorName = ((p.getFirstName() != null ? p.getFirstName() : "") + " " + (p.getLastName() != null ? p.getLastName() : "")).trim();
                }
                if (authorAvatar == null || authorAvatar.trim().isEmpty()) {
                    authorAvatar = p.getPhoto();
                }
            }
        }

        comment.setAuthorName(authorName != null && !authorName.isEmpty() ? authorName : "Academy Member");
        comment.setAuthorRole(authorRole != null && !authorRole.isEmpty() ? authorRole.toUpperCase() : "STUDENT");
        comment.setAuthorAvatar(authorAvatar);

        AcademyPostComment saved = commentRepository.save(comment);

        long count = commentRepository.countByPostUuid(post.getPostUuid());
        post.setCommentsCount((int) count);
        postRepository.save(post);

        return mapToCommentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AcademyPostCommentResponse> getComments(UUID postUuid) {
        List<AcademyPostComment> comments = commentRepository.findByPostUuidOrderByCreatedAtAsc(postUuid);
        return comments.stream().map(this::mapToCommentResponse).collect(Collectors.toList());
    }

    @Transactional
    public AcademyPostResponse togglePin(UUID postUuid, UUID currentUserUuid) {
        AcademyPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        post.setIsPinned(post.getIsPinned() == null || !post.getIsPinned());
        AcademyPost saved = postRepository.save(post);
        return mapToResponse(saved, currentUserUuid);
    }

    @Transactional
    public AcademyPostResponse approvePost(UUID postUuid, UUID approverUserUuid, String approverName) {
        AcademyPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        post.setApprovalStatus("APPROVED");
        post.setApprovedByUserUuid(approverUserUuid);
        post.setApprovedByName(approverName != null && !approverName.trim().isEmpty() ? approverName : "Academy Admin");
        post.setApprovedAt(LocalDateTime.now());
        post.setRejectionReason(null);

        AcademyPost saved = postRepository.save(post);
        return mapToResponse(saved, approverUserUuid);
    }

    @Transactional
    public AcademyPostResponse rejectPost(UUID postUuid, UUID approverUserUuid, String approverName, String reason) {
        AcademyPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Academy post not found"));

        post.setApprovalStatus("REJECTED");
        post.setApprovedByUserUuid(approverUserUuid);
        post.setApprovedByName(approverName != null && !approverName.trim().isEmpty() ? approverName : "Academy Admin");
        post.setApprovedAt(LocalDateTime.now());
        post.setRejectionReason(reason != null && !reason.trim().isEmpty() ? reason : "Post rejected by admin");

        AcademyPost saved = postRepository.save(post);
        return mapToResponse(saved, approverUserUuid);
    }

    private String extractYouTubeId(String url) {
        if (url == null || url.trim().isEmpty()) return null;
        Matcher matcher = YOUTUBE_PATTERN.matcher(url.trim());
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private AcademyPostResponse mapToResponse(AcademyPost post, UUID currentUserUuid) {
        AcademyPostResponse resp = new AcademyPostResponse();
        resp.setPostId(post.getPostId());
        resp.setPostUuid(post.getPostUuid());
        resp.setOrganizationId(post.getOrganizationId());
        resp.setOrganizationUuid(post.getOrganizationUuid());
        resp.setTitle(post.getTitle());
        resp.setContent(post.getContent());
        resp.setPostType(post.getPostType());
        resp.setMediaUrls(post.getMediaUrls());
        resp.setCoverImageUrl(post.getCoverImageUrl());
        resp.setYoutubeVideoUrl(post.getYoutubeVideoUrl());
        resp.setYoutubeVideoId(post.getYoutubeVideoId());
        resp.setTargetScope(post.getTargetScope());
        resp.setCentreUuid(post.getCentreUuid());
        resp.setCentreName(post.getCentreName());
        resp.setBatchUuid(post.getBatchUuid());
        resp.setBatchName(post.getBatchName());
        resp.setCategory(post.getCategory());
        resp.setTags(post.getTags());
        resp.setAuthorUserId(post.getAuthorUserId());
        resp.setAuthorUserUuid(post.getAuthorUserUuid());
        resp.setAuthorName(post.getAuthorName());
        resp.setAuthorRole(post.getAuthorRole());
        resp.setAuthorAvatar(post.getAuthorAvatar());
        resp.setIsPinned(post.getIsPinned());
        resp.setLikesCount(post.getLikesCount() != null ? post.getLikesCount() : 0);
        resp.setCommentsCount(post.getCommentsCount() != null ? post.getCommentsCount() : 0);
        resp.setViewsCount(post.getViewsCount() != null ? post.getViewsCount() : 0);
        resp.setStatus(post.getStatus());
        resp.setApprovalStatus(post.getApprovalStatus());
        resp.setApprovedByName(post.getApprovedByName());
        resp.setApprovedAt(post.getApprovedAt());
        resp.setRejectionReason(post.getRejectionReason());
        resp.setCreatedAt(post.getCreatedAt());
        resp.setUpdatedAt(post.getUpdatedAt());

        if (currentUserUuid != null && post.getPostUuid() != null) {
            resp.setIsLikedByCurrentUser(likeRepository.findByPostUuidAndUserUuid(post.getPostUuid(), currentUserUuid).isPresent());
        } else {
            resp.setIsLikedByCurrentUser(false);
        }

        return resp;
    }

    private AcademyPostCommentResponse mapToCommentResponse(AcademyPostComment comment) {
        AcademyPostCommentResponse resp = new AcademyPostCommentResponse();
        resp.setCommentId(comment.getCommentId());
        resp.setCommentUuid(comment.getCommentUuid());
        resp.setPostId(comment.getPostId());
        resp.setPostUuid(comment.getPostUuid());
        resp.setOrganizationUuid(comment.getOrganizationUuid());
        resp.setAuthorUserId(comment.getAuthorUserId());
        resp.setAuthorUserUuid(comment.getAuthorUserUuid());
        resp.setAuthorName(comment.getAuthorName());
        resp.setAuthorRole(comment.getAuthorRole());
        resp.setAuthorAvatar(comment.getAuthorAvatar());
        resp.setCommentText(comment.getCommentText());
        resp.setCreatedAt(comment.getCreatedAt());
        return resp;
    }
}
