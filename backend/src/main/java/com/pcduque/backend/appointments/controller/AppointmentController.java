package com.pcduque.backend.appointments.controller;

import com.pcduque.backend.appointments.dto.AppointmentCreateRequest;
import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.service.AppointmentService;
import com.pcduque.backend.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/appointments")
@PreAuthorize("hasRole('CLIENT')")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    private Long currentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado"));
    }

    @PostMapping
    @Operation(summary = "Create a new appointment for the authenticated client")
    public AppointmentResponse create(
            Authentication authentication,
            @Valid @RequestBody AppointmentCreateRequest req
    ) {
        return appointmentService.createAppointment(currentUserId(authentication), req);
    }

    @GetMapping("/me")
    @Operation(summary = "List appointments for the authenticated client")
    public List<AppointmentResponse> myAppointments(Authentication authentication) {
        return appointmentService.myAppointments(currentUserId(authentication));
    }

    @PostMapping("/{appointmentId}/cancel")
    @Operation(summary = "Cancel an appointment owned by the authenticated client")
    public void cancel(Authentication authentication, @PathVariable Long appointmentId) {
        appointmentService.cancelAppointment(currentUserId(authentication), appointmentId);
    }
}
