package com.pcduque.backend.appointments.dto;

import com.pcduque.backend.availability.dto.AvailabilitySlotResponse;

import java.time.LocalDate;
import java.util.List;

public record ProviderCalendarDayResponse(
    LocalDate date,
    CalendarDaySummary summary,
    List<CalendarAppointmentItem> appointments,
    List<AvailabilitySlotResponse> availableSlots
) {}