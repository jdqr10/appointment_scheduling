package com.pcduque.backend.auth.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank @Email @Size(max = 320) String email,
    @NotBlank String password
) {}
