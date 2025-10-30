package com.gutouch.monitoring.controller;

import com.gutouch.monitoring.dto.*;
import com.gutouch.monitoring.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Logs", description = "APIs pour rechercher et explorer les logs")
@CrossOrigin(origins = "*")
public class LogController {

    private final LogService logService;

    @GetMapping("/search")
    @Operation(summary = "Rechercher des logs", description = "Recherche avancée avec filtres multiples")
    public ResponseEntity<LogSearchResponseDTO> searchLogs(
            @Parameter(description = "Recherche par mot-clé (path, IP, messageId)")
            @RequestParam(required = false) String query,
            
            @Parameter(description = "Filtrer par connector (pi-gateway, pi-connector, all)")
            @RequestParam(defaultValue = "all") String connector,
            
            @Parameter(description = "Filtrer par type (API_IN, API_OUT, AUTH, PROCESSING, all)")
            @RequestParam(defaultValue = "all") String type,
            
            @Parameter(description = "Filtrer par status code (200, 404, 5xx, etc.)")
            @RequestParam(required = false) String status,
            
            @Parameter(description = "Filtrer par success (true/false)")
            @RequestParam(required = false) Boolean success,
            
            @Parameter(description = "Latence minimale en ms")
            @RequestParam(required = false) Integer minLatency,
            
            @Parameter(description = "Latence maximale en ms")
            @RequestParam(required = false) Integer maxLatency,
            
            @Parameter(description = "Filtrer par IP client")
            @RequestParam(required = false) String clientIP,

            @Parameter(description = "Filtrer par service (uniquement pour logs PROCESSING)")
            @RequestParam(required = false) String service,
            
            @Parameter(description = "Date/heure de début (ISO 8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            
            @Parameter(description = "Date/heure de fin (ISO 8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime,
            
            @Parameter(description = "Numéro de page")
            @RequestParam(defaultValue = "1") Integer page,
            
            @Parameter(description = "Nombre de résultats par page")
            @RequestParam(defaultValue = "50") Integer limit,
            
            @Parameter(description = "Trier par (timestamp, latency)")
            @RequestParam(defaultValue = "timestamp") String sortBy,
            
            @Parameter(description = "Ordre de tri (asc, desc)")
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        log.info("GET /api/logs/search - query: {}, connector: {}, type: {}", query, connector, type);
        
        try {
            LogSearchParams params = LogSearchParams.builder()
                    .query(query)
                    .connector(connector)
                    .type(type)
                    .status(status)
                    .success(success)
                    .minLatency(minLatency)
                    .maxLatency(maxLatency)
                    .clientIp(clientIP)
                    .service(service)
                    .startTime(startTime)
                    .endTime(endTime)
                    .page(page)
                    .limit(limit)
                    .sortBy(sortBy)
                    .sortOrder(sortOrder)
                    .build();
            
            LogSearchResponseDTO response = logService.searchLogs(params);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching logs", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/errors")
    @Operation(summary = "Récupérer les logs d'erreur", description = "Retourne les derniers logs avec success=false")
    public ResponseEntity<List<LogEntry>> getErrorLogs(
            @Parameter(description = "Filtrer par connector (pi-gateway, pi-connector, all)")
            @RequestParam(defaultValue = "all") String connector,
            
            @Parameter(description = "Nombre de résultats")
            @RequestParam(defaultValue = "50") Integer limit) {
        
        log.info("GET /api/logs/errors - connector: {}, limit: {}", connector, limit);
        
        try {
            List<LogEntry> errors = logService.getErrorLogs(connector, limit);
            return ResponseEntity.ok(errors);
        } catch (Exception e) {
            log.error("Error fetching error logs", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{logId}")
    @Operation(summary = "Récupérer les détails d'un log", description = "Retourne toutes les informations d'un log spécifique")
    public ResponseEntity<LogDetailDTO> getLogDetail(
            @Parameter(description = "ID du log (row key BigTable)")
            @PathVariable String logId) {
        
        log.info("GET /api/logs/{}", logId);
        
        try {
            LogDetailDTO detail = logService.getLogDetail(logId);
            if (detail == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            log.error("Error fetching log detail for ID: {}", logId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}







