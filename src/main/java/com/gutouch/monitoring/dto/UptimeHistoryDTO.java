package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;



/**
 * DTO pour l'historique d'uptime
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UptimeHistoryDTO {
    private Integer days;
    private Map<String, Double> connectorUptimes;
    private List<DayUptime> dailyBreakdown;
}