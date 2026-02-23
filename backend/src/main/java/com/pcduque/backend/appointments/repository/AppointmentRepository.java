package com.pcduque.backend.appointments.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.pcduque.backend.appointments.entity.AppointmentEntity;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long> {
    
    List<AppointmentEntity> findByUser_IdOrderByStartAtDesc(Long userId);

    @Query("""
        SELECT a
        FROM AppointmentEntity a
        WHERE a.provider.id = :providerId
          AND a.status <> 'CANCELLED'
          AND a.startAt < :to
          AND a.endAt > :from
        ORDER BY a.startAt
    """)
    List<AppointmentEntity> findActiveIntersectingByProvider(Long providerId, OffsetDateTime from, OffsetDateTime to);
}
