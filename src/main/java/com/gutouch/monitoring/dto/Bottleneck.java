package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;





/**
 * Bottleneck détecté
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bottleneck {
    private Integer step;
    private String service;
    private Long durationMs;
    private Double percentage;
    private String suggestion;
}
