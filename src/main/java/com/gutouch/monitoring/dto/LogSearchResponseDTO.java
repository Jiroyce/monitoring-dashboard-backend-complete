package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO pour la recherche de logs
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogSearchResponseDTO {
    private Long total;
    private Integer page;
    private Integer limit;
    private Integer pages;
    private List<LogEntry> logs;
    private LogSummary summary;
}