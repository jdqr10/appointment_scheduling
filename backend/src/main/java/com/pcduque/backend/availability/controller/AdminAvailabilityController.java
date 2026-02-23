package com.pcduque.backend.availability.controller;

import com.pcduque.backend.availability.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import com.pcduque.backend.availability.service.AvailabilityAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/providers/{providerId}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAvailabilityController {

    private final AvailabilityAdminService adminService;

    // ---- Rules ----
    @PostMapping("/availability-rules")
    @Operation(summary = "Create provider availability rule")
    public AvailabilityRuleResponse createRule(
            @PathVariable Long providerId,
            @Valid @RequestBody AvailabilityRuleCreateRequest req
    ) {
        return adminService.createRule(providerId, req);
    }

    @GetMapping("/availability-rules")
    @Operation(summary = "List active availability rules for provider")
    public List<AvailabilityRuleResponse> listRules(@PathVariable Long providerId) {
        return adminService.listRules(providerId);
    }

    @DeleteMapping("/availability-rules/{ruleId}")
    @Operation(summary = "Soft delete provider availability rule")
    public void deleteRule(@PathVariable Long providerId, @PathVariable Long ruleId) {
        adminService.deleteRule(providerId, ruleId);
    }

    // ---- Exceptions ----
    @PostMapping("/availability-exceptions")
    @Operation(summary = "Create provider availability exception")
    public AvailabilityExceptionResponse createException(
            @PathVariable Long providerId,
            @Valid @RequestBody AvailabilityExceptionCreateRequest req
    ) {
        return adminService.createException(providerId, req);
    }

    @GetMapping("/availability-exceptions")
    @Operation(summary = "List active availability exceptions in date range")
    public List<AvailabilityExceptionResponse> listExceptions(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        return adminService.listExceptions(providerId, from, to);
    }
}
