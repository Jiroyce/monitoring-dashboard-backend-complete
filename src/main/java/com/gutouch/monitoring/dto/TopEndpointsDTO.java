package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;


// ============================================================================
// TOP ENDPOINTS
// ============================================================================

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopEndpointsDTO {
    private String type;            // "slowest" or "errors"
    private List<EndpointMetricsDTO> endpoints;
}