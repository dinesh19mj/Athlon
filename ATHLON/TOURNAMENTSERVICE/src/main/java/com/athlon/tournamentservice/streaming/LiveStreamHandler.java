package com.athlon.tournamentservice.streaming;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LiveStreamHandler extends AbstractWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(LiveStreamHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private FFmpegProcessManager ffmpegProcessManager;

    // session ID -> Stream Identifier mapping
    private final Map<String, String> sessionIdentifiers = new ConcurrentHashMap<>();
    // session ID -> OutputStream mapping
    private final Map<String, OutputStream> sessionOutputStreams = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("New WebSocket live stream connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            String action = rootNode.has("action") ? rootNode.get("action").asText() : "START";
            
            if ("STOP".equalsIgnoreCase(action) || "STOP_BROADCAST".equalsIgnoreCase(action)) {
                cleanupSession(session);
                session.sendMessage(new TextMessage("{\"status\":\"STREAM_STOPPED\"}"));
                return;
            }

            // Extract stream key and profile
            String streamKey = rootNode.has("streamKey") ? rootNode.get("streamKey").asText() : null;
            String profileStr = rootNode.has("profile") ? rootNode.get("profile").asText() : "HD_720P_30";
            StreamProfile profile = StreamProfile.fromString(profileStr);

            if (streamKey == null || streamKey.trim().isEmpty()) {
                session.sendMessage(new TextMessage("{\"status\":\"ERROR\",\"message\":\"Stream key is required\"}"));
                return;
            }

            String streamIdentifier = session.getId();
            sessionIdentifiers.put(session.getId(), streamIdentifier);
            
            logger.info("Session {} initializing stream for YouTube with profile {}", session.getId(), profile);
            OutputStream os = ffmpegProcessManager.startStream(streamIdentifier, streamKey.trim(), profile);
            sessionOutputStreams.put(session.getId(), os);

            session.sendMessage(new TextMessage("{\"status\":\"STREAM_READY\",\"profile\":\"" + profile.name() + "\"}"));
        } catch (Exception e) {
            logger.error("Error processing stream control message: {}", payload, e);
            session.sendMessage(new TextMessage("{\"status\":\"ERROR\",\"message\":\"" + e.getMessage() + "\"}"));
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws IOException {
        OutputStream os = sessionOutputStreams.get(session.getId());
        if (os != null) {
            byte[] bytes = message.getPayload().array();
            os.write(bytes);
            os.flush(); // Forward binary frame directly to FFmpeg standard input
        } else {
            logger.warn("Received binary data but stream is not initialized for session: {}", session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("WebSocket connection closed for session: {}", session.getId());
        cleanupSession(session);
    }

    private void cleanupSession(WebSocketSession session) {
        String streamIdentifier = sessionIdentifiers.remove(session.getId());
        if (streamIdentifier != null) {
            ffmpegProcessManager.stopStream(streamIdentifier);
        }
        sessionOutputStreams.remove(session.getId());
    }
}
