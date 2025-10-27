package com.gutouch.monitoring.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Value("${server.port}")
    private String serverPort;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Monitoring Dashboard API")
                        .description("API Backend pour le dashboard de monitoring des connecteurs PI Gateway et PI Connector")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Gutouch Team")
                                .email("support@gutouch.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://gutouch.com")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server"),
                        new Server()
                                .url("https://api-monitoring.gutouch.com")
                                .description("Production Server")
                ));
    }
}
