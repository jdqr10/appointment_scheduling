package com.pcduque.backend.catalog.provider;

import com.pcduque.backend.catalog.service.ServiceEntity;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "providers")
public class ProviderEntity {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(nullable = false)
  private Boolean active = true;

  @Column(name = "created_at", nullable = false)
  private OffsetDateTime createdAt;

  @ManyToMany
  @JoinTable(
      name = "provider_services",
      joinColumns = @JoinColumn(name = "provider_id"),
      inverseJoinColumns = @JoinColumn(name = "service_id")
  )
  private Set<ServiceEntity> services = new HashSet<>();

  @PrePersist
  void onCreate() {
    if (createdAt == null) createdAt = OffsetDateTime.now();
    if (active == null) active = true;
  }

  // getters/setters
  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public Boolean getActive() { return active; }
  public void setActive(Boolean active) { this.active = active; }
  public OffsetDateTime getCreatedAt() { return createdAt; }
  public Set<ServiceEntity> getServices() { return services; }
  public void setServices(Set<ServiceEntity> services) { this.services = services; }
}