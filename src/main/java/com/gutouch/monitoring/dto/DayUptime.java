package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class DayUptime {
    private String date;
    private Map<String, Double> uptimeByConnector;
    private List<UptimeBlock> blocks; // 24 blocks (1 per hour)
}