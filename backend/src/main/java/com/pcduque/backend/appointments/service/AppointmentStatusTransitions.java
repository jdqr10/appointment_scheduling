package com.pcduque.backend.appointments.service;

import java.util.EnumSet;
import java.util.Set;

import com.pcduque.backend.appointments.model.AppointmentStatus;

public final class AppointmentStatusTransitions {

    private AppointmentStatusTransitions() {}
    
    public static boolean canTransition(AppointmentStatus from, AppointmentStatus to){
        return allowedTo(from).contains(to);
    }

    private static Set<AppointmentStatus> allowedTo(AppointmentStatus from) {
    return switch (from) {
      case PENDING -> EnumSet.of(AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED);
      case CONFIRMED -> EnumSet.of(AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED);
      case CANCELLED -> EnumSet.noneOf(AppointmentStatus.class);
      case COMPLETED -> EnumSet.noneOf(AppointmentStatus.class);
    };
  }
}
