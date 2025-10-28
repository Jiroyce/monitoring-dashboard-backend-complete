package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;





// ============================================================================
// CONNECTOR BREAKDOWN
// ============================================================================

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConnectorBreakdownDTO {
    private ConnectorMetricsDTO piGateway;
    private ConnectorMetricsDTO piConnector;
    private ComparisonDTO comparison;
}