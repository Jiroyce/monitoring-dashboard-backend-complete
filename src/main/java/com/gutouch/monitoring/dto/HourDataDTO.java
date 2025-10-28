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
public class HourDataDTO {
    private int hour;               // 0-23
    private long requests;
    private String level;           // "low", "medium", "high", "very_high"
    private double avgLatencyMs;
}