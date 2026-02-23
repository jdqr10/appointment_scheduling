package com.pcduque.backend.catalog.service;

import com.pcduque.backend.catalog.service.dto.CreateServiceRequest;
import com.pcduque.backend.catalog.service.dto.UpdateServiceRequest;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceCatalogService {

  private final ServiceRepository serviceRepository;

  public ServiceCatalogService(ServiceRepository serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  @Transactional(readOnly = true)
  public List<ServiceEntity> listActive() {
    return serviceRepository.findByActiveTrue();
  }

  @Transactional
  public ServiceEntity create(CreateServiceRequest req) {
    var s = new ServiceEntity();
    s.setName(req.name().trim());
    s.setDurationMinutes(req.durationMinutes());
    s.setActive(true);
    return serviceRepository.save(s);
  }

  @Transactional
  public ServiceEntity update(Long id, UpdateServiceRequest req) {
    var s = serviceRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Service not found: " + id));

    if (req.name() != null) s.setName(req.name().trim());
    if (req.durationMinutes() != null) s.setDurationMinutes(req.durationMinutes());
    if (req.active() != null) s.setActive(req.active());

    return serviceRepository.save(s);
  }
}