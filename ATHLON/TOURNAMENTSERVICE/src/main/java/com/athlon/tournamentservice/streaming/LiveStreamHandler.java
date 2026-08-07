package com.athlon.tournamentservice.streaming;

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

    @Autowired
    private FFmpegProcessManager ffmpegProcessManager;

    // session ID -> Stream Key mapping
    private final Map<String, String> sessionStreamKeys = new ConcurrentHashMap<>();
    // session ID -> OutputStream mapping
    private final Map<String, OutputStream> sessionOutputStreams = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("New WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        // Expecting the client to send a JSON or just the stream key as the first message
        // Example payload: {"streamKey": "xyz-123"}
        if (payload.startsWith("{\"streamKey\"")) {
            // Very naive JSON parsing for demonstration
            String streamKey = payload.split("\"")[3];
            logger.info("Session {} provided stream key: {}", session.getId(), streamKey);
            
            sessionStreamKeys.put(session.getId(), streamKey);
            OutputStream os = ffmpegProcessManager.startStream(streamKey);
            sessionOutputStreams.put(session.getId(), os);
            
            session.sendMessage(new TextMessage("{\"status\":\"STREAM_STARTED\"}"));
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws IOException {
        OutputStream os = sessionOutputStreams.get(session.getId());
        if (os != null) {
            byte[] bytes = message.getPayload().array();
            os.write(bytes);
            os.flush(); // Flush the bytes to ffmpeg stdin
        } else {
            logger.warn("Received binary data but stream is not initialized for session: {}", session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("WebSocket connection closed: {}", session.getId());
        String streamKey = sessionStreamKeys.remove(session.getId());
        if (streamKey != null) {
            ffmpegProcessManager.stopStream(streamKey);
        }
        sessionOutputStreams.remove(session.getId());
    }
}

