package com.pcduque.backend.catalog.provider.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record AssignServicesRequest(
    @NotNull @NotEmpty Set<Long> serviceIds
) {}