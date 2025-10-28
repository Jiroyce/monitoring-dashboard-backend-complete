package com.gutouch.monitoring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;



// ============================================================================
// STATUS DISTRIBUTION
// ============================================================================

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusDistributionDTO {
    private Map<String, StatusCategoryDTO> categories;  // "2xx", "3xx", "4xx", "5xx"
    private List<StatusCodeDetailDTO> topCodes;         // Top 5 status codes
}