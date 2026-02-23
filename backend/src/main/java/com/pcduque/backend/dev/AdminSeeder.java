package com.pcduque.backend.dev;

import com.pcduque.backend.user.*;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;

@Component
@Profile("dev")
public class AdminSeeder implements CommandLineRunner {

  private final UserRepository userRepository;
  private final PasswordEncoder encoder;

  public AdminSeeder(UserRepository userRepository, PasswordEncoder encoder) {
    this.userRepository = userRepository;
    this.encoder = encoder;
  }

  @Override
  public void run(String... args) {
    String email = "admin@test.com";

    if (userRepository.existsByEmail(email)) return;

    var admin = new User();
    admin.setEmail(email);
    admin.setFullName("Admin");
    admin.setRole(Role.ADMIN);
    admin.setPasswordHash(encoder.encode("Admin123*"));

    userRepository.save(admin);
  }
}