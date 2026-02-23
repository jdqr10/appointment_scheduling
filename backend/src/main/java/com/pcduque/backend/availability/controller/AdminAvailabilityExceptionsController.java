package com.pcduque.backend.availability.controller;

import com.pcduque.backend.availability.dto.AdminAvailabilityExceptionResponse;
import com.pcduque.backend.availability.service.AvailabilityAdminService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/availability-exceptions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAvailabilityExceptionsController {

    private final AvailabilityAdminService adminService;

    @GetMapping
    @Operation(summary = "List provider availability exceptions (all providers, admin only)")
    public List<AdminAvailabilityExceptionResponse> listAllExceptions(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        return adminService.listAllExceptions(active, from, to);
    }
}
