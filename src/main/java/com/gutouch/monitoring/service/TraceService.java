package com.gutouch.monitoring.service;

import com.gutouch.monitoring.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TraceService {

    private final BigtableService bigtableService;

    /**
     * Tracer une transaction par messageId
     */
    @Cacheable(value = "traces", key = "'msg_' + #messageId")
    public TraceDTO traceByMessageId(String messageId) {
        log.info("Tracing transaction by messageId: {}", messageId);
        
        List<Map<String, String>> steps = bigtableService.traceByMessageId(messageId);
        
        if (steps.isEmpty()) {
            return null;
        }
        
        return buildTrace(messageId, null, steps);
    }

    /**
     * Tracer une transaction par endToEndId
     */
    @Cacheable(value = "traces", key = "'e2e_' + #endToEndId")
    public TraceDTO traceByEndToEndId(String endToEndId) {
        log.info("Tracing transaction by endToEndId: {}", endToEndId);
        
        List<Map<String, String>> steps = bigtableService.traceByEndToEndId(endToEndId);
        
        if (steps.isEmpty()) {
            return null;
        }
        
        // Extraire le messageId du premier step
        String messageId = steps.get(0).get("messageId");
        
        return buildTrace(messageId, endToEndId, steps);
    }

    /**
     * Construire le DTO de trace
     */
    private TraceDTO buildTrace(String messageId, String endToEndId, List<Map<String, String>> steps) {
        // Convertir les steps
        List<TraceStep> traceSteps = steps.stream()
                .map(this::mapToTraceStep)
                .sorted(Comparator.comparing(TraceStep::getTimestamp))
                .collect(Collectors.toList());
        
        // Numéroter les steps
        for (int i = 0; i < traceSteps.size(); i++) {
            traceSteps.get(i).setSequence(i + 1);
        }
        
        // Calculer les temps
        Instant startTime = traceSteps.get(0).getTimestamp();
        Instant endTime = traceSteps.get(traceSteps.size() - 1).getTimestamp();
        long totalDurationMs = endTime.toEpochMilli() - startTime.toEpochMilli();
        
        // Déterminer le status
        String status = traceSteps.stream()
                .anyMatch(step -> step.getStatus() != null && step.getStatus() >= 400)
                ? "failure"
                : "success";
        
        // Détecter les bottlenecks
        List<Bottleneck> bottlenecks = detectBottlenecks(traceSteps, totalDurationMs);
        
        // Construire le transactionId
        String transactionId = endToEndId != null ? endToEndId : messageId;
        
        return TraceDTO.builder()
                .transactionId(transactionId)
                .messageId(messageId)
                .endToEndId(endToEndId)
                .startTime(startTime)
                .endTime(endTime)
                .totalDurationMs(totalDurationMs)
                .status(status)
                .steps(traceSteps)
                .bottlenecks(bottlenecks)
                .build();
    }

    /**
     * Convertir une map en TraceStep
     */
    private TraceStep mapToTraceStep(Map<String, String> data) {
        return TraceStep.builder()
                .timestamp(parseTimestamp(data.get("timestamp")))
                .type(data.get("type"))
                .service(data.getOrDefault("service", data.get("connector")))
                .method(data.get("method"))
                .path(data.get("path"))
                .status(parseInt(data.get("status")))
                .durationMs(parseLong(data.getOrDefault("duration_ms", data.get("response_time_ms"))))
                .clientIp(data.get("client_ip"))
                .message(data.getOrDefault("message", data.get("message_content")))
                .build();
    }

    /**
     * Détecter les bottlenecks dans la trace
     */
    private List<Bottleneck> detectBottlenecks(List<TraceStep> steps, long totalDurationMs) {
        List<Bottleneck> bottlenecks = new ArrayList<>();
        
        // Seuil : étapes qui prennent plus de 30% du temps total
        double threshold = 0.30;
        
        for (int i = 0; i < steps.size(); i++) {
            TraceStep step = steps.get(i);
            
            if (step.getDurationMs() != null) {
                double percentage = (double) step.getDurationMs() / totalDurationMs * 100;
                
                if (percentage >= threshold * 100) {
                    String suggestion = generateSuggestion(step, percentage);
                    
                    bottlenecks.add(Bottleneck.builder()
                            .step(step.getSequence())
                            .service(step.getService())
                            .durationMs(step.getDurationMs())
                            .percentage(percentage)
                            .suggestion(suggestion)
                            .build());
                }
            }
        }
        
        return bottlenecks.stream()
                .sorted(Comparator.comparing(Bottleneck::getPercentage).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Générer une suggestion d'optimisation
     */
    private String generateSuggestion(TraceStep step, double percentage) {
        if (step.getService() != null && step.getService().contains("notification")) {
            return "Consider async notifications to improve response time";
        }
        
        if (step.getDurationMs() != null && step.getDurationMs() > 1000) {
            return "Consider caching or optimization for this step";
        }
        
        if (percentage > 50) {
            return "This step is a major bottleneck - requires immediate attention";
        }
        
        return "Consider optimization for this step";
    }

    /**
     * Helper parsing methods
     */
    private Instant parseTimestamp(String value) {
        if (value == null || value.isEmpty()) return Instant.now();
        try {
            // Si c'est un timestamp en millisecondes
            if (value.matches("\\d+")) {
                return Instant.ofEpochMilli(Long.parseLong(value));
            }
            // Si c'est un ISO timestamp
            return Instant.parse(value);
        } catch (Exception e) {
            return Instant.now();
        }
    }

    private Integer parseInt(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long parseLong(String value) {
        if (value == null || value.isEmpty()) return null;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}