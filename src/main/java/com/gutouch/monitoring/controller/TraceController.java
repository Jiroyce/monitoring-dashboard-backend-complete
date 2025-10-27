package com.gutouch.monitoring.controller;

import com.gutouch.monitoring.dto.TraceDTO;
import com.gutouch.monitoring.service.TraceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/processing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Processing Tracer", description = "APIs pour tracer les transactions complètes")
@CrossOrigin(origins = "*")
public class TraceController {

    private final TraceService traceService;

    @GetMapping("/trace/{messageId}")
    @Operation(summary = "Tracer par messageId", description = "Retourne la trace complète d'une transaction via son messageId")
    public ResponseEntity<TraceDTO> traceByMessageId(
            @Parameter(description = "Message ID de la transaction")
            @PathVariable String messageId) {
        
        log.info("GET /api/processing/trace/{}", messageId);
        
        try {
            TraceDTO trace = traceService.traceByMessageId(messageId);
            if (trace == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(trace);
        } catch (Exception e) {
            log.error("Error tracing by messageId: {}", messageId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/trace")
    @Operation(summary = "Tracer par endToEndId", description = "Retourne la trace complète d'une transaction via son endToEndId")
    public ResponseEntity<TraceDTO> traceByEndToEndId(
            @Parameter(description = "End-to-End ID de la transaction")
            @RequestParam String endToEndId) {
        
        log.info("GET /api/processing/trace?endToEndId={}", endToEndId);
        
        try {
            TraceDTO trace = traceService.traceByEndToEndId(endToEndId);
            if (trace == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(trace);
        } catch (Exception e) {
            log.error("Error tracing by endToEndId: {}", endToEndId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}






