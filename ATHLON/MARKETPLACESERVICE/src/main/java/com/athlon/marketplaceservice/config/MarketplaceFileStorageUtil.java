package com.athlon.marketplaceservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Component
public class MarketplaceFileStorageUtil {

    @Value("${athlon.marketplace.upload.directory:C:\\Users\\neoni\\Desktop\\Athlon\\Marketplace}")
    private String baseDir;

    public String saveFile(MultipartFile file, String subFolder) throws IOException {
        File directory = new File(baseDir, subFolder).getCanonicalFile();
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "product_gear.jpg";
        }
        String cleanName = new File(originalFilename).getName().replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = System.currentTimeMillis() + "_" + cleanName;

        File destination = new File(directory, fileName).getCanonicalFile();
        if (!destination.toPath().startsWith(directory.toPath())) {
            throw new SecurityException("Invalid file destination path");
        }

        file.transferTo(destination);
        return "/api/marketplace/media/" + subFolder + "/" + fileName;
    }
}
