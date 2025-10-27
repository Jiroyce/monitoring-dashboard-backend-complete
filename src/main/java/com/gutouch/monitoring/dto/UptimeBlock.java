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
class UptimeBlock {
    private Integer hour;
    private String status; // available, downtime
}