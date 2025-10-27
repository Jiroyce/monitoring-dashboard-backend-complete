package com.gutouch.monitoring.config;

import com.google.cloud.bigtable.data.v2.BigtableDataClient;
import com.google.cloud.bigtable.data.v2.BigtableDataSettings;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
@Slf4j
public class BigtableConfig {

    @Value("${bigtable.project-id}")
    private String projectId;

    @Value("${bigtable.instance-id}")
    private String instanceId;

    @Bean
    public BigtableDataClient bigtableDataClient() throws IOException {
        log.info("Initializing BigTable client for project: {}, instance: {}", projectId, instanceId);
        
        BigtableDataSettings settings = BigtableDataSettings.newBuilder()
                .setProjectId(projectId)
                .setInstanceId(instanceId)
                .build();

        return BigtableDataClient.create(settings);
    }
}
