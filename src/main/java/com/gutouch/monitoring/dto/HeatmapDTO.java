package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;






/**
 * DTO pour la heatmap de trafic
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapDTO {
    private Integer days;
    private List<DayHeatmap> data;
    private List<String> insights;
}
