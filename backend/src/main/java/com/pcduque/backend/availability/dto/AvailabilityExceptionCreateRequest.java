package com.pcduque.backend.availability.dto;

import com.pcduque.backend.availability.model.AvailabilityExceptionType;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record AvailabilityExceptionCreateRequest(
        @NotNull AvailabilityExceptionType type,
        @NotNull OffsetDateTime startAt,
        @NotNull OffsetDateTime endAt,
        String reason
) {}