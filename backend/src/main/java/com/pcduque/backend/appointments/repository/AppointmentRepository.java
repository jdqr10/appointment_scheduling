package com.pcduque.backend.appointments.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

  @Query("""
        SELECT a
        FROM AppointmentEntity a
        WHERE a.provider.id = :providerId
          AND a.status IN ('PENDING','CONFIRMED')
          AND a.startAt < :to
          AND a.endAt > :from
        ORDER BY a.startAt
      """)
  List<AppointmentEntity> findBlockingIntersectingByProvider(Long providerId, OffsetDateTime from, OffsetDateTime to);

  @Query("""
        SELECT a
        FROM AppointmentEntity a
        WHERE a.provider.id = :providerId
          AND a.startAt < :to
          AND a.endAt > :from
        ORDER BY a.startAt
      """)
  List<AppointmentEntity> findByProviderAndRange(
      @Param("providerId") Long providerId,
      @Param("from") OffsetDateTime from,
      @Param("to") OffsetDateTime to);

  @Query("""
        SELECT a
        FROM AppointmentEntity a
        WHERE a.user.id = :userId
          AND a.startAt < :to
          AND a.endAt > :from
        ORDER BY a.startAt DESC
      """)
  List<AppointmentEntity> findByUserAndRange(
      @Param("userId") Long userId,
      @Param("from") OffsetDateTime from,
      @Param("to") OffsetDateTime to);
}
