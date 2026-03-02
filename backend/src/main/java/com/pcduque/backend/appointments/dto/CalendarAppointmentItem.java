package com.pcduque.backend.appointments.dto;

import com.pcduque.backend.appointments.model.AppointmentStatus;

import java.time.OffsetDateTime;

public record CalendarAppointmentItem(
    Long id,
    OffsetDateTime startAt,
    OffsetDateTime endAt,
    AppointmentStatus status,
    Long serviceId,
    String serviceName,
    Long userId
) {}