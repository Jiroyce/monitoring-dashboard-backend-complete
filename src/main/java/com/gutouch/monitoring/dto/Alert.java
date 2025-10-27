package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class Alert {
    private String id;
    private String severity; // critical, warning
    private String name;
    private Double currentValue;
    private Double threshold;
    private Instant triggeredAt;
    private Long durationMinutes;
    private String impact;
    private String description;
    private String connector;
    private Boolean acknowledged;
    private String acknowledgedBy;
    private Instant acknowledgedAt;
}