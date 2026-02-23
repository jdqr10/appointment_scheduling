package com.pcduque.backend.availability.dto;

import java.time.LocalTime;

public record AvailabilityRuleResponse(
        Long id,
        Integer dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        Integer slotStepMinutes,
        Boolean active
) {}