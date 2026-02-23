package com.pcduque.backend.catalog;

import com.pcduque.backend.catalog.mapper.CatalogMapper;
import com.pcduque.backend.catalog.provider.ProviderCatalogService;
import com.pcduque.backend.catalog.provider.dto.ProviderResponse;
import com.pcduque.backend.catalog.provider.dto.ProviderServiceResponse;
import com.pcduque.backend.catalog.service.ServiceCatalogService;
import com.pcduque.backend.catalog.service.dto.ServiceResponse;
import io.swagger.v3.oas.annotations.Operation;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class CatalogPublicController {

  private final ServiceCatalogService serviceCatalogService;
  private final ProviderCatalogService providerCatalogService;

  public CatalogPublicController(ServiceCatalogService serviceCatalogService,
                                 ProviderCatalogService providerCatalogService) {
    this.serviceCatalogService = serviceCatalogService;
    this.providerCatalogService = providerCatalogService;
  }

  // PUBLIC: lista servicios activos
  @GetMapping("/services")
  @Operation(summary = "List active services", security = {})
  public List<ServiceResponse> listServices() {
    return serviceCatalogService.listActive().stream()
        .map(CatalogMapper::toResponse)
        .toList();
  }

  // PUBLIC: lista providers activos
  @GetMapping("/providers")
  @Operation(summary = "List active providers", security = {})
  public List<ProviderResponse> listProviders() {
    return providerCatalogService.listActive().stream()
        .map(CatalogMapper::toResponse)
        .toList();
  }

  // PUBLIC: lista servicios activos de un provider
  @GetMapping("/providers/{providerId}/services")
  @Operation(summary = "List active services for provider", security = {})
  public List<ProviderServiceResponse> listProviderServices(@PathVariable Long providerId) {
    return providerCatalogService.listProviderActiveServices(providerId).stream()
        .map(CatalogMapper::toProviderServiceResponse)
        .toList();
  }
}
