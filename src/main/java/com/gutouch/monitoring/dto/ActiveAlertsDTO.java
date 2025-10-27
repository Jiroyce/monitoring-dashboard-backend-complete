package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;


/**
 * DTO pour les alertes actives
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveAlertsDTO {
    private Integer count;
    private Integer critical;
    private Integer warning;
    private List<Alert> alerts;
}