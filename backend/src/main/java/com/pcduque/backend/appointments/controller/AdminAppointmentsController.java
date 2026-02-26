package com.pcduque.backend.appointments.controller;

import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.service.AppointmentAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/appointments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAppointmentsController {

  private final AppointmentAdminService adminService;

  @GetMapping
  public List<AppointmentResponse> listAll() {
    return adminService.listAll();
  }

  @PostMapping("/{id}/confirm")
  public void confirm(@PathVariable Long id) {
    adminService.confirm(id);
  }

  @PostMapping("/{id}/complete")
  public void complete(@PathVariable Long id) {
    adminService.complete(id);
  }

  @PostMapping("/{id}/cancel")
  public void cancel(@PathVariable Long id) {
    adminService.cancelByAdmin(id);
  }
}
