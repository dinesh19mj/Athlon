package com.athlon.tournamentservice.util;

import java.io.File;
import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileStorageUtil {

	public String saveFileWithUploadDir(MultipartFile file, String folder, String customUploadDir) throws IOException {
        return saveFileToDir(file, customUploadDir, folder);
    }

//    public String saveFileToDir(MultipartFile file, String baseDir, String folder) throws IOException {
//        File directory = new File(baseDir + File.separator + folder);
//
//        if (!directory.exists()) {
//            directory.mkdirs();
//        }
//
//        String originalFilename = file.getOriginalFilename();
//        if (originalFilename == null) {
//            originalFilename = "uploaded_file";
//        }
//
//        String contentType = file.getContentType();
//        boolean isImage = contentType != null && contentType.startsWith("image/");
//        boolean isSvg = contentType != null && contentType.equals("image/svg+xml");
//
//        // Convert raster images to WebP
//        if (isImage && !isSvg) {
//            int dotIndex = originalFilename.lastIndexOf('.');
//            if (dotIndex != -1) {
//                originalFilename = originalFilename.substring(0, dotIndex) + ".webp";
//            } else {
//                originalFilename = originalFilename + ".webp";
//            }
//
//            String fileName = System.currentTimeMillis() + "_" + originalFilename;
//            File dest = new File(directory, fileName);
//
//            try {
//                ImmutableImage.loader()
//                        .fromStream(file.getInputStream())
//                        .output(WebpWriter.DEFAULT, dest);
//                return fileName;
//            } catch (Exception e) {
//                System.out.println("Failed to convert image to WebP, saving as original: " + e.getMessage());
//                // Fallback to saving original file
//            }
//        }
//
//        // Save original file
//        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
//        File dest = new File(directory, fileName);
//        file.transferTo(dest);
//
//        return fileName;
//    }
	
	public String saveFileToDir(MultipartFile file, String baseDir, String folder) throws IOException {

	    File directory = new File(baseDir, folder);

	    if (!directory.exists()) {
	        directory.mkdirs();
	    }

	    String originalFilename = file.getOriginalFilename();

	    if (originalFilename == null || originalFilename.isBlank()) {
	        originalFilename = "uploaded_file";
	    }

	    String fileName = System.currentTimeMillis() + "_" + originalFilename;

	    File destination = new File(directory, fileName);
	    file.transferTo(destination);

	    return fileName;
	}
}

