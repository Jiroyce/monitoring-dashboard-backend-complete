package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;






// ============================================================================
// TRENDS
// ============================================================================

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendsDTO {
    private String metric;
    private List<TrendDataPointDTO> data;
    private List<AnomalyDTO> anomalies;
    private TrendInsightsDTO insights;
}