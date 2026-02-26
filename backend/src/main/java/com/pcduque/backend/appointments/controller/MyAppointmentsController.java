package com.pcduque.backend.appointments.controller;

import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.service.AppointmentQueryService;
import com.pcduque.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appointments")
@PreAuthorize("hasRole('CLIENT')")
public class MyAppointmentsController {

  private final AppointmentQueryService queryService;
  private final UserRepository userRepository;

  private Long currentUserId(Authentication authentication) {
    String email = authentication.getName();
    return userRepository.findByEmail(email)
        .map(user -> user.getId())
        .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
  }

  // GET /appointments/me?from=...&to=...
  @GetMapping(value = "/me", params = {"from", "to"})
  public List<AppointmentResponse> myHistory(
      Authentication authentication,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
  ) {
    return queryService.getUserHistory(currentUserId(authentication), from, to);
  }
}
