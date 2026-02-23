package com.pcduque.backend.catalog.provider.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProviderRequest(
    @NotBlank @Size(max = 120) String name
) {}