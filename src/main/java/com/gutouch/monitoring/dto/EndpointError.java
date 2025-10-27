package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;




/**
 * Erreur d'un endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndpointError {
    private String path;
    private Integer status;
    private Long count;
    private Instant lastSeen;
}
