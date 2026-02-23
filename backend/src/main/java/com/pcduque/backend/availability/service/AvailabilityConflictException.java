package com.pcduque.backend.availability.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class AvailabilityConflictException extends ResponseStatusException {
    public AvailabilityConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}