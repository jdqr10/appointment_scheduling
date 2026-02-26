package com.pcduque.backend.appointments.service;

import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.entity.AppointmentEntity;
import com.pcduque.backend.appointments.model.AppointmentStatus;
import com.pcduque.backend.appointments.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentAdminService {

  private final AppointmentRepository appointmentRepository;

  @Transactional(readOnly = true)
  public List<AppointmentResponse> listAll() {
    return appointmentRepository.findAll()
        .stream()
        .sorted((a, b) -> b.getStartAt().compareTo(a.getStartAt()))
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public void confirm(Long appointmentId) {
    AppointmentEntity a = appointmentRepository.findById(appointmentId)
        .orElseThrow(() -> new IllegalArgumentException("Appointment no existe"));

    transitionOrThrow(a, AppointmentStatus.CONFIRMED, "APPOINTMENT_INVALID_STATUS_TRANSITION");
    appointmentRepository.save(a);
  }

  @Transactional
  public void complete(Long appointmentId) {
    AppointmentEntity a = appointmentRepository.findById(appointmentId)
        .orElseThrow(() -> new IllegalArgumentException("Appointment no existe"));

    transitionOrThrow(a, AppointmentStatus.COMPLETED, "APPOINTMENT_INVALID_STATUS_TRANSITION");
    appointmentRepository.save(a);
  }

  @Transactional
  public void cancelByAdmin(Long appointmentId) {
    AppointmentEntity a = appointmentRepository.findById(appointmentId)
        .orElseThrow(() -> new IllegalArgumentException("Appointment no existe"));

    transitionOrThrow(a, AppointmentStatus.CANCELLED, "APPOINTMENT_INVALID_STATUS_TRANSITION");
    appointmentRepository.save(a);
  }

  private void transitionOrThrow(AppointmentEntity a, AppointmentStatus to, String code) {
    var from = a.getStatus();
    if (!AppointmentStatusTransitions.canTransition(from, to)) {
      throw new AppointmentConflictException(code + ": No se puede pasar de " + from + " a " + to);
    }
    a.setStatus(to);
  }

  private AppointmentResponse toResponse(AppointmentEntity a) {
    return new AppointmentResponse(
        a.getId(),
        a.getProvider().getId(),
        a.getService().getId(),
        a.getUser().getId(),
        a.getStartAt(),
        a.getEndAt(),
        a.getStatus(),
        a.getNotes()
    );
  }
}
