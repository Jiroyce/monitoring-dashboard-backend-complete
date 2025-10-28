package com.gutouch.monitoring.service;

import com.gutouch.monitoring.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BigtableService bigtableService;
    private static final ZoneId PARIS_ZONE = ZoneId.of("Europe/Paris");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ============================================================================
    // PERIOD COMPARISON
    // ============================================================================

    public PeriodComparisonDTO comparePeriods(String period1Str, String period2Str, String connector) {
        log.info("Comparing periods: {} vs {}, connector: {}", period1Str, period2Str, connector);

        PeriodDates period1 = calculatePeriodDates(period1Str);
        PeriodDates period2 = calculatePeriodDates(period2Str);

        PeriodMetricsDTO metrics1 = calculatePeriodMetrics(period1.start, period1.end, connector, period1Str);
        PeriodMetricsDTO metrics2 = calculatePeriodMetrics(period2.start, period2.end, connector, period2Str);

        MetricChangesDTO changes = calculateChanges(metrics1, metrics2);

        return PeriodComparisonDTO.builder()
                .period1(metrics1)
                .period2(metrics2)
                .changes(changes)
                .build();
    }

    private PeriodMetricsDTO calculatePeriodMetrics(ZonedDateTime start, ZonedDateTime end,
                                                    String connector, String periodName) {
        List<LogEntry> logs = queryLogsByTimeRange(start, end, connector);

        long totalRequests = logs.size();
        long successCount = logs.stream().filter(LogEntry::getSuccess).count();
        long errorCount = totalRequests - successCount;

        double avgLatency = logs.stream()
                .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                .average()
                .orElse(0.0);

        double errorRate = totalRequests > 0 ? (errorCount * 100.0 / totalRequests) : 0.0;
        double successRate = 100.0 - errorRate;

        return PeriodMetricsDTO.builder()
                .name(periodName)
                .requests(totalRequests)
                .avgLatencyMs(avgLatency)
                .errorRate(errorRate)
                .successRate(successRate)
                .startDate(start)
                .endDate(end)
                .build();
    }

    private MetricChangesDTO calculateChanges(PeriodMetricsDTO p1, PeriodMetricsDTO p2) {
        double requestsChange = calculatePercentChange(p2.getRequests(), p1.getRequests());
        double latencyChange = calculatePercentChange(p2.getAvgLatencyMs(), p1.getAvgLatencyMs());
        double errorRateChange = calculatePercentChange(p2.getErrorRate(), p1.getErrorRate());
        double successRateChange = calculatePercentChange(p2.getSuccessRate(), p1.getSuccessRate());

        return MetricChangesDTO.builder()
                .requests(requestsChange)
                .latency(latencyChange)
                .errorRate(errorRateChange)
                .successRate(successRateChange)
                .build();
    }

    // ============================================================================
    // HEATMAP
    // ============================================================================

    public HeatmapDTO getTrafficHeatmap(int days, String connector) {
        log.info("Getting heatmap for {} days, connector: {}", days, connector);

        ZonedDateTime now = ZonedDateTime.now(PARIS_ZONE);
        ZonedDateTime startDate = now.minusDays(days).withHour(0).withMinute(0).withSecond(0);

        List<LogEntry> logs = queryLogsByTimeRange(startDate, now, connector);

        // Grouper par jour et heure
        Map<String, Map<Integer, List<LogEntry>>> dayHourMap = new HashMap<>();

        for (LogEntry log : logs) {
            ZonedDateTime timestamp = log.getTimestamp().atZone(PARIS_ZONE);
            String dayKey = timestamp.format(DATE_FORMATTER);
            int hour = timestamp.getHour();

            dayHourMap.computeIfAbsent(dayKey, k -> new HashMap<>())
                    .computeIfAbsent(hour, k -> new ArrayList<>())
                    .add(log);
        }

        // Construire la heatmap
        List<DayHeatmapDTO> heatmapDays = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            ZonedDateTime day = now.minusDays(i);
            String dayKey = day.format(DATE_FORMATTER);
            String dayName = getDayName(day.getDayOfWeek().getValue());

            List<HourDataDTO> hours = new ArrayList<>();

            for (int hour = 0; hour < 24; hour++) {
                List<LogEntry> hourLogs = dayHourMap.getOrDefault(dayKey, new HashMap<>())
                        .getOrDefault(hour, new ArrayList<>());

                long requests = hourLogs.size();
                double avgLatency = hourLogs.stream()
                        .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                        .average()
                        .orElse(0.0);

                String level = getTrafficLevel(requests);

                hours.add(HourDataDTO.builder()
                        .hour(hour)
                        .requests(requests)
                        .level(level)
                        .avgLatencyMs(avgLatency)
                        .build());
            }

            heatmapDays.add(DayHeatmapDTO.builder()
                    .day(dayName)
                    .date(dayKey)
                    .hours(hours)
                    .build());
        }

        List<String> insights = generateHeatmapInsights(dayHourMap);

        return HeatmapDTO.builder()
                .days(heatmapDays)
                .insights(insights)
                .build();
    }

    private String getTrafficLevel(long requests) {
        if (requests < 100) return "low";
        if (requests < 500) return "medium";
        if (requests < 1000) return "high";
        return "very_high";
    }

    private List<String> generateHeatmapInsights(Map<String, Map<Integer, List<LogEntry>>> dayHourMap) {
        List<String> insights = new ArrayList<>();

        Map<Integer, Long> hourlyTotals = new HashMap<>();
        for (Map<Integer, List<LogEntry>> dayData : dayHourMap.values()) {
            for (Map.Entry<Integer, List<LogEntry>> entry : dayData.entrySet()) {
                hourlyTotals.merge(entry.getKey(), (long) entry.getValue().size(), Long::sum);
            }
        }

        if (!hourlyTotals.isEmpty()) {
            int peakHour = hourlyTotals.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(12);

            insights.add(String.format("🔥 Pic de trafic détecté vers %dh", peakHour));
        }

        long weekdayTotal = 0;
        long weekendTotal = 0;
        int weekdayCount = 0;
        int weekendCount = 0;

        for (String dateStr : dayHourMap.keySet()) {
            LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
            int dayOfWeek = date.getDayOfWeek().getValue();
            long dayTotal = dayHourMap.get(dateStr).values().stream()
                    .mapToLong(List::size)
                    .sum();

            if (dayOfWeek >= 6) {
                weekendTotal += dayTotal;
                weekendCount++;
            } else {
                weekdayTotal += dayTotal;
                weekdayCount++;
            }
        }

        if (weekdayCount > 0 && weekendCount > 0) {
            double weekdayAvg = weekdayTotal / (double) weekdayCount;
            double weekendAvg = weekendTotal / (double) weekendCount;

            if (weekdayAvg > weekendAvg * 1.5) {
                insights.add("📊 Trafic significativement plus élevé en semaine");
            } else if (weekendAvg > weekdayAvg) {
                insights.add("🎯 Trafic plus élevé le weekend");
            }
        }

        return insights;
    }

    // ============================================================================
    // TOP CLIENTS
    // ============================================================================

    public List<TopClientDTO> getTopClients(int limit, String timeRange, String connector) {
        log.info("Getting top {} clients for {}, connector: {}", limit, timeRange, connector);

        TimeRangeDates dates = parseTimeRange(timeRange);
        List<LogEntry> logs = queryLogsByTimeRange(dates.start, dates.end, connector);

        Map<String, List<LogEntry>> clientMap = logs.stream()
                .collect(Collectors.groupingBy(l -> l.getClientIp() != null ? l.getClientIp() : "unknown"));

        List<TopClientDTO> topClients = clientMap.entrySet().stream()
                .map(entry -> {
                    String ip = entry.getKey();
                    List<LogEntry> clientLogs = entry.getValue();

                    long requests = clientLogs.size();
                    long errors = clientLogs.stream().filter(l -> !Boolean.TRUE.equals(l.getSuccess())).count();
                    double errorRate = requests > 0 ? (errors * 100.0 / requests) : 0.0;
                    double avgLatency = clientLogs.stream()
                            .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                            .average()
                            .orElse(0.0);

                    return TopClientDTO.builder()
                            .clientIp(ip)
                            .requests(requests)
                            .errors(errors)
                            .errorRate(errorRate)
                            .avgLatencyMs(avgLatency)
                            .connector(connector != null ? connector : "all")
                            .build();
                })
                .sorted(Comparator.comparingLong(TopClientDTO::getRequests).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        return topClients;
    }

    // ============================================================================
    // TRENDS
    // ============================================================================

    public TrendsDTO getTrends(String metric, int days, String connector) {
        log.info("Getting trends for metric: {}, days: {}, connector: {}", metric, days, connector);

        ZonedDateTime now = ZonedDateTime.now(PARIS_ZONE);
        ZonedDateTime startDate = now.minusDays(days);

        List<LogEntry> logs = queryLogsByTimeRange(startDate, now, connector);

        Map<String, List<LogEntry>> dailyMap = logs.stream()
                .collect(Collectors.groupingBy(l ->
                        l.getTimestamp().atZone(PARIS_ZONE).format(DATE_FORMATTER)
                ));

        List<TrendDataPointDTO> dataPoints = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            ZonedDateTime day = now.minusDays(i);
            String dayKey = day.format(DATE_FORMATTER);
            List<LogEntry> dayLogs = dailyMap.getOrDefault(dayKey, new ArrayList<>());

            double value = calculateMetricValue(metric, dayLogs);

            dataPoints.add(TrendDataPointDTO.builder()
                    .timestamp(day)
                    .value(value)
                    .label(day.format(DateTimeFormatter.ofPattern("dd MMM")))
                    .build());
        }

        List<AnomalyDTO> anomalies = detectAnomaliesInTrend(metric, dataPoints, connector);
        TrendInsightsDTO insights = calculateTrendInsights(dataPoints);

        return TrendsDTO.builder()
                .metric(metric)
                .data(dataPoints)
                .anomalies(anomalies)
                .insights(insights)
                .build();
    }

    private double calculateMetricValue(String metric, List<LogEntry> logs) {
        switch (metric) {
            case "requests":
                return logs.size();
            case "latency":
                return logs.stream()
                        .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                        .average()
                        .orElse(0.0);
            case "errorRate":
                long errors = logs.stream().filter(l -> !Boolean.TRUE.equals(l.getSuccess())).count();
                return logs.isEmpty() ? 0.0 : (errors * 100.0 / logs.size());
            default:
                return 0.0;
        }
    }

    private TrendInsightsDTO calculateTrendInsights(List<TrendDataPointDTO> dataPoints) {
        if (dataPoints.isEmpty()) {
            return TrendInsightsDTO.builder()
                    .average(0.0)
                    .min(0.0)
                    .max(0.0)
                    .trend(0.0)
                    .summary("Pas de données")
                    .build();
        }

        double avg = dataPoints.stream().mapToDouble(TrendDataPointDTO::getValue).average().orElse(0.0);
        double min = dataPoints.stream().mapToDouble(TrendDataPointDTO::getValue).min().orElse(0.0);
        double max = dataPoints.stream().mapToDouble(TrendDataPointDTO::getValue).max().orElse(0.0);

        double firstValue = dataPoints.get(0).getValue();
        double lastValue = dataPoints.get(dataPoints.size() - 1).getValue();
        double trend = calculatePercentChange(firstValue, lastValue);

        String summary = String.format("Tendance %s de %.1f%%",
                trend > 0 ? "à la hausse" : "à la baisse", Math.abs(trend));

        return TrendInsightsDTO.builder()
                .average(avg)
                .min(min)
                .max(max)
                .trend(trend)
                .summary(summary)
                .build();
    }

    // ============================================================================
    // CONNECTOR BREAKDOWN
    // ============================================================================

    public ConnectorBreakdownDTO getConnectorBreakdown(String timeRange) {
        log.info("Getting connector breakdown for {}", timeRange);

        TimeRangeDates dates = parseTimeRange(timeRange);

        ConnectorMetricsDTO gatewayMetrics = getConnectorMetrics(dates, "pi-gateway");
        ConnectorMetricsDTO connectorMetrics = getConnectorMetrics(dates, "pi-connector");

        long totalRequests = gatewayMetrics.getRequests() + connectorMetrics.getRequests();

        gatewayMetrics.setRequestsPercentage(totalRequests > 0 ?
                (gatewayMetrics.getRequests() * 100.0 / totalRequests) : 0.0);
        connectorMetrics.setRequestsPercentage(totalRequests > 0 ?
                (connectorMetrics.getRequests() * 100.0 / totalRequests) : 0.0);

        ComparisonDTO comparison = compareConnectors(gatewayMetrics, connectorMetrics);

        return ConnectorBreakdownDTO.builder()
                .piGateway(gatewayMetrics)
                .piConnector(connectorMetrics)
                .comparison(comparison)
                .build();
    }

    private ConnectorMetricsDTO getConnectorMetrics(TimeRangeDates dates, String connector) {
        List<LogEntry> logs = queryLogsByTimeRange(dates.start, dates.end, connector);

        long requests = logs.size();
        long successCount = logs.stream().filter(l -> Boolean.TRUE.equals(l.getSuccess())).count();
        double successRate = requests > 0 ? (successCount * 100.0 / requests) : 0.0;
        double errorRate = 100.0 - successRate;
        double avgLatency = logs.stream()
                .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                .average()
                .orElse(0.0);

        return ConnectorMetricsDTO.builder()
                .name(connector)
                .requests(requests)
                .requestsPercentage(0.0)
                .avgLatencyMs(avgLatency)
                .errorRate(errorRate)
                .successRate(successRate)
                .build();
    }

    private ComparisonDTO compareConnectors(ConnectorMetricsDTO gateway, ConnectorMetricsDTO connector) {
        Map<String, Double> differences = new HashMap<>();

        differences.put("latency",
                calculatePercentDifference(gateway.getAvgLatencyMs(), connector.getAvgLatencyMs()));
        differences.put("errorRate",
                calculatePercentDifference(gateway.getErrorRate(), connector.getErrorRate()));
        differences.put("volume",
                calculatePercentDifference(gateway.getRequests(), connector.getRequests()));

        String winner;
        String reason;

        if (gateway.getSuccessRate() > connector.getSuccessRate()) {
            winner = "pi-gateway";
            reason = "Meilleur taux de succès";
        } else if (connector.getSuccessRate() > gateway.getSuccessRate()) {
            winner = "pi-connector";
            reason = "Meilleur taux de succès";
        } else if (gateway.getAvgLatencyMs() < connector.getAvgLatencyMs()) {
            winner = "pi-gateway";
            reason = "Latence plus faible";
        } else {
            winner = "pi-connector";
            reason = "Latence plus faible";
        }

        return ComparisonDTO.builder()
                .winner(winner)
                .reason(reason)
                .differences(differences)
                .build();
    }

    // ============================================================================
    // ANOMALIES
    // ============================================================================

    public List<AnomalyDTO> detectAnomalies(int days, String connector) {
        log.info("Detecting anomalies for {} days, connector: {}", days, connector);

        ZonedDateTime now = ZonedDateTime.now(PARIS_ZONE);
        ZonedDateTime startDate = now.minusDays(days);

        List<LogEntry> logs = queryLogsByTimeRange(startDate, now, connector);

        Map<ZonedDateTime, List<LogEntry>> hourlyMap = logs.stream()
                .collect(Collectors.groupingBy(l ->
                        l.getTimestamp().atZone(PARIS_ZONE).truncatedTo(ChronoUnit.HOURS)
                ));

        List<AnomalyDTO> anomalies = new ArrayList<>();

        double avgErrorRate = calculateAverageErrorRate(hourlyMap);
        double avgLatency = calculateAverageLatency(hourlyMap);

        for (Map.Entry<ZonedDateTime, List<LogEntry>> entry : hourlyMap.entrySet()) {
            ZonedDateTime hour = entry.getKey();
            List<LogEntry> hourLogs = entry.getValue();

            long errors = hourLogs.stream().filter(l -> !Boolean.TRUE.equals(l.getSuccess())).count();
            double errorRate = hourLogs.isEmpty() ? 0.0 : (errors * 100.0 / hourLogs.size());
            double latency = hourLogs.stream()
                    .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                    .average()
                    .orElse(0.0);

            if (errorRate > avgErrorRate * 2 && errorRate > 5.0) {
                anomalies.add(AnomalyDTO.builder()
                        .id(UUID.randomUUID().toString())
                        .metric("error_rate")
                        .value(errorRate)
                        .threshold(avgErrorRate * 2)
                        .severity(errorRate > 10.0 ? "critical" : "warning")
                        .timestamp(hour)
                        .description(String.format("Taux d'erreur élevé : %.1f%%", errorRate))
                        .rootCause("Pic d'erreurs détecté, vérifier les logs")
                        .connector(connector != null ? connector : "all")
                        .build());
            }

            if (latency > avgLatency * 2 && latency > 100.0) {
                anomalies.add(AnomalyDTO.builder()
                        .id(UUID.randomUUID().toString())
                        .metric("latency")
                        .value(latency)
                        .threshold(avgLatency * 2)
                        .severity(latency > 200.0 ? "critical" : "warning")
                        .timestamp(hour)
                        .description(String.format("Latence élevée : %.1fms", latency))
                        .rootCause("Augmentation du trafic ou problème de performance")
                        .connector(connector != null ? connector : "all")
                        .build());
            }
        }

        anomalies.sort(Comparator.comparing(AnomalyDTO::getTimestamp).reversed());
        return anomalies;
    }

    private List<AnomalyDTO> detectAnomaliesInTrend(String metric,
                                                    List<TrendDataPointDTO> dataPoints,
                                                    String connector) {
        List<AnomalyDTO> anomalies = new ArrayList<>();
        if (dataPoints.size() < 3) return anomalies;

        double mean = dataPoints.stream().mapToDouble(TrendDataPointDTO::getValue).average().orElse(0.0);
        double variance = dataPoints.stream()
                .mapToDouble(dp -> Math.pow(dp.getValue() - mean, 2))
                .average()
                .orElse(0.0);
        double stdDev = Math.sqrt(variance);

        for (TrendDataPointDTO dp : dataPoints) {
            if (Math.abs(dp.getValue() - mean) > 2 * stdDev && stdDev > 0) {
                String description = String.format("Valeur anormale détectée : %.1f", dp.getValue());
                String severity = Math.abs(dp.getValue() - mean) > 3 * stdDev ? "critical" : "warning";

                anomalies.add(AnomalyDTO.builder()
                        .id(UUID.randomUUID().toString())
                        .metric(metric)
                        .value(dp.getValue())
                        .threshold(mean + 2 * stdDev)
                        .severity(severity)
                        .timestamp(dp.getTimestamp())
                        .description(description)
                        .rootCause("Écart significatif par rapport à la moyenne")
                        .connector(connector != null ? connector : "all")
                        .build());
            }
        }
        return anomalies;
    }

    // ============================================================================
    // TOP ENDPOINTS
    // ============================================================================

    public TopEndpointsDTO getTopEndpoints(String type, int limit, String timeRange, String connector) {
        log.info("Getting top {} endpoints, type: {}, timeRange: {}, connector: {}",
                limit, type, timeRange, connector);

        TimeRangeDates dates = parseTimeRange(timeRange);
        List<LogEntry> logs = queryLogsByTimeRange(dates.start, dates.end, connector);

        Map<String, List<LogEntry>> endpointMap = logs.stream()
                .collect(Collectors.groupingBy(l ->
                        (l.getMethod() != null ? l.getMethod() : "GET") + " " +
                                (l.getPath() != null ? l.getPath() : "/unknown")
                ));

        List<EndpointMetricsDTO> endpoints = endpointMap.entrySet().stream()
                .map(entry -> {
                    String endpoint = entry.getKey();
                    List<LogEntry> endpointLogs = entry.getValue();

                    String[] parts = endpoint.split(" ", 2);
                    String method = parts[0];
                    String path = parts.length > 1 ? parts[1] : "";

                    long requests = endpointLogs.size();
                    long errors = endpointLogs.stream().filter(l -> !Boolean.TRUE.equals(l.getSuccess())).count();
                    double errorRate = requests > 0 ? (errors * 100.0 / requests) : 0.0;

                    List<Double> latencies = endpointLogs.stream()
                            .map(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                            .sorted()
                            .collect(Collectors.toList());

                    double avgLatency = latencies.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                    double p95 = getPercentile(latencies, 95);
                    double p99 = getPercentile(latencies, 99);

                    return EndpointMetricsDTO.builder()
                            .path(path)
                            .method(method)
                            .connector(connector != null ? connector : "all")
                            .requests(requests)
                            .avgLatencyMs(avgLatency)
                            .errors(errors)
                            .errorRate(errorRate)
                            .p95LatencyMs(p95)
                            .p99LatencyMs(p99)
                            .build();
                })
                .sorted(type.equals("slowest")
                        ? Comparator.comparingDouble(EndpointMetricsDTO::getAvgLatencyMs).reversed()
                        : Comparator.comparingLong(EndpointMetricsDTO::getErrors).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        return TopEndpointsDTO.builder()
                .type(type)
                .endpoints(endpoints)
                .build();
    }

    // ============================================================================
    // STATUS DISTRIBUTION
    // ============================================================================

    public Map<String, StatusDistributionDTO> getStatusDistribution(String timeRange, String connector) {
        log.info("Getting status distribution for {}, connector: {}", timeRange, connector);

        TimeRangeDates dates = parseTimeRange(timeRange);
        List<LogEntry> logs = queryLogsByTimeRange(dates.start, dates.end, connector);

        long total = logs.size();

        Map<String, Long> categoryCounts = new HashMap<>();
        categoryCounts.put("2xx", 0L);
        categoryCounts.put("3xx", 0L);
        categoryCounts.put("4xx", 0L);
        categoryCounts.put("5xx", 0L);

        Map<Integer, Long> statusCodeCounts = new HashMap<>();

        for (LogEntry log : logs) {
            int statusCode = log.getStatusCode() != null ? log.getStatusCode() : 0;
            String category = (statusCode / 100) + "xx";

            categoryCounts.merge(category, 1L, Long::sum);
            statusCodeCounts.merge(statusCode, 1L, Long::sum);
        }

        Map<String, StatusCategoryDTO> categories = categoryCounts.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> StatusCategoryDTO.builder()
                                .category(e.getKey())
                                .count(e.getValue())
                                .percentage(total > 0 ? (e.getValue() * 100.0 / total) : 0.0)
                                .build()
                ));

        List<StatusCodeDetailDTO> topCodes = statusCodeCounts.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> StatusCodeDetailDTO.builder()
                        .statusCode(e.getKey())
                        .count(e.getValue())
                        .percentage(total > 0 ? (e.getValue() * 100.0 / total) : 0.0)
                        .description(getStatusDescription(e.getKey()))
                        .build())
                .collect(Collectors.toList());

        Map<String, StatusDistributionDTO> result = new HashMap<>();
        result.put(connector != null ? connector : "all",
                StatusDistributionDTO.builder()
                        .categories(categories)
                        .topCodes(topCodes)
                        .build());

        return result;
    }

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    private List<LogEntry> queryLogsByTimeRange(ZonedDateTime start, ZonedDateTime end, String connector) {
        log.debug("Querying logs from {} to {} for connector: {}", start, end, connector);

        try {
            return bigtableService.searchLogs(
                    connector != null && !connector.equals("all") ? connector : "all",
                    "all",
                    start.toInstant(),
                    end.toInstant(),
                    100000 // Large limit pour analytics
            );
        } catch (Exception e) {
            log.error("Error querying logs by time range", e);
            return new ArrayList<>();
        }
    }

    private String getStatusDescription(int statusCode) {
        switch (statusCode) {
            case 200: return "OK";
            case 201: return "Created";
            case 204: return "No Content";
            case 400: return "Bad Request";
            case 401: return "Unauthorized";
            case 403: return "Forbidden";
            case 404: return "Not Found";
            case 500: return "Internal Server Error";
            case 502: return "Bad Gateway";
            case 503: return "Service Unavailable";
            default: return "Unknown";
        }
    }

    private double getPercentile(List<Double> sortedValues, double percentile) {
        if (sortedValues.isEmpty()) return 0.0;
        int index = (int) Math.ceil(percentile / 100.0 * sortedValues.size()) - 1;
        index = Math.max(0, Math.min(index, sortedValues.size() - 1));
        return sortedValues.get(index);
    }

    private double calculatePercentChange(double oldValue, double newValue) {
        if (oldValue == 0) return newValue > 0 ? 100.0 : 0.0;
        return ((newValue - oldValue) / oldValue) * 100.0;
    }

    private double calculatePercentDifference(double value1, double value2) {
        double avg = (value1 + value2) / 2.0;
        if (avg == 0) return 0.0;
        return ((value1 - value2) / avg) * 100.0;
    }

    private double calculateAverageErrorRate(Map<ZonedDateTime, List<LogEntry>> hourlyMap) {
        return hourlyMap.values().stream()
                .mapToDouble(logs -> {
                    long errors = logs.stream().filter(l -> !Boolean.TRUE.equals(l.getSuccess())).count();
                    return logs.isEmpty() ? 0.0 : (errors * 100.0 / logs.size());
                })
                .average()
                .orElse(0.0);
    }

    private double calculateAverageLatency(Map<ZonedDateTime, List<LogEntry>> hourlyMap) {
        return hourlyMap.values().stream()
                .flatMap(List::stream)
                .mapToDouble(l -> l.getResponseTimeMs() != null ? l.getResponseTimeMs() : 0.0)
                .average()
                .orElse(0.0);
    }

    private String getDayName(int dayOfWeek) {
        String[] days = {"Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"};
        return days[dayOfWeek - 1];
    }

    // ============================================================================
    // DATE HELPERS
    // ============================================================================

    private static class PeriodDates {
        ZonedDateTime start;
        ZonedDateTime end;

        PeriodDates(ZonedDateTime start, ZonedDateTime end) {
            this.start = start;
            this.end = end;
        }
    }

    private PeriodDates calculatePeriodDates(String period) {
        ZonedDateTime now = ZonedDateTime.now(PARIS_ZONE);

        switch (period) {
            case "current":
            case "thisWeek":
                return new PeriodDates(now.minusDays(7), now);
            case "lastWeek":
            case "previous":
                return new PeriodDates(now.minusDays(14), now.minusDays(7));
            case "thisMonth":
                return new PeriodDates(now.minusDays(30), now);
            case "lastMonth":
                return new PeriodDates(now.minusDays(60), now.minusDays(30));
            default:
                return new PeriodDates(now.minusDays(7), now);
        }
    }

    private static class TimeRangeDates {
        ZonedDateTime start;
        ZonedDateTime end;

        TimeRangeDates(ZonedDateTime start, ZonedDateTime end) {
            this.start = start;
            this.end = end;
        }
    }

    private TimeRangeDates parseTimeRange(String timeRange) {
        ZonedDateTime now = ZonedDateTime.now(PARIS_ZONE);
        ZonedDateTime start;

        switch (timeRange) {
            case "1h":
                start = now.minusHours(1);
                break;
            case "6h":
                start = now.minusHours(6);
                break;
            case "24h":
            case "1d":
                start = now.minusDays(1);
                break;
            case "7d":
                start = now.minusDays(7);
                break;
            case "30d":
                start = now.minusDays(30);
                break;
            default:
                start = now.minusDays(1);
        }

        return new TimeRangeDates(start, now);
    }
}