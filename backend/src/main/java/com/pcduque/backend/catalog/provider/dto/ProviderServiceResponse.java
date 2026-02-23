package com.pcduque.backend.catalog.provider.dto;

public record ProviderServiceResponse(
    Long id,
    String name,
    Integer durationMinutes
) {    
}
