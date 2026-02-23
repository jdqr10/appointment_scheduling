package com.pcduque.backend.availability.repository;

import com.pcduque.backend.availability.entity.ProviderAvailabilityExceptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;

public interface ProviderAvailabilityExceptionRepository extends JpaRepository<ProviderAvailabilityExceptionEntity, Long> {

    @Query("""
        SELECT e
        FROM ProviderAvailabilityExceptionEntity e
        WHERE e.provider.id = :providerId
          AND e.active = true
          AND e.startAt < :to
          AND e.endAt > :from
        """)
    List<ProviderAvailabilityExceptionEntity> findActiveIntersecting(Long providerId, OffsetDateTime from, OffsetDateTime to);

    @Query("""
        SELECT e
        FROM ProviderAvailabilityExceptionEntity e
        WHERE (:active IS NULL OR e.active = :active)
          AND (:from IS NULL OR e.endAt > :from)
          AND (:to IS NULL OR e.startAt < :to)
        ORDER BY e.startAt DESC, e.id DESC
        """)
    List<ProviderAvailabilityExceptionEntity> findAllFiltered(Boolean active, OffsetDateTime from, OffsetDateTime to);
}
