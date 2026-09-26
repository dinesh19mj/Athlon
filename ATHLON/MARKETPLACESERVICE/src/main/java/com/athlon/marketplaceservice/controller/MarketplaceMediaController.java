package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.config.MarketplaceFileStorageUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/media")
public class MarketplaceMediaController {

    private final MarketplaceFileStorageUtil fileStorageUtil;

    @Value("${athlon.marketplace.upload.directory:C:\\Users\\neoni\\Desktop\\Athlon\\Marketplace}")
    private String baseDir;

    public MarketplaceMediaController(MarketplaceFileStorageUtil fileStorageUtil) {
        this.fileStorageUtil = fileStorageUtil;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "products") String folder
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "File is empty"));
        }
        try {
            String fileUrl = fileStorageUtil.saveFile(file, folder);
            return ResponseEntity.status(HttpStatus.CREATED).body(Collections.singletonMap("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to store media file: " + e.getMessage()));
        }
    }

    @GetMapping("/{folder}/{filename}")
    public ResponseEntity<Resource> serveMedia(
            @PathVariable("folder") String folder,
            @PathVariable("filename") String filename
    ) {
        try {
            File file = new File(new File(baseDir, folder), filename).getCanonicalFile();
            if (!file.exists() || !file.canRead()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
