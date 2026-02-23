package com.pcduque.backend.availability.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pcduque.backend.availability.dto.AvailabilitySlotResponse;
import com.pcduque.backend.availability.service.AvailabilityQueryService;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
@RequestMapping("/providers")
public class PublicAvailabilityController {

    private final AvailabilityQueryService availabilityQueryService;

    @GetMapping("/{providerId}/availability/slots")
    public List<AvailabilitySlotResponse> getSlots(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam Integer durationMinutes
    ) {
        return availabilityQueryService.getAvailableSlots(providerId, from, to, durationMinutes);
    }
    
    
}
