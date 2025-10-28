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
public class DayHeatmapDTO {
    private String day;              // "Lun", "Mar", etc.
    private String date;             // "2025-10-27"
    private List<HourDataDTO> hours;
}
