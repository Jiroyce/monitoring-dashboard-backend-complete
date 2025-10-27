package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;




/**
 * DTO pour les détails d'un connector
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectorDetailsDTO {
    private String connector;
    private Double uptimePercentage;
    private Long totalRequests;
    private Double successRate;
    private Double errorRate;
    private Double avgLatencyMs;
    private LatencyPercentiles latencyPercentiles;
    private Map<String, Long> latencyDistribution;
    private Map<String, Long> statusBreakdown;
    private List<EndpointMetrics> topSlowEndpoints;
    private List<EndpointError> topErrorEndpoints;
}