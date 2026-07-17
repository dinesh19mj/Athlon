package com.athlon.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;

@Configuration
public class RouteConfig {

    @Value("${service.auth.url}")
    private String authServiceUrl;

    @Value("${service.identity.url}")
    private String identityServiceUrl;

    @Value("${service.tournament.url}")
    private String tournamentServiceUrl;

    @Bean
    public RouterFunction<ServerResponse> authRoute() {
        return route("auth_service")
                .route(request -> request.path().startsWith("/api/auth/"), http(authServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> identityRoute() {
        return route("identity_service")
                .route(request -> request.path().startsWith("/api/identity/"), http(identityServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> tournamentRoute() {
        return route("tournament_service")
                .route(request -> request.path().startsWith("/api/tournament/"), http(tournamentServiceUrl))
                .build();
    }
}
