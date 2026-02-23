package com.pcduque.backend.catalog;

import com.pcduque.backend.catalog.mapper.CatalogMapper;
import com.pcduque.backend.catalog.provider.ProviderCatalogService;
import com.pcduque.backend.catalog.provider.dto.*;
import com.pcduque.backend.catalog.service.ServiceCatalogService;
import com.pcduque.backend.catalog.service.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/catalog")
@SecurityRequirement(name = "bearerAuth")
public class CatalogAdminController {

  private final ServiceCatalogService serviceCatalogService;
  private final ProviderCatalogService providerCatalogService;

  public CatalogAdminController(ServiceCatalogService serviceCatalogService,
                                ProviderCatalogService providerCatalogService) {
    this.serviceCatalogService = serviceCatalogService;
    this.providerCatalogService = providerCatalogService;
  }

  // ---- SERVICES ----
  @PostMapping("/services")
  @Operation(summary = "Create catalog service")
  public ServiceResponse createService(@Valid @RequestBody CreateServiceRequest req) {
    return CatalogMapper.toResponse(serviceCatalogService.create(req));
  }

  @PatchMapping("/services/{id}")
  @Operation(summary = "Update catalog service")
  public ServiceResponse updateService(@PathVariable Long id, @Valid @RequestBody UpdateServiceRequest req) {
    return CatalogMapper.toResponse(serviceCatalogService.update(id, req));
  }

  // ---- PROVIDERS ----
  @PostMapping("/providers")
  @Operation(summary = "Create provider")
  public ProviderResponse createProvider(@Valid @RequestBody CreateProviderRequest req) {
    return CatalogMapper.toResponse(providerCatalogService.create(req));
  }

  @PatchMapping("/providers/{id}")
  @Operation(summary = "Update provider")
  public ProviderResponse updateProvider(@PathVariable Long id, @Valid @RequestBody UpdateProviderRequest req) {
    return CatalogMapper.toResponse(providerCatalogService.update(id, req));
  }

  @PutMapping("/providers/{id}/services")
  @Operation(summary = "Assign services to provider")
  public void assignServices(@PathVariable Long id, @Valid @RequestBody AssignServicesRequest req) {
    providerCatalogService.assignServices(id, req);
  }
}
