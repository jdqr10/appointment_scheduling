package com.pcduque.backend.availability.dto;

import java.time.OffsetDateTime;

public record AvailabilitySlotResponse(
    OffsetDateTime startAt,
    OffsetDateTime endAt
) {
    
}
