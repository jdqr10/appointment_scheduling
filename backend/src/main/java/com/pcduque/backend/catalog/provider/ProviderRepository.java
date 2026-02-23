package com.pcduque.backend.catalog.provider;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderRepository extends JpaRepository<ProviderEntity, Long> {
  List<ProviderEntity> findByActiveTrue();
}