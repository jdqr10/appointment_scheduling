package com.pcduque.backend.appointments.service;

import com.pcduque.backend.appointments.dto.CalendarAppointmentItem;
import com.pcduque.backend.appointments.dto.CalendarDaySummary;
import com.pcduque.backend.appointments.dto.ProviderCalendarDayResponse;
import com.pcduque.backend.appointments.entity.AppointmentEntity;
import com.pcduque.backend.appointments.model.AppointmentStatus;
import com.pcduque.backend.appointments.repository.AppointmentRepository;
import com.pcduque.backend.availability.dto.AvailabilitySlotResponse;
import com.pcduque.backend.availability.service.AvailabilityQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderCalendarService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilityQueryService availabilityQueryService;

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Bogota");

    /**
     * Construye un calendario por día para un provider.
     *
     * @param fromDate        inclusive
     * @param toDate          inclusive
     * @param includeSlots    si true, agrega availableSlots por día (requiere
     *                        durationMinutes)
     * @param durationMinutes requerido si includeSlots=true
     * @param statuses        filtro opcional por estados (null o vacío = todos)
     */
    @Transactional(readOnly = true)
    public List<ProviderCalendarDayResponse> getProviderCalendar(
            Long providerId,
            LocalDate fromDate,
            LocalDate toDate,
            boolean includeSlots,
            Integer durationMinutes,
            List<AppointmentStatus> statuses) {
        if (fromDate == null || toDate == null)
            throw new IllegalArgumentException("from/to son requeridos");
        if (toDate.isBefore(fromDate))
            throw new IllegalArgumentException("to no puede ser menor que from");

        if (includeSlots && (durationMinutes == null || durationMinutes <= 0)) {
            throw new IllegalArgumentException("durationMinutes es requerido y debe ser > 0 cuando includeSlots=true");
        }

        // Rango para BD: [from 00:00, to+1 00:00)
        OffsetDateTime from = fromDate.atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();
        OffsetDateTime to = toDate.plusDays(1).atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();

        // Traer citas del rango
        List<AppointmentEntity> appointments;
        if (statuses == null || statuses.isEmpty()) {
            appointments = appointmentRepository.findByProviderAndRange(providerId, from, to); // si ya la tienes
        } else {
            appointments = appointmentRepository.findByProviderAndRangeFiltered(providerId, from, to, statuses);
        }

        // Agrupar por LocalDate (según zona)
        Map<LocalDate, List<AppointmentEntity>> byDay = appointments.stream()
                .collect(Collectors.groupingBy(a -> a.getStartAt().atZoneSameInstant(DEFAULT_ZONE).toLocalDate()));

        // Construir respuesta por cada día, incluso si no tiene citas (útil para UI)
        List<ProviderCalendarDayResponse> out = new ArrayList<>();

        for (LocalDate d = fromDate; !d.isAfter(toDate); d = d.plusDays(1)) {
            List<AppointmentEntity> dayAppointments = byDay.getOrDefault(d, List.of());

            List<CalendarAppointmentItem> items = dayAppointments.stream()
                    .sorted(Comparator.comparing(AppointmentEntity::getStartAt))
                    .map(this::toCalendarItem)
                    .toList();

            List<AvailabilitySlotResponse> slots = List.of();
            if (includeSlots) {
                // Usa tu engine de Bloque 3 (que ya descuenta citas si lo implementaste)
                slots = availabilityQueryService.getAvailableSlots(providerId, d, d, durationMinutes);
            }

            CalendarDaySummary summary = new CalendarDaySummary(
                    items.size(),
                    (int) items.stream().filter(i -> i.status() == AppointmentStatus.PENDING).count(),
                    (int) items.stream().filter(i -> i.status() == AppointmentStatus.CONFIRMED).count(),
                    (int) items.stream().filter(i -> i.status() == AppointmentStatus.CANCELLED).count(),
                    (int) items.stream().filter(i -> i.status() == AppointmentStatus.COMPLETED).count());

            out.add(new ProviderCalendarDayResponse(d, summary, items, slots));
        }

        return out;
    }

    private CalendarAppointmentItem toCalendarItem(AppointmentEntity a) {
        return new CalendarAppointmentItem(
                a.getId(),
                a.getStartAt(),
                a.getEndAt(),
                a.getStatus(),
                a.getService().getId(),
                safeServiceName(a),
                a.getUser().getId());
    }

    private String safeServiceName(AppointmentEntity a) {
        try {
            return a.getService().getName();
        } catch (Exception e) {
            return null;
        }
    }
}