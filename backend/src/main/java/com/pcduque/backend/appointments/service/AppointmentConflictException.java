package com.pcduque.backend.appointments.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class AppointmentConflictException extends ResponseStatusException {
  public AppointmentConflictException(String message) {
    super(HttpStatus.CONFLICT, message);
  }
}