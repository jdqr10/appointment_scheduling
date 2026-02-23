package com.pcduque.backend.catalog.service.dto;

public record ServiceResponse(
    Long id,
    String name,
    Integer durationMinutes,
    Boolean active
) {}