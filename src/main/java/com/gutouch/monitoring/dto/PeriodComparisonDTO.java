package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * DTO pour la comparaison de périodes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeriodComparisonDTO {
    private PeriodData period1;
    private PeriodData period2;
    private ComparisonResult comparison;
}