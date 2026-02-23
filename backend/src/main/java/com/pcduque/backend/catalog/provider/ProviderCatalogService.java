package com.pcduque.backend.catalog.provider;

import com.pcduque.backend.catalog.provider.dto.AssignServicesRequest;
import com.pcduque.backend.catalog.provider.dto.CreateProviderRequest;
import com.pcduque.backend.catalog.provider.dto.UpdateProviderRequest;
import com.pcduque.backend.catalog.service.ServiceEntity;
import com.pcduque.backend.catalog.service.ServiceRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProviderCatalogService {

  private final ProviderRepository providerRepository;
  private final ServiceRepository serviceRepository;

  public ProviderCatalogService(ProviderRepository providerRepository, ServiceRepository serviceRepository) {
    this.providerRepository = providerRepository;
    this.serviceRepository = serviceRepository;
  }

  @Transactional(readOnly = true)
  public List<ProviderEntity> listActive() {
    return providerRepository.findByActiveTrue();
  }

  @Transactional
  public ProviderEntity create(CreateProviderRequest req) {
    var p = new ProviderEntity();
    p.setName(req.name().trim());
    p.setActive(true);
    return providerRepository.save(p);
  }

  @Transactional
  public ProviderEntity update(Long id, UpdateProviderRequest req) {
    var p = providerRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Provider not found: " + id));

    if (req.name() != null) p.setName(req.name().trim());
    if (req.active() != null) p.setActive(req.active());

    return providerRepository.save(p);
  }

  @Transactional
  public void assignServices(Long providerId, AssignServicesRequest req) {
    var provider = providerRepository.findById(providerId)
        .orElseThrow(() -> new EntityNotFoundException("Provider not found: " + providerId));

    Set<Long> ids = req.serviceIds();

    List<ServiceEntity> services = serviceRepository.findAllById(ids);

    // Validación: si algún id no existe, devolvemos error
    if (services.size() != ids.size()) {
      Set<Long> foundIds = services.stream().map(ServiceEntity::getId).collect(Collectors.toSet());
      Set<Long> missing = ids.stream().filter(x -> !foundIds.contains(x)).collect(Collectors.toSet());
      throw new IllegalArgumentException("Service IDs not found: " + missing);
    }

    provider.getServices().clear();
    provider.getServices().addAll(services);
    providerRepository.save(provider);
  }

  @Transactional(readOnly = true)
  public List<ServiceEntity> listProviderActiveServices(Long providerId) {
    var provider = providerRepository.findById(providerId)
        .orElseThrow(() -> new EntityNotFoundException("Provider not found: " + providerId));

    //Solo activos
    return provider.getServices().stream()
        .filter(s -> Boolean.TRUE.equals(s.getActive()))
        .toList();
  }
}