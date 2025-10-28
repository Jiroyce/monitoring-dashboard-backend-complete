package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonDTO {
    private String winner;          // "pi-gateway" or "pi-connector"
    private String reason;
    private Map<String, Double> differences;  // metric -> % difference
}