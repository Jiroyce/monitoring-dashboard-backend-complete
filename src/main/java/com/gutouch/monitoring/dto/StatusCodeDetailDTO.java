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
public class StatusCodeDetailDTO {
    private int statusCode;
    private long count;
    private double percentage;
    private String description;     // "OK", "Not Found", etc.
}