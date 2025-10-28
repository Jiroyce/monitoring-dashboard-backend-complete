package com.gutouch.monitoring.controller;

import com.gutouch.monitoring.dto.*;
import com.gutouch.monitoring.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "APIs d'analytics et statistiques avancées")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/comparison")
    @Operation(summary = "Comparer deux périodes", 
               description = "Compare les métriques entre deux périodes temporelles")
    public ResponseEntity<PeriodComparisonDTO> comparePeriods(
            @RequestParam @Parameter(description = "Période 1 (current, lastWeek, lastMonth)") String period1,
            @RequestParam @Parameter(description = "Période 2 (previous, twoWeeksAgo, twoMonthsAgo)") String period2,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Comparison request: period1={}, period2={}, connector={}", period1, period2, connector);
        PeriodComparisonDTO comparison = analyticsService.comparePeriods(period1, period2, connector);
        return ResponseEntity.ok(comparison);
    }

    @GetMapping("/heatmap")
    @Operation(summary = "Heatmap du trafic", 
               description = "Retourne la heatmap du trafic par jour et heure")
    public ResponseEntity<HeatmapDTO> getTrafficHeatmap(
            @RequestParam(defaultValue = "7") @Parameter(description = "Nombre de jours (7, 14, 30)") int days,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Heatmap request: days={}, connector={}", days, connector);
        HeatmapDTO heatmap = analyticsService.getTrafficHeatmap(days, connector);
        return ResponseEntity.ok(heatmap);
    }

    @GetMapping("/top-clients")
    @Operation(summary = "Top clients", 
               description = "Retourne les clients les plus actifs")
    public ResponseEntity<List<TopClientDTO>> getTopClients(
            @RequestParam(defaultValue = "10") @Parameter(description = "Nombre de clients") int limit,
            @RequestParam(defaultValue = "7d") @Parameter(description = "Période (1d, 7d, 30d)") String timeRange,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Top clients request: limit={}, timeRange={}, connector={}", limit, timeRange, connector);
        List<TopClientDTO> topClients = analyticsService.getTopClients(limit, timeRange, connector);
        return ResponseEntity.ok(topClients);
    }

    @GetMapping("/trends")
    @Operation(summary = "Tendances", 
               description = "Retourne les tendances d'une métrique sur une période")
    public ResponseEntity<TrendsDTO> getTrends(
            @RequestParam @Parameter(description = "Métrique (requests, latency, errorRate)") String metric,
            @RequestParam(defaultValue = "30") @Parameter(description = "Nombre de jours") int days,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Trends request: metric={}, days={}, connector={}", metric, days, connector);
        TrendsDTO trends = analyticsService.getTrends(metric, days, connector);
        return ResponseEntity.ok(trends);
    }

    @GetMapping("/connector-breakdown")
    @Operation(summary = "Répartition par connector", 
               description = "Retourne la répartition des métriques entre pi-gateway et pi-connector")
    public ResponseEntity<ConnectorBreakdownDTO> getConnectorBreakdown(
            @RequestParam(defaultValue = "24h") @Parameter(description = "Période (1h, 6h, 24h, 7d, 30d)") String timeRange
    ) {
        log.info("Connector breakdown request: timeRange={}", timeRange);
        ConnectorBreakdownDTO breakdown = analyticsService.getConnectorBreakdown(timeRange);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/anomalies")
    @Operation(summary = "Détection d'anomalies", 
               description = "Détecte les anomalies dans les métriques")
    public ResponseEntity<List<AnomalyDTO>> detectAnomalies(
            @RequestParam(defaultValue = "7") @Parameter(description = "Nombre de jours à analyser") int days,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Anomalies request: days={}, connector={}", days, connector);
        List<AnomalyDTO> anomalies = analyticsService.detectAnomalies(days, connector);
        return ResponseEntity.ok(anomalies);
    }

    @GetMapping("/top-endpoints")
    @Operation(summary = "Top endpoints", 
               description = "Endpoints les plus lents ou avec le plus d'erreurs")
    public ResponseEntity<TopEndpointsDTO> getTopEndpoints(
            @RequestParam(defaultValue = "slowest") @Parameter(description = "Type: slowest, errors") String type,
            @RequestParam(defaultValue = "10") @Parameter(description = "Nombre d'endpoints") int limit,
            @RequestParam(defaultValue = "24h") @Parameter(description = "Période") String timeRange,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Top endpoints request: type={}, limit={}, timeRange={}, connector={}", 
                type, limit, timeRange, connector);
        TopEndpointsDTO topEndpoints = analyticsService.getTopEndpoints(type, limit, timeRange, connector);
        return ResponseEntity.ok(topEndpoints);
    }

    @GetMapping("/status-distribution")
    @Operation(summary = "Distribution des status codes", 
               description = "Répartition des status codes HTTP")
    public ResponseEntity<Map<String, StatusDistributionDTO>> getStatusDistribution(
            @RequestParam(defaultValue = "24h") @Parameter(description = "Période") String timeRange,
            @RequestParam(required = false) @Parameter(description = "Filtrer par connector") String connector
    ) {
        log.info("Status distribution request: timeRange={}, connector={}", timeRange, connector);
        Map<String, StatusDistributionDTO> distribution = 
            analyticsService.getStatusDistribution(timeRange, connector);
        return ResponseEntity.ok(distribution);
    }
}