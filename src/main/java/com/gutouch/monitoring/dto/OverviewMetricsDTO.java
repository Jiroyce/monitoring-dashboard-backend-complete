package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * DTO pour les métriques d'overview
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverviewMetricsDTO {
    private Instant timestamp;
    private String timeRange;
    private List<ServiceStatus> services;
    private TotalMetrics totals;
    private List<TimelinePoint> timeline;
}