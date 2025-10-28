package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;






// ============================================================================
// TOP CLIENTS
// ============================================================================

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopClientDTO {
    private String clientIp;
    private long requests;
    private long errors;
    private double errorRate;
    private double avgLatencyMs;
    private String connector;       // si filtré, sinon "all"
}
