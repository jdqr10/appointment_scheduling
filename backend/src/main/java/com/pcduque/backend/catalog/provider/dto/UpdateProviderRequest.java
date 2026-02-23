package com.pcduque.backend.catalog.provider.dto;

import jakarta.validation.constraints.Size;

public record UpdateProviderRequest(
    @Size(max = 120) String name,
    Boolean active
) {}