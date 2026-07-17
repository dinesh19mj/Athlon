package com.athlon.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI gatewayOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ATHLON Gateway Service API")
                        .description("API Gateway routing to microservices for the ATHLON platform")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("ATHLON Team")
                                .email("support@athlon.com")));
    }
}
