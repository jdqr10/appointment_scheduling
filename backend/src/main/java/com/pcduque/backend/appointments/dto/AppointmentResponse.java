package com.pcduque.backend.appointments.dto;

import com.pcduque.backend.appointments.model.AppointmentStatus;

import java.time.OffsetDateTime;

public record AppointmentResponse(
        Long id,
        Long providerId,
        Long serviceId,
        Long userId,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        AppointmentStatus status,
        String notes
) {}