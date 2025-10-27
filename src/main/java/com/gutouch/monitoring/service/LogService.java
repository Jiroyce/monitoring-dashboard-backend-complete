package com.gutouch.monitoring.service;

import com.gutouch.monitoring.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class LogService {

    private final BigtableService bigtableService;

    /**
     * Rechercher des logs avec filtres
     */
    public LogSearchResponseDTO searchLogs(LogSearchParams params) {
        log.info("Searching logs with params: {}", params);
        
        // Calculer les dates si non fournies
        Instant endTime = params.getEndTime() != null ? params.getEndTime() : Instant.now();
        Instant startTime = params.getStartTime() != null ? params.getStartTime() : endTime.minus(24, ChronoUnit.HOURS);
        
        // Récupérer les logs depuis BigTable
        List<LogEntry> allLogs = bigtableService.searchLogs(
                params.getConnector(),
                params.getType(),
                startTime,
                endTime,
                params.getLimit() * 3 // Récupérer plus pour filtrer
        );
        
        // Appliquer les filtres supplémentaires
        List<LogEntry> filteredLogs = allLogs.stream()
                .filter(log -> matchesFilters(log, params))
                .collect(Collectors.toList());
        
        // Trier
        if ("latency".equals(params.getSortBy())) {
            filteredLogs.sort((a, b) -> {
                double latA = a.getResponseTimeMs() != null ? a.getResponseTimeMs() : 0;
                double latB = b.getResponseTimeMs() != null ? b.getResponseTimeMs() : 0;
                int cmp = Double.compare(latA, latB);
                return "desc".equals(params.getSortOrder()) ? -cmp : cmp;
            });
        } else {
            // Tri par timestamp par défaut
            filteredLogs.sort((a, b) -> {
                int cmp = a.getTimestamp().compareTo(b.getTimestamp());
                return "desc".equals(params.getSortOrder()) ? -cmp : cmp;
            });
        }
        
        // Paginer
        int total = filteredLogs.size();
        int start = (params.getPage() - 1) * params.getLimit();
        int end = Math.min(start + params.getLimit(), total);
        
        List<LogEntry> paginatedLogs = filteredLogs.subList(
                Math.min(start, total),
                end
        );
        
        // Calculer le résumé
        LogSummary summary = calculateSummary(filteredLogs);
        
        return LogSearchResponseDTO.builder()
                .total((long) total)
                .page(params.getPage())
                .limit(params.getLimit())
                .pages((int) Math.ceil((double) total / params.getLimit()))
                .logs(paginatedLogs)
                .summary(summary)
                .build();
    }

    /**
     * Récupérer les logs d'erreur
     */
    @Cacheable(value = "errorLogs", key = "#connector + '_' + #limit")
    public List<LogEntry> getErrorLogs(String connector, int limit) {
        log.info("Getting error logs for connector: {}, limit: {}", connector, limit);
        return bigtableService.getErrorLogs(connector, limit);
    }

    /**
     * Récupérer un log par son ID
     */
    public LogDetailDTO getLogDetail(String logId) {
        log.info("Getting log detail for ID: {}", logId);
        
        var logData = bigtableService.getLogById(logId);
        if (logData == null) {
            return null;
        }
        
        // Parser la row key
        String[] keyParts = logId.split("#");
        
        return LogDetailDTO.builder()
                .logId(logId)
                .timestamp(Instant.ofEpochMilli(Long.parseLong(keyParts[0])))
                .type(keyParts.length > 1 ? keyParts[1] : logData.get("type"))
                .connector(keyParts.length > 2 ? keyParts[2] : logData.get("connector"))
                .method(logData.get("method"))
                .path(logData.get("path"))
                .statusCode(parseInt(logData.get("status_code")))
                .success(parseBoolean(logData.get("success")))
                .durationMs(parseDouble(logData.get("response_time_ms")))
                .clientIp(logData.get("client_ip"))
                .timeout(parseBoolean(logData.get("timeout")))
                .serviceStatus(logData.get("service_status"))
                .rawLog(logData.get("raw_log"))
                .error(logData.get("error"))
                .messageId(logData.get("messageId"))
                .endToEndId(logData.get("endToEndId"))
                .service(logData.get("service"))
                .message(logData.get("message"))
                .build();
    }

    /**
     * Vérifier si un log correspond aux filtres
     */
    private boolean matchesFilters(LogEntry log, LogSearchParams params) {
        // Filtre sur le query (recherche dans path, IP, etc.)
        if (params.getQuery() != null && !params.getQuery().isEmpty()) {
            String query = params.getQuery().toLowerCase();
            boolean matches = false;
            
            if (log.getPath() != null && log.getPath().toLowerCase().contains(query)) {
                matches = true;
            }
            if (log.getClientIp() != null && log.getClientIp().contains(query)) {
                matches = true;
            }
            if (log.getMessageId() != null && log.getMessageId().contains(query)) {
                matches = true;
            }
            
            if (!matches) return false;
        }
        
        // Filtre sur le status
        if (params.getStatus() != null && !params.getStatus().isEmpty()) {
            if (params.getStatus().endsWith("xx")) {
                // Filtre sur classe de status (4xx, 5xx)
                String statusClass = params.getStatus().substring(0, 1);
                if (log.getStatusCode() == null || 
                    !String.valueOf(log.getStatusCode()).startsWith(statusClass)) {
                    return false;
                }
            } else {
                // Filtre sur status exact
                if (log.getStatusCode() == null || 
                    !String.valueOf(log.getStatusCode()).equals(params.getStatus())) {
                    return false;
                }
            }
        }
        
        // Filtre sur success
        if (params.getSuccess() != null) {
            if (!params.getSuccess().equals(log.getSuccess())) {
                return false;
            }
        }
        
        // Filtre sur latency
        if (params.getMinLatency() != null || params.getMaxLatency() != null) {
            if (log.getResponseTimeMs() == null) return false;
            
            if (params.getMinLatency() != null && log.getResponseTimeMs() < params.getMinLatency()) {
                return false;
            }
            if (params.getMaxLatency() != null && log.getResponseTimeMs() > params.getMaxLatency()) {
                return false;
            }
        }
        
        // Filtre sur client IP
        if (params.getClientIp() != null && !params.getClientIp().isEmpty()) {
            if (log.getClientIp() == null || !log.getClientIp().equals(params.getClientIp())) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Calculer le résumé des logs
     */
    private LogSummary calculateSummary(List<LogEntry> logs) {
        if (logs.isEmpty()) {
            return LogSummary.builder()
                    .successRate(0.0)
                    .avgLatencyMs(0.0)
                    .errorCount(0L)
                    .build();
        }
        
        long successCount = logs.stream()
                .filter(log -> Boolean.TRUE.equals(log.getSuccess()))
                .count();
        
        double successRate = (double) successCount / logs.size() * 100;
        
        double avgLatency = logs.stream()
                .filter(log -> log.getResponseTimeMs() != null)
                .mapToDouble(LogEntry::getResponseTimeMs)
                .average()
                .orElse(0.0);
        
        long errorCount = logs.stream()
                .filter(log -> Boolean.FALSE.equals(log.getSuccess()))
                .count();
        
        return LogSummary.builder()
                .successRate(successRate)
                .avgLatencyMs(avgLatency)
                .errorCount(errorCount)
                .build();
    }

    /**
     * Helper parsing methods
     */
    private Integer parseInt(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean parseBoolean(String value) {
        if (value == null || value.isEmpty()) return null;
        return Boolean.parseBoolean(value);
    }
}