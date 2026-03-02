package com.pcduque.backend.appointments.dto;

public record CalendarDaySummary(
    int total,
    int pending,
    int confirmed,
    int cancelled,
    int completed
) {}