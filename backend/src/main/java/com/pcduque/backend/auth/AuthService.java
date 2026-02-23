package com.pcduque.backend.auth;

import com.pcduque.backend.auth.dto.*;
import com.pcduque.backend.security.JwtService;
import com.pcduque.backend.user.*;

import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager,
      JwtService jwtService
  ) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  public AuthResponse register(RegisterRequest req, int expMinutes) {
    String email = req.email().trim().toLowerCase();

    if (userRepository.existsByEmail(email)) {
      throw new IllegalArgumentException("Email already registered");
    }

    var user = new User();
    user.setEmail(email);
    user.setFullName(req.fullName());
    user.setRole(Role.CLIENT);
    user.setPasswordHash(passwordEncoder.encode(req.password()));

    userRepository.save(user);

    String token = jwtService.generateToken(user.getEmail(), user.getRole());
    return new AuthResponse(token, "Bearer", expMinutes * 60L);
  }

  public AuthResponse login(LoginRequest req, int expMinutes) {
    String email = req.email().trim().toLowerCase();

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, req.password())
    );

    var user = userRepository.findByEmail(email).orElseThrow();
    String token = jwtService.generateToken(user.getEmail(), user.getRole());
    return new AuthResponse(token, "Bearer", expMinutes * 60L);
  }
}
