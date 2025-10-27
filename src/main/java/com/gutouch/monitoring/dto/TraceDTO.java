package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO pour une trace complète
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraceDTO {
    private String transactionId;
    private String messageId;
    private String endToEndId;
    private Instant startTime;
    private Instant endTime;
    private Long totalDurationMs;
    private String status;
    private List<TraceStep> steps;
    private List<Bottleneck> bottlenecks;
}
