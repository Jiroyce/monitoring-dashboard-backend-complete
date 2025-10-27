package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;





/**
 * Métriques totales
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotalMetrics {
    private Long totalRequests;
    private Double successRate;
    private Double errorRate;
    private Double avgLatencyMs;
    private Double p50LatencyMs;
    private Double p95LatencyMs;
    private Double p99LatencyMs;
    private Double timeoutRate;
}