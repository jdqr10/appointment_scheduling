package com.pcduque.backend.auth.dto;

public record MeResponse(
    Long id,
    String email,
    String fullName,
    String role
) {}
