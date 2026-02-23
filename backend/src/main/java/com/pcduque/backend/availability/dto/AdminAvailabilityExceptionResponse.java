package com.pcduque.backend.availability.dto;

import com.pcduque.backend.availability.model.AvailabilityExceptionType;

import java.time.OffsetDateTime;

public record AdminAvailabilityExceptionResponse(
        Long id,
        Long providerId,
        String providerName,
        AvailabilityExceptionType type,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        String reason,
        Boolean active
) {}
