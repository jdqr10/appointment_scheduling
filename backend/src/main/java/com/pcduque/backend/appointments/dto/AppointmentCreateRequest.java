package com.pcduque.backend.appointments.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record AppointmentCreateRequest(
        @JsonAlias("provider_id")
        @NotNull Long providerId,
        @JsonAlias("service_id")
        @NotNull Long serviceId,
        @JsonAlias("start_at")
        @NotNull OffsetDateTime startAt,
        String notes
) {}
