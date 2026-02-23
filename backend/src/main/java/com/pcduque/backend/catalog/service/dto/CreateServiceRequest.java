package com.pcduque.backend.catalog.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateServiceRequest(
    @NotBlank @Size(max = 120) String name,
    @NotNull @Min(1) @Max(480) Integer durationMinutes
) {}