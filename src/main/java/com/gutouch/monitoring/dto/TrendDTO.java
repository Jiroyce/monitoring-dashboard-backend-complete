package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;





/**
 * DTO pour les tendances
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendDTO {
    private String metric;
    private Integer days;
    private List<TrendPoint> data;
    private List<Anomaly> anomalies;
}