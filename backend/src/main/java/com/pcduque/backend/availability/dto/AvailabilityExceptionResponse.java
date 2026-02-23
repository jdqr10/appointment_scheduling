package com.pcduque.backend.availability.dto;

import com.pcduque.backend.availability.model.AvailabilityExceptionType;

import java.time.OffsetDateTime;

public record AvailabilityExceptionResponse(
        Long id,
        AvailabilityExceptionType type,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        String reason,
        Boolean active
) {}