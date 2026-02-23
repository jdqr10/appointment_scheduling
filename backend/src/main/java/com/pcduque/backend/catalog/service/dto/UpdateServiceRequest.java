package com.pcduque.backend.catalog.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateServiceRequest(
    @Size(max = 120) String name,
    @Min(1) @Max(480) Integer durationMinutes,
    Boolean active
) {}