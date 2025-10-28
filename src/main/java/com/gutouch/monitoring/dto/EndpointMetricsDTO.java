package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndpointMetricsDTO {
    private String path;
    private String method;
    private String connector;
    private long requests;
    private double avgLatencyMs;
    private long errors;
    private double errorRate;
    private double p95LatencyMs;
    private double p99LatencyMs;
}