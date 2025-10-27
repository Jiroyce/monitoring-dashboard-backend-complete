package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;



/**
 * Status d'un service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceStatus {
    private String name;
    private String status; // healthy, degraded, down
    private Double uptimePercentage;
    private Integer requestsPerMinute;
    private Double avgLatencyMs;
    private Double successRate;
    private Double errorRate;
}