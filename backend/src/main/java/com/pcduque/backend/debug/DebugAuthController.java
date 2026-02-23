package com.pcduque.backend.debug;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugAuthController {

  @GetMapping("/debug/auth")
  public Map<String, Object> auth(Authentication auth) {
    return Map.of(
        "name", auth.getName(),
        "authorities", auth.getAuthorities()
    );
  }
}