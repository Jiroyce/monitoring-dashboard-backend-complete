package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;



/**
 * Étape d'une trace
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraceStep {
    private Integer sequence;
    private Instant timestamp;
    private String type;
    private String service;
    private String method;
    private String path;
    private Integer status;
    private Long durationMs;
    private String clientIp;
    private String message;
}