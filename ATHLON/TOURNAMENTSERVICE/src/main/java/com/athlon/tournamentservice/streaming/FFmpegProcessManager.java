package com.athlon.tournamentservice.streaming;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class FFmpegProcessManager {
    private static final Logger logger = LoggerFactory.getLogger(FFmpegProcessManager.class);
    
    // Map of session/court key -> Active FFmpeg Process
    private final Map<String, Process> activeProcesses = new ConcurrentHashMap<>();

    public OutputStream startStream(String streamIdentifier, String streamKey, StreamProfile profile) throws IOException {
        if (activeProcesses.containsKey(streamIdentifier)) {
            logger.warn("Stream process already active for identifier: {}", streamIdentifier);
            return activeProcesses.get(streamIdentifier).getOutputStream();
        }

        if (profile == null) {
            profile = StreamProfile.HD_720P_30;
        }

        // YouTube Ingest endpoint (RTMPS / RTMP)
        String rtmpUrl = "rtmps://a.rtmp.youtube.com/live2/" + streamKey;

        // Command to read from live stdin (pipe:0) and transcode/transmux directly to YouTube RTMPS
        // Note: NEVER use -re for live stdin pipes!
        List<String> cmd = new ArrayList<>();
        cmd.add("ffmpeg");
        cmd.add("-loglevel"); cmd.add("warning");
        
        // Input: Pipe from real-time browser stream
        cmd.add("-i"); cmd.add("pipe:0");

        // Video encoding & YouTube CBR profile (H.264, 2-second strict GOP)
        cmd.add("-c:v"); cmd.add("libx264");
        cmd.add("-preset"); cmd.add("veryfast");
        cmd.add("-tune"); cmd.add("zerolatency");
        cmd.add("-pix_fmt"); cmd.add("yuv420p");
        cmd.add("-profile:v"); cmd.add("main");

        cmd.add("-r"); cmd.add(String.valueOf(profile.getFps()));
        cmd.add("-g"); cmd.add(String.valueOf(profile.getGopSize()));
        cmd.add("-keyint_min"); cmd.add(String.valueOf(profile.getGopSize()));
        cmd.add("-b:v"); cmd.add(profile.getVideoBitrate());
        cmd.add("-maxrate"); cmd.add(profile.getMaxRate());
        cmd.add("-bufsize"); cmd.add(profile.getBufSize());

        // Audio encoding (AAC 128k, 44.1kHz Stereo required by YouTube)
        cmd.add("-c:a"); cmd.add("aac");
        cmd.add("-b:a"); cmd.add("128k");
        cmd.add("-ar"); cmd.add("44100");
        cmd.add("-ac"); cmd.add("2");

        // Output container & destination
        cmd.add("-f"); cmd.add("flv");
        cmd.add(rtmpUrl);

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectError(ProcessBuilder.Redirect.INHERIT);
        
        logger.info("Starting YouTube FFmpeg process for [{}] with profile [{}]", streamIdentifier, profile);
        Process process = pb.start();
        activeProcesses.put(streamIdentifier, process);
        
        return process.getOutputStream();
    }

    // Overload for backward compatibility
    public OutputStream startStream(String streamKey) throws IOException {
        return startStream(streamKey, streamKey, StreamProfile.HD_720P_30);
    }

    public void stopStream(String streamIdentifier) {
        Process process = activeProcesses.remove(streamIdentifier);
        if (process != null) {
            try {
                OutputStream os = process.getOutputStream();
                if (os != null) {
                    os.flush();
                    os.close(); // Send EOF to FFmpeg for clean FLV container finalization
                }
                boolean finished = process.waitFor(3, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                }
            } catch (Exception e) {
                logger.error("Error gracefully stopping FFmpeg for [{}]", streamIdentifier, e);
                process.destroyForcibly();
            }
            logger.info("Stopped FFmpeg process for [{}]", streamIdentifier);
        }
    }

    public boolean isStreamActive(String streamIdentifier) {
        Process p = activeProcesses.get(streamIdentifier);
        return p != null && p.isAlive();
    }
}
