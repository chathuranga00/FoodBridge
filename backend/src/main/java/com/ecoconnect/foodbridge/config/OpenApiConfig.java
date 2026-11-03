package com.ecoconnect.foodbridge.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 / Swagger UI documentation configuration for FoodBridge REST API.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI foodBridgeOpenAPI(@Value("${app.api.server-url:http://localhost:8080}") String serverUrl) {
        return new OpenAPI()
                .info(new Info()
                        .title("FoodBridge REST API Specification")
                        .description("Community Sustainability & Food Rescue Platform for Sri Lanka.\n\n" +
                                "Developed by Team EcoConnect.\n\n" +
                                "Platform Rules Enforced:\n" +
                                "- Rule 1: Role-Based Access Control (RBAC) on every endpoint\n" +
                                "- Rule 2: Admin-verified publishers (Businesses, Charities, Animal Orgs)\n" +
                                "- Rule 3: Campaign approval gate before publishing\n" +
                                "- Rule 4: Verified and completed impact metrics only\n" +
                                "- Rule 5: Zero-fee direct charity contributions (out-of-band banking)\n" +
                                "- Rule 6: Beneficiary privacy protection\n" +
                                "- Rule 7: Strict human food vs. animal feed suitability separation\n" +
                                "- Rule 8: Financial segregation of charity contributions vs. business subscriptions\n" +
                                "- Rule 9: Strict input validation and secure file upload verification")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team EcoConnect")
                                .email("contact@ecoconnect.lk")
                                .url("https://foodbridge.lk"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .servers(List.of(
                        new Server().url(serverUrl).description("Configured Server"),
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://foodbridge-backend.onrender.com").description("Production Server (Render)")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                                .name("Bearer Authentication")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT Bearer token obtained from POST /api/auth/login")));
    }
}

