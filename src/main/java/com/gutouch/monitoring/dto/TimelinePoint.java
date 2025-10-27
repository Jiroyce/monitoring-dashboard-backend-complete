package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;







/**
 * Point de timeline
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelinePoint {
    private Instant timestamp;
    private Integer piGatewayRequests;
    private Integer piConnectorRequests;
}