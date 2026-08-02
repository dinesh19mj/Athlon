package com.athlon.tournament.streaming;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class FFmpegProcessManager {
    private static final Logger logger = LoggerFactory.getLogger(FFmpegProcessManager.class);
    
    // Map of streamKey -> FFmpeg Process
    private final Map<String, Process> activeProcesses = new ConcurrentHashMap<>();
    
    public OutputStream startStream(String streamKey) throws IOException {
        if (activeProcesses.containsKey(streamKey)) {
            logger.warn("Stream already running for key: {}", streamKey);
            return activeProcesses.get(streamKey).getOutputStream();
        }

        // Hardcoded YouTube RTMP URL base for demonstration
        String rtmpUrl = "rtmp://a.rtmp.youtube.com/live2/" + streamKey;

        // Command to read from stdin (WebM) and pipe to RTMP
        // -i pipe:0 means read from standard input
        // -c:v copy -c:a aac means copy video (since it's already encoded by browser) and encode audio to AAC
        String[] cmd = {
            "ffmpeg",
            "-i", "pipe:0",
            "-c:v", "copy",
            "-c:a", "aac",
            "-f", "flv",
            rtmpUrl
        };

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectError(ProcessBuilder.Redirect.INHERIT); // Print ffmpeg errors to console
        
        logger.info("Starting FFmpeg process for RTMP URL: {}", rtmpUrl);
        Process process = pb.start();
        activeProcesses.put(streamKey, process);
        
        return process.getOutputStream();
    }

    public void stopStream(String streamKey) {
        Process process = activeProcesses.remove(streamKey);
        if (process != null) {
            try {
                process.getOutputStream().close(); // Sending EOF to ffmpeg so it shuts down cleanly
            } catch (IOException e) {
                logger.error("Error closing ffmpeg stream", e);
            }
            process.destroy();
            logger.info("Stopped FFmpeg process for key: {}", streamKey);
        }
    }
}
