package com.pcduque.backend.appointments.service;

import com.pcduque.backend.appointments.dto.AppointmentCreateRequest;
import com.pcduque.backend.appointments.dto.AppointmentResponse;
import com.pcduque.backend.appointments.entity.AppointmentEntity;
import com.pcduque.backend.appointments.model.AppointmentStatus;
import com.pcduque.backend.appointments.repository.AppointmentRepository;
import com.pcduque.backend.availability.dto.AvailabilitySlotResponse;
import com.pcduque.backend.availability.service.AvailabilityConflictException;
import com.pcduque.backend.availability.service.AvailabilityQueryService;
import com.pcduque.backend.catalog.provider.ProviderEntity;
import com.pcduque.backend.catalog.provider.ProviderRepository; 
import com.pcduque.backend.catalog.service.ServiceEntity;      
import com.pcduque.backend.catalog.service.ServiceRepository;  
import com.pcduque.backend.user.User;                  
import com.pcduque.backend.user.UserRepository;              
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ProviderRepository providerRepository;   
    private final ServiceRepository serviceRepository;     
    private final UserRepository userRepository;           
    private final AvailabilityQueryService availabilityQueryService;

    @Transactional
    public AppointmentResponse createAppointment(Long userId, AppointmentCreateRequest req) {

        ProviderEntity provider = providerRepository.findById(req.providerId())
                .orElseThrow(() -> new IllegalArgumentException("Provider no existe"));

        ServiceEntity service = serviceRepository.findById(req.serviceId())
                .orElseThrow(() -> new IllegalArgumentException("Service no existe"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User no existe"));

        int durationMin = service.getDurationMinutes(); 

        OffsetDateTime startAt = req.startAt();
        OffsetDateTime endAt = startAt.plusMinutes(durationMin);

        // 1) Validar contra disponibilidad
        LocalDate from = startAt.toLocalDate();
        LocalDate to = startAt.toLocalDate();

        List<AvailabilitySlotResponse> slots = availabilityQueryService.getAvailableSlots(
                provider.getId(),
                from,
                to,
                durationMin
        );

        boolean slotExists = slots.stream().anyMatch(s ->
                s.startAt().equals(startAt) && s.endAt().equals(endAt)
        );

        if (!slotExists) {
            throw new AvailabilityConflictException("SLOT_NOT_AVAILABLE: El horario solicitado no está disponible.");
        }

        // 2) Crear appointment (status PENDING)
        AppointmentEntity entity = AppointmentEntity.builder()
                .provider(provider)
                .service(service)
                .user(user)
                .startAt(startAt)
                .endAt(endAt)
                .status(AppointmentStatus.PENDING)
                .notes(req.notes())
                .build();

        try {
            AppointmentEntity saved = appointmentRepository.save(entity);
            return toResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            // Captura el EXCLUDE constraint anti-overlap
            throw new AvailabilityConflictException("APPOINTMENT_OVERLAP: Ya existe una cita en ese rango.");
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> myAppointments(Long userId) {
        return appointmentRepository.findByUser_IdOrderByStartAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void cancelAppointment(Long userId, Long appointmentId) {
        AppointmentEntity a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment no existe"));

        if (!a.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("No puedes cancelar una cita que no es tuya");
        }

        a.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(a);
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