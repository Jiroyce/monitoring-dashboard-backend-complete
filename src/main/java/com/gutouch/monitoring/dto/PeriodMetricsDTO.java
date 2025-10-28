package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

// ============================================================================
// PERIOD COMPARISON
// ============================================================================



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodMetricsDTO {
    private String name;
    private long requests;
    private double avgLatencyMs;
    private double errorRate;
    private double successRate;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
}