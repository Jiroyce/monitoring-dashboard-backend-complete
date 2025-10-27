package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;






/**
 * Métriques d'un endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndpointMetrics {
    private String path;
    private Double avgLatencyMs;
    private Double p95LatencyMs;
    private Long count;
}