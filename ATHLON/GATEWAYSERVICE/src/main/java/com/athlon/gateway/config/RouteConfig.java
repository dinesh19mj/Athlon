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

    @Value("${service.payment.url}")
    private String paymentServiceUrl;

    @Value("${service.marketplace.url:http://localhost:5055}")
    private String marketplaceServiceUrl;

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

    @Bean
    public RouterFunction<ServerResponse> paymentRoute() {
        return route("payment_service")
                .route(request -> request.path().startsWith("/api/payments/"), http(paymentServiceUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> marketplaceRoute() {
        return route("marketplace_service")
                .route(request -> request.path().startsWith("/api/marketplace/"), http(marketplaceServiceUrl))
                .build();
    }
}
