package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;



// ============================================================================
// ANOMALIES
// ============================================================================

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyDTO {
    private String id;
    private String metric;          // "error_rate", "latency", etc.
    private double value;
    private double threshold;
    private String severity;        // "critical", "warning"
    private ZonedDateTime timestamp;
    private String description;
    private String rootCause;
    private String connector;
}