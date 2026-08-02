package com.athlon.identityservice.Util;

import java.io.File;
import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileStorageUtil {

	public String saveFile(MultipartFile file, String baseDir, String folder) throws IOException {

        File directory = new File(baseDir + File.separator + folder);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        File destination = new File(directory, fileName);

        file.transferTo(destination);

        return fileName;
    }
}
