package com.pcduque.backend.availability.repository;

import com.pcduque.backend.availability.entity.ProviderAvailabilityRuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProviderAvailabilityRuleRepository extends JpaRepository<ProviderAvailabilityRuleEntity, Long> {

    List<ProviderAvailabilityRuleEntity> findByProvider_IdAndActiveTrue(Long providerId);

    List<ProviderAvailabilityRuleEntity> findByProvider_IdAndDayOfWeekAndActiveTrue(Long providerId, Short dayOfWeek);
}
