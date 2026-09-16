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
import com.athlon.identityservice.organization.dto.request.AddClubPostCommentRequest;
import com.athlon.identityservice.organization.dto.request.CreateClubPostRequest;
import com.athlon.identityservice.organization.dto.request.UpdateClubPostRequest;
import com.athlon.identityservice.organization.dto.response.ClubPostCommentResponse;
import com.athlon.identityservice.organization.dto.response.ClubPostResponse;
import com.athlon.identityservice.organization.entity.ClubPost;
import com.athlon.identityservice.organization.entity.ClubPostComment;
import com.athlon.identityservice.organization.entity.ClubPostLike;
import com.athlon.identityservice.organization.entity.Organization;
import com.athlon.identityservice.organization.repository.ClubPostCommentRepository;
import com.athlon.identityservice.organization.repository.ClubPostLikeRepository;
import com.athlon.identityservice.organization.repository.ClubPostRepository;
import com.athlon.identityservice.organization.repository.OrganizationRepository;
import com.athlon.identityservice.user.entity.UserProfile;
import com.athlon.identityservice.user.repository.UserProfileRepository;
import com.athlon.identityservice.util.FileStorageUtil;

@Service
public class ClubPostService {

    private final ClubPostRepository postRepository;
    private final ClubPostLikeRepository likeRepository;
    private final ClubPostCommentRepository commentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserProfileRepository userProfileRepository;
    private final FileStorageUtil fileStorageUtil;

    @Value("${athlon.org.upload.directory}")
    private String uploadBaseDir;

    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(
            "(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/(?:[^\\/\\n\\s]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})");

    public ClubPostService(
            ClubPostRepository postRepository,
            ClubPostLikeRepository likeRepository,
            ClubPostCommentRepository commentRepository,
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
    public List<ClubPostResponse> getPosts(
            UUID organizationUuid,
            String postType,
            String targetScope,
            String search,
            String approvalStatus,
            UUID currentUserUuid) {

        List<ClubPost> list;

        if (approvalStatus != null && !approvalStatus.trim().isEmpty() && !"ALL".equalsIgnoreCase(approvalStatus)) {
            String statusUpper = approvalStatus.trim().toUpperCase();
            if (postType != null && !postType.trim().isEmpty() && !"ALL".equalsIgnoreCase(postType)) {
                list = postRepository.findByOrganizationUuidAndApprovalStatusAndPostTypeOrderByIsPinnedDescCreatedAtDesc(
                        organizationUuid, statusUpper, postType.trim().toUpperCase());
            } else {
                list = postRepository.findByOrganizationUuidAndApprovalStatusOrderByIsPinnedDescCreatedAtDesc(organizationUuid, statusUpper);
            }
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
    public ClubPostResponse getPostByUuid(UUID postUuid, UUID currentUserUuid) {
        ClubPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        // Increment view count
        post.setViewsCount((post.getViewsCount() != null ? post.getViewsCount() : 0) + 1);
        postRepository.save(post);

        return mapToResponse(post, currentUserUuid);
    }

    @Transactional
    public ClubPostResponse createPost(CreateClubPostRequest request, Long currentUserId, UUID currentUserUuid) {
        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        ClubPost post = new ClubPost();
        post.setOrganizationId(org.getOrganizationId());
        post.setOrganizationUuid(org.getOrganizationUuid());
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent().trim());

        String authorRole = request.getAuthorRole() != null ? request.getAuthorRole().trim().toUpperCase() : "MEMBER";

        post.setPostType(request.getPostType() != null ? request.getPostType().trim().toUpperCase() : "BLOG");
        if (request.getYoutubeVideoUrl() != null && !request.getYoutubeVideoUrl().trim().isEmpty()) {
            String yUrl = request.getYoutubeVideoUrl().trim();
            post.setYoutubeVideoUrl(yUrl);
            post.setYoutubeVideoId(extractYoutubeId(yUrl));
        }

        post.setMediaUrls(request.getMediaUrls());
        post.setCoverImageUrl(request.getCoverImageUrl());
        post.setTargetScope(request.getTargetScope() != null ? request.getTargetScope().trim().toUpperCase() : "ALL");
        post.setCategory(request.getCategory() != null && !request.getCategory().trim().isEmpty() ? request.getCategory().trim() : "General");
        post.setTags(request.getTags());

        post.setAuthorUserId(currentUserId);
        post.setAuthorUserUuid(currentUserUuid != null ? currentUserUuid : UUID.randomUUID());
        post.setAuthorRole(authorRole);

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

        post.setAuthorName(authorName != null && !authorName.isEmpty() ? authorName : "Club Member");
        post.setAuthorAvatar(authorAvatar);
        post.setIsPinned(false);
        post.setStatus("PUBLISHED");

        // Admins and Coaches are auto-approved, Members go through approval if configured or auto-approved
        if ("ADMIN".equalsIgnoreCase(authorRole) || "COACH".equalsIgnoreCase(authorRole) || "OWNER".equalsIgnoreCase(authorRole)) {
            post.setApprovalStatus("APPROVED");
            post.setApprovedByName(authorName);
            post.setApprovedByUserUuid(currentUserUuid);
            post.setApprovedAt(LocalDateTime.now());
        } else {
            post.setApprovalStatus("APPROVED");
            post.setApprovedByName(authorName);
            post.setApprovedByUserUuid(currentUserUuid);
            post.setApprovedAt(LocalDateTime.now());
        }

        ClubPost saved = postRepository.save(post);
        return mapToResponse(saved, currentUserUuid);
    }

    @Transactional
    public ClubPostResponse createPostWithFiles(
            CreateClubPostRequest request,
            MultipartFile coverFile,
            List<MultipartFile> mediaFiles,
            Long currentUserId,
            UUID currentUserUuid) throws IOException {

        Organization org = organizationRepository.findByOrganizationUuid(request.getOrganizationUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        String coverUrl = null;
        if (coverFile != null && !coverFile.isEmpty()) {
            coverUrl = uploadFileToDisk(coverFile, "posts/covers");
        }

        StringBuilder mediaUrlsSb = new StringBuilder();
        if (request.getMediaUrls() != null && !request.getMediaUrls().trim().isEmpty()) {
            mediaUrlsSb.append(request.getMediaUrls().trim());
        }

        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            for (MultipartFile mf : mediaFiles) {
                if (mf != null && !mf.isEmpty()) {
                    String uploadedUrl = uploadFileToDisk(mf, "posts/media");
                    if (mediaUrlsSb.length() > 0) {
                        mediaUrlsSb.append(",");
                    }
                    mediaUrlsSb.append(uploadedUrl);
                }
            }
        }

        if (coverUrl != null) {
            request.setCoverImageUrl(coverUrl);
        }
        if (mediaUrlsSb.length() > 0) {
            request.setMediaUrls(mediaUrlsSb.toString());
        }

        return createPost(request, currentUserId, currentUserUuid);
    }

    public String uploadFileToDisk(MultipartFile file, String subFolder) throws IOException {
        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + ext;
        String dirPath = uploadBaseDir + File.separator + subFolder;
        File dir = new File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File destination = new File(dir, fileName);
        file.transferTo(destination);

        return "/api/identity/uploads/" + subFolder + "/" + fileName;
    }

    @Transactional
    public ClubPostResponse updatePost(UpdateClubPostRequest request, Long currentUserId, UUID currentUserUuid) {
        ClubPost post = postRepository.findByPostUuid(request.getPostUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            post.setTitle(request.getTitle().trim());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent().trim());
        }
        if (request.getPostType() != null) {
            post.setPostType(request.getPostType().trim().toUpperCase());
        }
        if (request.getMediaUrls() != null) {
            post.setMediaUrls(request.getMediaUrls());
        }
        if (request.getCoverImageUrl() != null) {
            post.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getYoutubeVideoUrl() != null) {
            String yUrl = request.getYoutubeVideoUrl().trim();
            post.setYoutubeVideoUrl(yUrl.isEmpty() ? null : yUrl);
            post.setYoutubeVideoId(yUrl.isEmpty() ? null : extractYoutubeId(yUrl));
        }
        if (request.getTargetScope() != null) {
            post.setTargetScope(request.getTargetScope().trim().toUpperCase());
        }
        if (request.getCategory() != null) {
            post.setCategory(request.getCategory().trim());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags().trim());
        }
        if (request.getIsPinned() != null) {
            post.setIsPinned(request.getIsPinned());
        }
        if (request.getStatus() != null) {
            post.setStatus(request.getStatus().trim().toUpperCase());
        }

        ClubPost saved = postRepository.save(post);
        return mapToResponse(saved, currentUserUuid);
    }

    @Transactional
    public void deletePost(UUID postUuid) {
        ClubPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));
        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleLike(UUID postUuid, Long currentUserId, UUID currentUserUuid) {
        ClubPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        if (currentUserUuid == null) {
            currentUserUuid = UUID.randomUUID();
        }

        Optional<ClubPostLike> existing = likeRepository.findByPostUuidAndUserUuid(postUuid, currentUserUuid);
        boolean liked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            liked = false;
        } else {
            ClubPostLike like = new ClubPostLike();
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
    public ClubPostCommentResponse addComment(AddClubPostCommentRequest request, Long currentUserId, UUID currentUserUuid) {
        ClubPost post = postRepository.findByPostUuid(request.getPostUuid())
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        if (currentUserUuid == null) {
            currentUserUuid = UUID.randomUUID();
        }

        ClubPostComment comment = new ClubPostComment();
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

        comment.setAuthorName(authorName != null && !authorName.isEmpty() ? authorName : "Club Member");
        comment.setAuthorRole(authorRole != null && !authorRole.isEmpty() ? authorRole.toUpperCase() : "MEMBER");
        comment.setAuthorAvatar(authorAvatar);

        ClubPostComment saved = commentRepository.save(comment);

        long count = commentRepository.countByPostUuid(post.getPostUuid());
        post.setCommentsCount((int) count);
        postRepository.save(post);

        return mapToCommentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClubPostCommentResponse> getComments(UUID postUuid) {
        List<ClubPostComment> comments = commentRepository.findByPostUuidOrderByCreatedAtAsc(postUuid);
        return comments.stream().map(this::mapToCommentResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(UUID commentUuid) {
        ClubPostComment comment = commentRepository.findByCommentUuid(commentUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        UUID postUuid = comment.getPostUuid();
        commentRepository.delete(comment);

        Optional<ClubPost> postOpt = postRepository.findByPostUuid(postUuid);
        if (postOpt.isPresent()) {
            ClubPost post = postOpt.get();
            long count = commentRepository.countByPostUuid(postUuid);
            post.setCommentsCount((int) count);
            postRepository.save(post);
        }
    }

    @Transactional
    public ClubPostResponse togglePin(UUID postUuid, UUID currentUserUuid) {
        ClubPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        post.setIsPinned(post.getIsPinned() == null || !post.getIsPinned());
        ClubPost saved = postRepository.save(post);
        return mapToResponse(saved, currentUserUuid);
    }

    @Transactional
    public ClubPostResponse approvePost(UUID postUuid, UUID approverUserUuid, String approverName) {
        ClubPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        post.setApprovalStatus("APPROVED");
        post.setApprovedByUserUuid(approverUserUuid);
        post.setApprovedByName(approverName != null && !approverName.trim().isEmpty() ? approverName : "Club Admin");
        post.setApprovedAt(LocalDateTime.now());
        post.setRejectionReason(null);

        ClubPost saved = postRepository.save(post);
        return mapToResponse(saved, approverUserUuid);
    }

    @Transactional
    public ClubPostResponse rejectPost(UUID postUuid, UUID approverUserUuid, String approverName, String reason) {
        ClubPost post = postRepository.findByPostUuid(postUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Club post not found"));

        post.setApprovalStatus("REJECTED");
        post.setApprovedByUserUuid(approverUserUuid);
        post.setApprovedByName(approverName != null && !approverName.trim().isEmpty() ? approverName : "Club Admin");
        post.setApprovedAt(LocalDateTime.now());
        post.setRejectionReason(reason);

        ClubPost saved = postRepository.save(post);
        return mapToResponse(saved, approverUserUuid);
    }

    private ClubPostResponse mapToResponse(ClubPost post, UUID currentUserUuid) {
        ClubPostResponse res = new ClubPostResponse();
        res.setPostId(post.getPostId());
        res.setPostUuid(post.getPostUuid());
        res.setOrganizationId(post.getOrganizationId());
        res.setOrganizationUuid(post.getOrganizationUuid());
        res.setTitle(post.getTitle());
        res.setContent(post.getContent());
        res.setPostType(post.getPostType());
        res.setMediaUrls(post.getMediaUrls());
        res.setCoverImageUrl(post.getCoverImageUrl());
        res.setYoutubeVideoUrl(post.getYoutubeVideoUrl());
        res.setYoutubeVideoId(post.getYoutubeVideoId());
        res.setTargetScope(post.getTargetScope());
        res.setCategory(post.getCategory());
        res.setTags(post.getTags());
        res.setAuthorUserId(post.getAuthorUserId());
        res.setAuthorUserUuid(post.getAuthorUserUuid());
        res.setAuthorName(post.getAuthorName());
        res.setAuthorRole(post.getAuthorRole());
        res.setAuthorAvatar(post.getAuthorAvatar());
        res.setIsPinned(post.getIsPinned());
        res.setLikesCount(post.getLikesCount() != null ? post.getLikesCount() : 0);
        res.setCommentsCount(post.getCommentsCount() != null ? post.getCommentsCount() : 0);
        res.setViewsCount(post.getViewsCount() != null ? post.getViewsCount() : 0);
        res.setStatus(post.getStatus());
        res.setApprovalStatus(post.getApprovalStatus());
        res.setApprovedByName(post.getApprovedByName());
        res.setApprovedAt(post.getApprovedAt());
        res.setRejectionReason(post.getRejectionReason());
        res.setCreatedAt(post.getCreatedAt());
        res.setUpdatedAt(post.getUpdatedAt());

        if (currentUserUuid != null) {
            boolean isLiked = likeRepository.findByPostUuidAndUserUuid(post.getPostUuid(), currentUserUuid).isPresent();
            res.setIsLikedByCurrentUser(isLiked);
        } else {
            res.setIsLikedByCurrentUser(false);
        }

        return res;
    }

    private ClubPostCommentResponse mapToCommentResponse(ClubPostComment c) {
        ClubPostCommentResponse res = new ClubPostCommentResponse();
        res.setCommentId(c.getCommentId());
        res.setCommentUuid(c.getCommentUuid());
        res.setPostId(c.getPostId());
        res.setPostUuid(c.getPostUuid());
        res.setOrganizationUuid(c.getOrganizationUuid());
        res.setAuthorUserId(c.getAuthorUserId());
        res.setAuthorUserUuid(c.getAuthorUserUuid());
        res.setAuthorName(c.getAuthorName());
        res.setAuthorRole(c.getAuthorRole());
        res.setAuthorAvatar(c.getAuthorAvatar());
        res.setCommentText(c.getCommentText());
        res.setCreatedAt(c.getCreatedAt());
        return res;
    }

    private String extractYoutubeId(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        Matcher matcher = YOUTUBE_PATTERN.matcher(url.trim());
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
