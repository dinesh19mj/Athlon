package com.athlon.tournamentservice.streaming;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(liveStreamHandler(), "/ws/livestream")
                .setAllowedOrigins("*");
    }

    @Bean
    public LiveStreamHandler liveStreamHandler() {
        return new LiveStreamHandler();
    }
}

