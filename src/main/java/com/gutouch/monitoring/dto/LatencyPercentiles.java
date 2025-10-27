package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;






/**
 * Percentiles de latence
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LatencyPercentiles {
    private Double p50;
    private Double p75;
    private Double p90;
    private Double p95;
    private Double p99;
}