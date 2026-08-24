package com.athlon.identityservice.util;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

@Component
public class DocumentUtil {

    public ResponseEntity<byte[]> getFile(String filePath) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            FileInputStream fis = new FileInputStream(file);
            byte[] bytes = StreamUtils.copyToByteArray(fis);
            fis.close();

            Path path = Path.of(filePath);
            String fileExtension = getFileExtension(path).toLowerCase();

            switch (fileExtension) {
                case "jpg":
                case "jpeg":
                    return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(bytes);
                case "png":
                    return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(bytes);
                case "webp":
                    return ResponseEntity.ok().contentType(MediaType.parseMediaType("image/webp")).body(bytes);
                case "gif":
                    return ResponseEntity.ok().contentType(MediaType.IMAGE_GIF).body(bytes);
                case "svg":
                    return ResponseEntity.ok().contentType(MediaType.parseMediaType("image/svg+xml")).body(bytes);
                case "pdf":
                    return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(bytes);
                default:
                    return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM).body(bytes);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getFileExtension(Path path) {
        String fileName = path.getFileName().toString();
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(lastDotIndex + 1);
    }
}
