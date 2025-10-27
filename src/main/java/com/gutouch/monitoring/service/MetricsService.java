package com.gutouch.monitoring.service;

import com.gutouch.monitoring.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MetricsService {

    private final BigtableService bigtableService;

    /**
     * Récupérer les métriques d'overview
     */
    @Cacheable(value = "overview", key = "#timeRange")
    public OverviewMetricsDTO getOverviewMetrics(String timeRange) {
        log.info("Getting overview metrics for timeRange: {}", timeRange);
        
        Instant endTime = Instant.now();
        Instant startTime = calculateStartTime(endTime, timeRange);
        
        // Récupérer les métriques pour chaque connector
        List<Map<String, String>> gatewayMetrics = bigtableService.getConnectorMetrics("pi-gateway", startTime, endTime);
        List<Map<String, String>> connectorMetrics = bigtableService.getConnectorMetrics("pi-connector", startTime, endTime);
        
        // Calculer les status des services
        ServiceStatus gatewayStatus = calculateServiceStatus("pi-gateway", gatewayMetrics);
        ServiceStatus connectorStatus = calculateServiceStatus("pi-connector", connectorMetrics);
        
        // Calculer les totaux
        TotalMetrics totals = calculateTotals(gatewayMetrics, connectorMetrics);
        
        // Construire la timeline
        List<TimelinePoint> timeline = buildTimeline(gatewayMetrics, connectorMetrics);
        
        return OverviewMetricsDTO.builder()
                .timestamp(Instant.now())
                .timeRange(timeRange)
                .services(Arrays.asList(gatewayStatus, connectorStatus))
                .totals(totals)
                .timeline(timeline)
                .build();
    }

    /**
     * Récupérer les détails d'un connector
     */
    @Cacheable(value = "connectorDetails", key = "#connectorName + '_' + #timeRange")
    public ConnectorDetailsDTO getConnectorDetails(String connectorName, String timeRange) {
        log.info("Getting details for connector: {}, timeRange: {}", connectorName, timeRange);
        
        Instant endTime = Instant.now();
        Instant startTime = calculateStartTime(endTime, timeRange);
        
        List<Map<String, String>> metrics = bigtableService.getConnectorMetrics(connectorName, startTime, endTime);
        
        if (metrics.isEmpty()) {
            return buildEmptyConnectorDetails(connectorName);
        }
        
        // Calculer les métriques
        Map<String, String> latestMetric = metrics.get(metrics.size() - 1);
        
        Double uptimePercentage = parseDouble(latestMetric.get("uptime_percentage"));
        Long totalRequests = metrics.stream()
                .mapToLong(m -> parseLong(m.get("requests_per_minute")))
                .sum();
        Double successRate = parseDouble(latestMetric.get("success_rate_percentage"));
        Double errorRate = parseDouble(latestMetric.get("error_rate_percentage"));
        Double avgLatencyMs = parseDouble(latestMetric.get("avg_response_time_ms"));
        
        // Construire les percentiles
        LatencyPercentiles percentiles = LatencyPercentiles.builder()
                .p50(parseDouble(latestMetric.get("latency_p50")))
                .p75(parseDouble(latestMetric.get("latency_p75")))
                .p90(parseDouble(latestMetric.get("latency_p90")))
                .p95(parseDouble(latestMetric.get("latency_p95")))
                .p99(parseDouble(latestMetric.get("latency_p99")))
                .build();
        
        // Pour les distributions et tops, on doit analyser les logs bruts
        List<LogEntry> logs = bigtableService.searchLogs(connectorName, "API_IN", startTime, endTime, 10000);
        
        Map<String, Long> latencyDistribution = calculateLatencyDistribution(logs);
        Map<String, Long> statusBreakdown = calculateStatusBreakdown(logs);
        List<EndpointMetrics> topSlowEndpoints = calculateTopSlowEndpoints(logs, 10);
        List<EndpointError> topErrorEndpoints = calculateTopErrorEndpoints(logs, 10);
        
        return ConnectorDetailsDTO.builder()
                .connector(connectorName)
                .uptimePercentage(uptimePercentage)
                .totalRequests(totalRequests)
                .successRate(successRate)
                .errorRate(errorRate)
                .avgLatencyMs(avgLatencyMs)
                .latencyPercentiles(percentiles)
                .latencyDistribution(latencyDistribution)
                .statusBreakdown(statusBreakdown)
                .topSlowEndpoints(topSlowEndpoints)
                .topErrorEndpoints(topErrorEndpoints)
                .build();
    }

    /**
     * Calculer le status d'un service
     */
    private ServiceStatus calculateServiceStatus(String connectorName, List<Map<String, String>> metrics) {
        if (metrics.isEmpty()) {
            return ServiceStatus.builder()
                    .name(connectorName)
                    .status("unknown")
                    .uptimePercentage(0.0)
                    .requestsPerMinute(0)
                    .avgLatencyMs(0.0)
                    .successRate(0.0)
                    .errorRate(0.0)
                    .build();
        }
        
        Map<String, String> latestMetric = metrics.get(metrics.size() - 1);
        
        Double uptimePercentage = parseDouble(latestMetric.get("uptime_percentage"));
        Integer requestsPerMinute = parseInt(latestMetric.get("requests_per_minute"));
        Double avgLatencyMs = parseDouble(latestMetric.get("avg_response_time_ms"));
        Double successRate = parseDouble(latestMetric.get("success_rate_percentage"));
        Double errorRate = parseDouble(latestMetric.get("error_rate_percentage"));
        
        // Déterminer le status
        String status = "healthy";
        if (uptimePercentage != null && uptimePercentage < 99.0) {
            status = "down";
        } else if (errorRate != null && errorRate > 5.0) {
            status = "degraded";
        } else if (avgLatencyMs != null && avgLatencyMs > 200) {
            status = "degraded";
        }
        
        return ServiceStatus.builder()
                .name(connectorName)
                .status(status)
                .uptimePercentage(uptimePercentage != null ? uptimePercentage : 0.0)
                .requestsPerMinute(requestsPerMinute != null ? requestsPerMinute : 0)
                .avgLatencyMs(avgLatencyMs != null ? avgLatencyMs : 0.0)
                .successRate(successRate != null ? successRate : 0.0)
                .errorRate(errorRate != null ? errorRate : 0.0)
                .build();
    }

    /**
     * Calculer les totaux
     */
    private TotalMetrics calculateTotals(List<Map<String, String>> gatewayMetrics, List<Map<String, String>> connectorMetrics) {
        List<Map<String, String>> allMetrics = new ArrayList<>();
        allMetrics.addAll(gatewayMetrics);
        allMetrics.addAll(connectorMetrics);
        
        if (allMetrics.isEmpty()) {
            return TotalMetrics.builder()
                    .totalRequests(0L)
                    .successRate(0.0)
                    .errorRate(0.0)
                    .avgLatencyMs(0.0)
                    .p50LatencyMs(0.0)
                    .p95LatencyMs(0.0)
                    .p99LatencyMs(0.0)
                    .timeoutRate(0.0)
                    .build();
        }
        
        long totalRequests = allMetrics.stream()
                .mapToLong(m -> parseLong(m.get("requests_per_minute")))
                .sum();
        
        double avgSuccessRate = allMetrics.stream()
                .mapToDouble(m -> parseDouble(m.get("success_rate_percentage")))
                .average()
                .orElse(0.0);
        
        double avgErrorRate = allMetrics.stream()
                .mapToDouble(m -> parseDouble(m.get("error_rate_percentage")))
                .average()
                .orElse(0.0);
        
        double avgLatency = allMetrics.stream()
                .mapToDouble(m -> parseDouble(m.get("avg_response_time_ms")))
                .average()
                .orElse(0.0);
        
        // Prendre les derniers percentiles disponibles
        Map<String, String> latestMetric = allMetrics.get(allMetrics.size() - 1);
        
        return TotalMetrics.builder()
                .totalRequests(totalRequests)
                .successRate(avgSuccessRate)
                .errorRate(avgErrorRate)
                .avgLatencyMs(avgLatency)
                .p50LatencyMs(parseDouble(latestMetric.get("latency_p50")))
                .p95LatencyMs(parseDouble(latestMetric.get("latency_p95")))
                .p99LatencyMs(parseDouble(latestMetric.get("latency_p99")))
                .timeoutRate(parseDouble(latestMetric.get("timeout_rate_percentage")))
                .build();
    }

    /**
     * Construire la timeline
     */
    private List<TimelinePoint> buildTimeline(List<Map<String, String>> gatewayMetrics, List<Map<String, String>> connectorMetrics) {
        Map<Long, TimelinePoint.TimelinePointBuilder> timelineMap = new HashMap<>();
        
        // Ajouter les données gateway
        for (Map<String, String> metric : gatewayMetrics) {
            Long timestamp = parseLong(metric.get("window_timestamp"));
            if (timestamp != null) {
                TimelinePoint.TimelinePointBuilder builder = timelineMap.computeIfAbsent(timestamp, 
                    t -> TimelinePoint.builder().timestamp(Instant.ofEpochMilli(t)));
                builder.piGatewayRequests(parseInt(metric.get("requests_per_minute")));
            }
        }
        
        // Ajouter les données connector
        for (Map<String, String> metric : connectorMetrics) {
            Long timestamp = parseLong(metric.get("window_timestamp"));
            if (timestamp != null) {
                TimelinePoint.TimelinePointBuilder builder = timelineMap.computeIfAbsent(timestamp, 
                    t -> TimelinePoint.builder().timestamp(Instant.ofEpochMilli(t)));
                builder.piConnectorRequests(parseInt(metric.get("requests_per_minute")));
            }
        }
        
        return timelineMap.values().stream()
                .map(TimelinePoint.TimelinePointBuilder::build)
                .sorted(Comparator.comparing(TimelinePoint::getTimestamp))
                .collect(Collectors.toList());
    }

    /**
     * Calculer la distribution de latence
     */
    private Map<String, Long> calculateLatencyDistribution(List<LogEntry> logs) {
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("0-10ms", 0L);
        distribution.put("10-20ms", 0L);
        distribution.put("20-50ms", 0L);
        distribution.put("50-100ms", 0L);
        distribution.put("100-200ms", 0L);
        distribution.put(">200ms", 0L);
        
        for (LogEntry log : logs) {
            Double latency = log.getResponseTimeMs();
            if (latency == null) continue;
            
            if (latency < 10) {
                distribution.merge("0-10ms", 1L, Long::sum);
            } else if (latency < 20) {
                distribution.merge("10-20ms", 1L, Long::sum);
            } else if (latency < 50) {
                distribution.merge("20-50ms", 1L, Long::sum);
            } else if (latency < 100) {
                distribution.merge("50-100ms", 1L, Long::sum);
            } else if (latency < 200) {
                distribution.merge("100-200ms", 1L, Long::sum);
            } else {
                distribution.merge(">200ms", 1L, Long::sum);
            }
        }
        
        return distribution;
    }

    /**
     * Calculer le breakdown des status codes
     */
    private Map<String, Long> calculateStatusBreakdown(List<LogEntry> logs) {
        return logs.stream()
                .filter(log -> log.getStatusCode() != null)
                .collect(Collectors.groupingBy(
                        log -> String.valueOf(log.getStatusCode()),
                        Collectors.counting()
                ));
    }

    /**
     * Calculer les top endpoints lents
     */
    private List<EndpointMetrics> calculateTopSlowEndpoints(List<LogEntry> logs, int limit) {
        Map<String, List<LogEntry>> byEndpoint = logs.stream()
                .filter(log -> log.getPath() != null && log.getResponseTimeMs() != null)
                .collect(Collectors.groupingBy(LogEntry::getPath));
        
        return byEndpoint.entrySet().stream()
                .map(entry -> {
                    String path = entry.getKey();
                    List<LogEntry> endpointLogs = entry.getValue();
                    
                    double avgLatency = endpointLogs.stream()
                            .mapToDouble(LogEntry::getResponseTimeMs)
                            .average()
                            .orElse(0.0);
                    
                    double p95Latency = calculatePercentile(
                            endpointLogs.stream()
                                    .map(LogEntry::getResponseTimeMs)
                                    .collect(Collectors.toList()),
                            0.95
                    );
                    
                    return EndpointMetrics.builder()
                            .path(path)
                            .avgLatencyMs(avgLatency)
                            .p95LatencyMs(p95Latency)
                            .count((long) endpointLogs.size())
                            .build();
                })
                .sorted(Comparator.comparing(EndpointMetrics::getAvgLatencyMs).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Calculer les top endpoints avec erreurs
     */
    private List<EndpointError> calculateTopErrorEndpoints(List<LogEntry> logs, int limit) {
        Map<String, List<LogEntry>> errorsByEndpoint = logs.stream()
                .filter(log -> Boolean.FALSE.equals(log.getSuccess()) && log.getPath() != null)
                .collect(Collectors.groupingBy(LogEntry::getPath));
        
        return errorsByEndpoint.entrySet().stream()
                .map(entry -> {
                    String path = entry.getKey();
                    List<LogEntry> errors = entry.getValue();
                    
                    // Prendre le status le plus fréquent
                    Integer mostCommonStatus = errors.stream()
                            .filter(log -> log.getStatusCode() != null)
                            .collect(Collectors.groupingBy(LogEntry::getStatusCode, Collectors.counting()))
                            .entrySet().stream()
                            .max(Map.Entry.comparingByValue())
                            .map(Map.Entry::getKey)
                            .orElse(500);
                    
                    Instant lastSeen = errors.stream()
                            .map(LogEntry::getTimestamp)
                            .max(Instant::compareTo)
                            .orElse(Instant.now());
                    
                    return EndpointError.builder()
                            .path(path)
                            .status(mostCommonStatus)
                            .count((long) errors.size())
                            .lastSeen(lastSeen)
                            .build();
                })
                .sorted(Comparator.comparing(EndpointError::getCount).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Helper: Calculer le temps de début selon le timeRange
     */
    private Instant calculateStartTime(Instant endTime, String timeRange) {
        switch (timeRange) {
            case "1h":
                return endTime.minus(1, ChronoUnit.HOURS);
            case "6h":
                return endTime.minus(6, ChronoUnit.HOURS);
            case "24h":
                return endTime.minus(24, ChronoUnit.HOURS);
            case "7d":
                return endTime.minus(7, ChronoUnit.DAYS);
            case "30d":
                return endTime.minus(30, ChronoUnit.DAYS);
            default:
                return endTime.minus(1, ChronoUnit.HOURS);
        }
    }

    /**
     * Helper: Calculer un percentile
     */
    private double calculatePercentile(List<Double> values, double percentile) {
        if (values.isEmpty()) return 0.0;
        
        List<Double> sorted = values.stream()
                .sorted()
                .collect(Collectors.toList());
        
        int index = (int) Math.ceil(percentile * sorted.size()) - 1;
        return sorted.get(Math.max(0, index));
    }

    /**
     * Construire des détails vides
     */
    private ConnectorDetailsDTO buildEmptyConnectorDetails(String connectorName) {
        return ConnectorDetailsDTO.builder()
                .connector(connectorName)
                .uptimePercentage(0.0)
                .totalRequests(0L)
                .successRate(0.0)
                .errorRate(0.0)
                .avgLatencyMs(0.0)
                .latencyPercentiles(LatencyPercentiles.builder()
                        .p50(0.0).p75(0.0).p90(0.0).p95(0.0).p99(0.0).build())
                .latencyDistribution(new HashMap<>())
                .statusBreakdown(new HashMap<>())
                .topSlowEndpoints(new ArrayList<>())
                .topErrorEndpoints(new ArrayList<>())
                .build();
    }

    /**
     * Helper parsing methods
     */
    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) return 0.0;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private Long parseLong(String value) {
        if (value == null || value.isEmpty()) return 0L;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    private Integer parseInt(String value) {
        if (value == null || value.isEmpty()) return 0;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
