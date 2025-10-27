package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;




/**
 * DTO pour les détails d'un log
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogDetailDTO {
    private String logId;
    private Instant timestamp;
    private String type;
    private String connector;
    private String method;
    private String path;
    private Integer statusCode;
    private Boolean success;
    private Double durationMs;
    private String clientIp;
    private Boolean timeout;
    private String serviceStatus;
    private String rawLog;
    private String error;
    private String messageId;
    private String endToEndId;
    private String service;
    private String message;
}
