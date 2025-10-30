package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;






/**
 * Paramètres de recherche de logs
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogSearchParams {
    private String query;
    private String connector;
    private String type;
    private String status;
    private Boolean success;
    private Integer minLatency;
    private Integer maxLatency;
    private String clientIp;
    private Instant startTime;
    private Instant endTime;
    private Integer page = 1;
    private Integer limit = 50;
    private String sortBy = "timestamp";
    private String sortOrder = "desc";
}