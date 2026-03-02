package com.pcduque.backend.appointments.controller;

import com.pcduque.backend.appointments.dto.ProviderCalendarDayResponse;
import com.pcduque.backend.appointments.model.AppointmentStatus;
import com.pcduque.backend.appointments.service.ProviderCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/providers")
public class ProviderCalendarController {

    private final ProviderCalendarService calendarService;

    @GetMapping("/{providerId}/calendar")
    public List<ProviderCalendarDayResponse> calendar(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "false") boolean includeSlots,
            @RequestParam(required = false) Integer durationMinutes,
            @RequestParam(required = false) List<AppointmentStatus> statuses) {
        return calendarService.getProviderCalendar(providerId, from, to, includeSlots, durationMinutes, statuses);
    }

    @GetMapping("/{providerId}/calendar/month")
    public List<ProviderCalendarDayResponse> calendarMonth(
            @PathVariable Long providerId,
            @RequestParam String month, // "2026-03"
            @RequestParam(defaultValue = "false") boolean includeSlots,
            @RequestParam(required = false) Integer durationMinutes,
            @RequestParam(required = false) List<AppointmentStatus> statuses) {
        YearMonth ym = YearMonth.parse(month);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        return calendarService.getProviderCalendar(providerId, from, to, includeSlots, durationMinutes, statuses);
    }

}