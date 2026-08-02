package com.athlon.identityservice.util;

import org.springframework.stereotype.Component;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.FileInputStream;
import java.nio.file.Path;

@Component
public class DocumentUtil {

	public ResponseEntity<byte[]> getFile(@PathVariable String filePath) {
		try {
			FileInputStream userImgPathFile = new FileInputStream(filePath);
			byte[] bytes = StreamUtils.copyToByteArray(userImgPathFile);
			Path path = Path.of(filePath);
			String fileExtension = getFileExtension(path).toLowerCase();
			switch (fileExtension) {
				case "txt":
					return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(bytes);
				case "pdf":
					return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(bytes);
				case "docx":
				case "doc":
					return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(bytes);
				case "jpg":
				case "jpeg":
					return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(bytes);
				case "png":
					return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(bytes);
				case "webp":
					return ResponseEntity.ok().contentType(MediaType.parseMediaType("image/webp")).body(bytes);
				case "gif":
					return ResponseEntity.ok().contentType(MediaType.IMAGE_GIF).body(bytes);
				case "bmp":
					return ResponseEntity.ok().contentType(MediaType.parseMediaType("image/bmp")).body(bytes);
				case "svg":
					return ResponseEntity.ok().contentType(MediaType.parseMediaType("image/svg+xml")).body(bytes);
				case "zip":
					return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM).body(bytes);
				default:
					System.out.println("Unknown file type");
			}
		} catch (Exception e) {

		}
		return null;
	}

	private static String getFileExtension(Path filePath) {
		String fileName = filePath.getFileName().toString();
		int dotIndex = fileName.lastIndexOf('.');
		return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
	}
}
