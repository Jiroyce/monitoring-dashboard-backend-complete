package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;




/**
 * Résumé des logs
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogSummary {
    private Double successRate;
    private Double avgLatencyMs;
    private Long errorCount;
}