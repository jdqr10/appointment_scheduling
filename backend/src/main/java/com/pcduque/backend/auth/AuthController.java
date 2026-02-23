package com.pcduque.backend.auth;

import com.pcduque.backend.auth.dto.*;
import com.pcduque.backend.security.JwtProperties;
import com.pcduque.backend.user.UserRepository;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;
  private final JwtProperties jwtProps;
  private final UserRepository userRepository;

  public AuthController(AuthService authService, JwtProperties jwtProps, UserRepository userRepository) {
    this.authService = authService;
    this.jwtProps = jwtProps;
    this.userRepository = userRepository;
  }

  @PostMapping("/register")
  @Operation(summary = "Register a new user", security = {})
  public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
    return authService.register(req, jwtProps.expMinutes());
  }

  @PostMapping("/login")
  @Operation(summary = "Authenticate user and return JWT", security = {})
  public AuthResponse login(@Valid @RequestBody LoginRequest req) {
    return authService.login(req, jwtProps.expMinutes());
  }

  @GetMapping("/me")
  @Operation(summary = "Get current authenticated user", security = @SecurityRequirement(name = "bearerAuth"))
  public MeResponse me(Authentication authentication) {
    // authentication.getName() = email (username)
    String email = authentication.getName();
    var user = userRepository.findByEmail(email).orElseThrow();
    return new MeResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
  }
}
