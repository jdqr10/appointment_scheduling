package com.pcduque.backend.catalog.mapper;

import com.pcduque.backend.catalog.provider.ProviderEntity;
import com.pcduque.backend.catalog.provider.dto.ProviderResponse;
import com.pcduque.backend.catalog.provider.dto.ProviderServiceResponse;
import com.pcduque.backend.catalog.service.ServiceEntity;
import com.pcduque.backend.catalog.service.dto.ServiceResponse;

public class CatalogMapper {

    private CatalogMapper() {
    }

    public static ServiceResponse toResponse(ServiceEntity s) {
        return new ServiceResponse(s.getId(), s.getName(), s.getDurationMinutes(), s.getActive());
    }

    public static ProviderResponse toResponse(ProviderEntity p) {
        return new ProviderResponse(p.getId(), p.getName(), p.getActive());
    }

    public static ProviderServiceResponse toProviderServiceResponse(ServiceEntity s) {
        return new ProviderServiceResponse(s.getId(), s.getName(), s.getDurationMinutes());
    }

}
