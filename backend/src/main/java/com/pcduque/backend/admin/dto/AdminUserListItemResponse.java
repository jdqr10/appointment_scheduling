package com.pcduque.backend.admin.dto;

import java.time.OffsetDateTime;

public record AdminUserListItemResponse(
    Long id,
    String email,
    String fullName,
    String role,
    OffsetDateTime createdAt
) {}
