package com.pcduque.backend.appointments.service;

import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.entity.AppointmentEntity;
import com.pcduque.backend.appointments.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentQueryService {

    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getProviderAgenda(Long providerId, OffsetDateTime from, OffsetDateTime to) {
        validateRange(from, to);

        return appointmentRepository.findByProviderAndRange(providerId, from, to)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUserHistory(Long userId, OffsetDateTime from, OffsetDateTime to) {
        validateRange(from, to);

        return appointmentRepository.findByUserAndRange(userId, from, to)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateRange(OffsetDateTime from, OffsetDateTime to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("from/to son requeridos");
        }
        if (!from.isBefore(to)) {
            throw new IllegalArgumentException("from debe ser menor que to");
        }
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
