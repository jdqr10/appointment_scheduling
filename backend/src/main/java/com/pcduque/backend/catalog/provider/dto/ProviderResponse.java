package com.pcduque.backend.catalog.provider.dto;

public record ProviderResponse(
    Long id,
    String name,
    Boolean active
) {}