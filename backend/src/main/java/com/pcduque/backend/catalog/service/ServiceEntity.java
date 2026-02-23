package com.pcduque.backend.catalog.service;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "services")
public class ServiceEntity {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(name = "duration_minutes", nullable = false)
  private Integer durationMinutes;

  @Column(nullable = false)
  private Boolean active = true;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @PrePersist
  void onCreate() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
    if (active == null) active = true;
  }

  // getters/setters
  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public Integer getDurationMinutes() { return durationMinutes; }
  public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
  public Boolean getActive() { return active; }
  public void setActive(Boolean active) { this.active = active; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
}