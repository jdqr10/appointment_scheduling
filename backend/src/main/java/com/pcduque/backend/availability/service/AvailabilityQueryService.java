package com.pcduque.backend.availability.service;

import com.pcduque.backend.appointments.entity.AppointmentEntity;
import com.pcduque.backend.appointments.repository.AppointmentRepository;
import com.pcduque.backend.availability.dto.AvailabilitySlotResponse;
import com.pcduque.backend.availability.entity.ProviderAvailabilityRuleEntity;
import com.pcduque.backend.availability.model.AvailabilityExceptionType;
import com.pcduque.backend.availability.repository.ProviderAvailabilityRuleRepository;
import com.pcduque.backend.availability.repository.ProviderAvailabilityExceptionRepository; 
import com.pcduque.backend.availability.entity.ProviderAvailabilityExceptionEntity;      
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityQueryService {

    private final ProviderAvailabilityRuleRepository ruleRepository;
    private final ProviderAvailabilityExceptionRepository exceptionRepository;
    private final AppointmentRepository appointmentRepository;

    // Si aún no manejas timezone por provider, usa uno fijo
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Bogota");

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponse> getAvailableSlots(
            Long providerId,
            LocalDate from,
            LocalDate to,
            int serviceDurationMinutes
    ) {
        if (from == null || to == null) throw new IllegalArgumentException("from/to son requeridos");
        if (to.isBefore(from)) throw new IllegalArgumentException("to no puede ser menor que from");
        if (serviceDurationMinutes <= 0) throw new IllegalArgumentException("serviceDurationMinutes debe ser > 0");

        // Rango completo [from 00:00, to+1 00:00) para consultar excepciones una sola vez
        OffsetDateTime rangeStart = from.atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();
        OffsetDateTime rangeEnd = to.plusDays(1).atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();

        // 1) Cargar reglas semanales activas
        List<ProviderAvailabilityRuleEntity> rules = ruleRepository.findByProvider_IdAndActiveTrue(providerId);

        // 2) Cargar excepciones activas que intersecten el rango
        List<ProviderAvailabilityExceptionEntity> exceptions =
                exceptionRepository.findActiveIntersecting(providerId, rangeStart, rangeEnd);

        // 3) Generar slots día por día
        List<AvailabilitySlotResponse> out = new ArrayList<>();

        List<AppointmentEntity> appointments =
                appointmentRepository.findBlockingIntersectingByProvider(providerId, rangeStart, rangeEnd);

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {

            short dow = (short) date.getDayOfWeek().getValue(); // 1..7 (como en tu entity)

            // Reglas de ese día
            List<ProviderAvailabilityRuleEntity> dayRules = rules.stream()
                    .filter(r -> r.getActive() != null && r.getActive())
                    .filter(r -> r.getDayOfWeek() != null && r.getDayOfWeek() == dow)
                    .toList();

            if (dayRules.isEmpty()) continue;

            // Excepciones que tocan este día (acotadas al día)
            OffsetDateTime dayStart = date.atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();
            OffsetDateTime dayEnd = date.plusDays(1).atStartOfDay(DEFAULT_ZONE).toOffsetDateTime();

            List<ProviderAvailabilityExceptionEntity> dayExceptions = exceptions.stream()
                    .filter(e -> e.getActive() != null && e.getActive())
                    .filter(e -> e.getStartAt().isBefore(dayEnd) && e.getEndAt().isAfter(dayStart))
                    .toList();

            // 3.1 Construir intervalos base desde reglas
            List<Interval> baseIntervals = new ArrayList<>();
            for (ProviderAvailabilityRuleEntity rule : dayRules) {
                OffsetDateTime start = date.atTime(rule.getStartTime()).atZone(DEFAULT_ZONE).toOffsetDateTime();
                OffsetDateTime end = date.atTime(rule.getEndTime()).atZone(DEFAULT_ZONE).toOffsetDateTime();
                int step = rule.getSlotStepMin() != null ? rule.getSlotStepMin() : 15;

                baseIntervals.add(new Interval(start, end, step));
            }

            // 3.2 Aplicar excepciones:
            // - BLOCK: restar
            // - EXTRA_OPEN: sumar (unión)
            List<Interval> effective = baseIntervals;

            // A) restar BLOCK
            List<ProviderAvailabilityExceptionEntity> blocks = dayExceptions.stream()
                    .filter(e -> e.getType() == AvailabilityExceptionType.BLOCK)
                    .toList();

            for (ProviderAvailabilityExceptionEntity block : blocks) {
                effective = subtractIntervals(effective, block.getStartAt(), block.getEndAt());
            }

            // B) sumar EXTRA_OPEN
            List<ProviderAvailabilityExceptionEntity> extras = dayExceptions.stream()
                    .filter(e -> e.getType() == AvailabilityExceptionType.EXTRA_OPEN)
                    .toList();

            for (ProviderAvailabilityExceptionEntity extra : extras) {
                // Para EXTRA_OPEN usamos step=15 por defecto (puedes evolucionarlo luego)
                Interval extraInterval = new Interval(
                        max(extra.getStartAt(), dayStart),
                        min(extra.getEndAt(), dayEnd),
                        15
                );
                effective = unionIntervals(effective, List.of(extraInterval));
            }

            // C) restar citas ya ocupadas (PENDING/CONFIRMED) para no mostrar slots tomados
            List<AppointmentEntity> dayAppointments = appointments.stream()
                    .filter(a -> a.getStartAt().isBefore(dayEnd) && a.getEndAt().isAfter(dayStart))
                    .toList();

            for (AppointmentEntity ap : dayAppointments) {
                effective = subtractIntervals(effective, ap.getStartAt(), ap.getEndAt());
            }

            // 3.3 Generar slots dentro de intervals efectivos
            for (Interval interval : effective) {
                if (!interval.start.isBefore(interval.end)) continue;

                OffsetDateTime slotStart = ceilToStep(interval.start, interval.stepMinutes);
                while (!slotStart.plusMinutes(serviceDurationMinutes).isAfter(interval.end)) {
                    OffsetDateTime slotEnd = slotStart.plusMinutes(serviceDurationMinutes);
                    out.add(new AvailabilitySlotResponse(slotStart, slotEnd));
                    slotStart = slotStart.plusMinutes(interval.stepMinutes);
                }
            }
        }

        // Ordenar salida
        return out.stream()
                .sorted(Comparator.comparing(AvailabilitySlotResponse::startAt))
                .toList();
    }

    // ---------------------- Helpers de intervalos ----------------------

    private record Interval(OffsetDateTime start, OffsetDateTime end, int stepMinutes) {}

    private static OffsetDateTime ceilToStep(OffsetDateTime dt, int stepMinutes) {
        // Redondea hacia arriba al siguiente múltiplo de step en minutos dentro de la hora.
        int minute = dt.getMinute();
        int mod = minute % stepMinutes;
        if (mod == 0 && dt.getSecond() == 0 && dt.getNano() == 0) return dt.withSecond(0).withNano(0);

        int add = (mod == 0) ? 0 : (stepMinutes - mod);
        OffsetDateTime rounded = dt.plusMinutes(add).withSecond(0).withNano(0);

        // Si tenía segundos/nanos, y mod==0, aún así lo empujamos al próximo step
        if (mod == 0 && (dt.getSecond() != 0 || dt.getNano() != 0)) {
            rounded = dt.plusMinutes(stepMinutes).withSecond(0).withNano(0);
        }
        return rounded;
    }

    private static List<Interval> subtractIntervals(List<Interval> intervals, OffsetDateTime cutStart, OffsetDateTime cutEnd) {
        List<Interval> out = new ArrayList<>();
        for (Interval in : intervals) {
            // no intersecta
            if (!in.start.isBefore(cutEnd) || !cutStart.isBefore(in.end)) {
                out.add(in);
                continue;
            }

            // Intersección existe: [in.start, in.end) - [cutStart, cutEnd)
            OffsetDateTime leftStart = in.start;
            OffsetDateTime leftEnd = min(in.end, cutStart);

            OffsetDateTime rightStart = max(in.start, cutEnd);
            OffsetDateTime rightEnd = in.end;

            if (leftStart.isBefore(leftEnd)) {
                out.add(new Interval(leftStart, leftEnd, in.stepMinutes));
            }
            if (rightStart.isBefore(rightEnd)) {
                out.add(new Interval(rightStart, rightEnd, in.stepMinutes));
            }
        }
        return out;
    }

    private static List<Interval> unionIntervals(List<Interval> base, List<Interval> add) {
        List<Interval> all = new ArrayList<>();
        all.addAll(base);
        all.addAll(add);

        // ordenar por inicio
        all.sort(Comparator.comparing(Interval::start));

        // merge (nota: stepMinutes puede variar; por simplicidad, conservamos el del primer intervalo merged)
        List<Interval> merged = new ArrayList<>();
        for (Interval cur : all) {
            if (merged.isEmpty()) {
                merged.add(cur);
                continue;
            }
            Interval last = merged.get(merged.size() - 1);

            if (!cur.start.isAfter(last.end)) {
                // se solapan o tocan
                OffsetDateTime newEnd = max(last.end, cur.end);
                merged.set(merged.size() - 1, new Interval(last.start, newEnd, last.stepMinutes));
            } else {
                merged.add(cur);
            }
        }
        return merged;
    }

    private static OffsetDateTime min(OffsetDateTime a, OffsetDateTime b) {
        return a.isBefore(b) ? a : b;
    }

    private static OffsetDateTime max(OffsetDateTime a, OffsetDateTime b) {
        return a.isAfter(b) ? a : b;
    }
}
