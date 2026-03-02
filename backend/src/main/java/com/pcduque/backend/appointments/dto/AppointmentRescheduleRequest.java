package com.pcduque.backend.appointments.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record AppointmentRescheduleRequest(
    @NotNull OffsetDateTime newStartAt
) {}