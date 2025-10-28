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
public class ConnectorMetricsDTO {
    private String name;
    private long requests;
    private double requestsPercentage;
    private double avgLatencyMs;
    private double errorRate;
    private double successRate;
}