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
public class TrendDataPointDTO {
    private ZonedDateTime timestamp;
    private double value;
    private String label;           // "27 Oct"
}
