package com.pcduque.backend.appointments.controller;

import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.service.AppointmentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/providers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProviderAgendaController {

  private final AppointmentQueryService queryService;

  // GET /admin/providers/{providerId}/appointments?from=...&to=...
  @GetMapping("/{providerId}/appointments")
  public List<AppointmentResponse> getAgenda(
      @PathVariable Long providerId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
  ) {
    return queryService.getProviderAgenda(providerId, from, to);
  }
}