package com.gutouch.monitoring.controller;

import com.gutouch.monitoring.dto.ConnectorDetailsDTO;
import com.gutouch.monitoring.dto.OverviewMetricsDTO;
import com.gutouch.monitoring.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Metrics", description = "APIs pour récupérer les métriques agrégées")
@CrossOrigin(origins = "*")
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/overview")
    @Operation(summary = "Récupérer les métriques d'overview", 
               description = "Retourne une vue globale des métriques pour tous les connecteurs")
    public ResponseEntity<OverviewMetricsDTO> getOverviewMetrics(
            @Parameter(description = "Plage temporelle (1h, 6h, 24h, 7d, 30d)")
            @RequestParam(defaultValue = "1h") String timeRange) {
        
        log.info("GET /api/metrics/overview - timeRange: {}", timeRange);
        
        try {
            OverviewMetricsDTO metrics = metricsService.getOverviewMetrics(timeRange);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            log.error("Error fetching overview metrics", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/connector/{connectorName}")
    @Operation(summary = "Récupérer les détails d'un connector",
               description = "Retourne toutes les métriques détaillées pour un connector spécifique")
    public ResponseEntity<ConnectorDetailsDTO> getConnectorDetails(
            @Parameter(description = "Nom du connector (pi-gateway ou pi-connector)")
            @PathVariable String connectorName,
            @Parameter(description = "Plage temporelle (1h, 6h, 24h, 7d, 30d)")
            @RequestParam(defaultValue = "24h") String timeRange) {
        
        log.info("GET /api/metrics/connector/{} - timeRange: {}", connectorName, timeRange);
        
        try {
            ConnectorDetailsDTO details = metricsService.getConnectorDetails(connectorName, timeRange);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            log.error("Error fetching connector details for: {}", connectorName, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}