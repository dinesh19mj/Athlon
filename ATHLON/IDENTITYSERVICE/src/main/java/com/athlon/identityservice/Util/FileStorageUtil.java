package com.athlon.identityservice.util;

import java.io.File;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileStorageUtil {

	public String saveFile(MultipartFile file, String baseDir, String folder) throws IOException {
        File directory = new File(baseDir, folder).getCanonicalFile();

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "uploaded_file";
        }
        String cleanName = new File(originalFilename).getName().replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = System.currentTimeMillis() + "_" + cleanName;

        File destination = new File(directory, fileName).getCanonicalFile();
        if (!destination.toPath().startsWith(directory.toPath())) {
            throw new SecurityException("Invalid file destination path");
        }

        file.transferTo(destination);

        return fileName;
    }
}
