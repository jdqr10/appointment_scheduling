package com.pcduque.backend.availability.service;

import com.pcduque.backend.availability.dto.*;
import com.pcduque.backend.availability.entity.ProviderAvailabilityExceptionEntity;
import com.pcduque.backend.availability.entity.ProviderAvailabilityRuleEntity;
import com.pcduque.backend.availability.repository.ProviderAvailabilityExceptionRepository;
import com.pcduque.backend.availability.repository.ProviderAvailabilityRuleRepository;
import com.pcduque.backend.catalog.provider.ProviderEntity;
import com.pcduque.backend.catalog.provider.ProviderRepository; // ajusta
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityAdminService {

    private final ProviderRepository providerRepository; // ajusta a tu repo real
    private final ProviderAvailabilityRuleRepository ruleRepository;
    private final ProviderAvailabilityExceptionRepository exceptionRepository;

    @Transactional
    public AvailabilityRuleResponse createRule(Long providerId, AvailabilityRuleCreateRequest req) {
        ProviderEntity provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider no existe"));

        validateTimeRange(req.startTime(), req.endTime());
        Short dayOfWeek = req.dayOfWeek().shortValue();

        // validación solapamiento contra reglas existentes (mismo día)
        List<ProviderAvailabilityRuleEntity> existing =
                ruleRepository.findByProvider_IdAndDayOfWeekAndActiveTrue(providerId, dayOfWeek);

        boolean overlaps = existing.stream().anyMatch(r ->
                req.startTime().isBefore(r.getEndTime()) && r.getStartTime().isBefore(req.endTime())
        );

        if (overlaps) {
            throw new AvailabilityConflictException("AVAILABILITY_RULE_OVERLAP: La regla se solapa con otra regla existente.");
        }

        OffsetDateTime now = OffsetDateTime.now();

        ProviderAvailabilityRuleEntity entity = ProviderAvailabilityRuleEntity.builder()
                .provider(provider)
                .dayOfWeek(dayOfWeek)
                .startTime(req.startTime())
                .endTime(req.endTime())
                .slotStepMin(req.slotStepMinutes())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        ProviderAvailabilityRuleEntity saved = ruleRepository.save(entity);
        return toRuleResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityRuleResponse> listRules(Long providerId) {
        return ruleRepository.findByProvider_IdAndActiveTrue(providerId)
                .stream().map(this::toRuleResponse).toList();
    }

    @Transactional
    public void deleteRule(Long providerId, Long ruleId) {
        ProviderAvailabilityRuleEntity rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule no existe"));

        if (!rule.getProvider().getId().equals(providerId)) {
            throw new IllegalArgumentException("Rule no pertenece a este provider");
        }

        rule.setActive(false);
        rule.setUpdatedAt(OffsetDateTime.now());
        ruleRepository.save(rule);
    }

    @Transactional
    public AvailabilityExceptionResponse createException(Long providerId, AvailabilityExceptionCreateRequest req) {
        ProviderEntity provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new IllegalArgumentException("Provider no existe"));

        validateDateTimeRange(req.startAt(), req.endAt());

        OffsetDateTime now = OffsetDateTime.now();

        ProviderAvailabilityExceptionEntity entity = ProviderAvailabilityExceptionEntity.builder()
                .provider(provider)
                .type(req.type())
                .startAt(req.startAt())
                .endAt(req.endAt())
                .reason(req.reason())
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        try {
            ProviderAvailabilityExceptionEntity saved = exceptionRepository.save(entity);
            return toExceptionResponse(saved);
        } catch (DataIntegrityViolationException ex) {
            // aquí cae el EXCLUDE constraint si hay solapamiento
            throw new AvailabilityConflictException("AVAILABILITY_EXCEPTION_OVERLAP: La excepción se solapa con otra excepción existente.");
        }
    }

    @Transactional(readOnly = true)
    public List<AvailabilityExceptionResponse> listExceptions(Long providerId, OffsetDateTime from, OffsetDateTime to) {
        return exceptionRepository.findActiveIntersecting(providerId, from, to)
                .stream().map(this::toExceptionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminAvailabilityExceptionResponse> listAllExceptions(Boolean active, OffsetDateTime from, OffsetDateTime to) {
        if (from != null && to != null) {
            validateDateTimeRange(from, to);
        }

        return exceptionRepository.findAllFiltered(active, from, to)
                .stream().map(this::toAdminExceptionResponse).toList();
    }

    // -------- helpers ----------
    private void validateTimeRange(java.time.LocalTime start, java.time.LocalTime end) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("startTime debe ser menor que endTime");
        }
    }

    private void validateDateTimeRange(OffsetDateTime start, OffsetDateTime end) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("startAt debe ser menor que endAt");
        }
    }

    private AvailabilityRuleResponse toRuleResponse(ProviderAvailabilityRuleEntity e) {
        return new AvailabilityRuleResponse(
                e.getId(),
                e.getDayOfWeek().intValue(),
                e.getStartTime(),
                e.getEndTime(),
                e.getSlotStepMin(),
                e.getActive()
        );
    }

    private AvailabilityExceptionResponse toExceptionResponse(ProviderAvailabilityExceptionEntity e) {
        return new AvailabilityExceptionResponse(
                e.getId(),
                e.getType(),
                e.getStartAt(),
                e.getEndAt(),
                e.getReason(),
                e.getActive()
        );
    }

    private AdminAvailabilityExceptionResponse toAdminExceptionResponse(ProviderAvailabilityExceptionEntity e) {
        return new AdminAvailabilityExceptionResponse(
                e.getId(),
                e.getProvider().getId(),
                e.getProvider().getName(),
                e.getType(),
                e.getStartAt(),
                e.getEndAt(),
                e.getReason(),
                e.getActive()
        );
    }
}
