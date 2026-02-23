package com.pcduque.backend.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import com.pcduque.backend.user.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final JwtProperties props;
  private final SecretKey key;

  public JwtService(JwtProperties props) {
    this.props = props;
    String secret = props.secret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException("JWT secret is missing. Define app.jwt.secret or JWT_SECRET.");
    }
    if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
      throw new IllegalStateException("JWT secret must be at least 32 bytes for HS256.");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String generateToken(String email, Role role) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds((long) props.expMinutes() * 60);

    return Jwts.builder()
        .issuer(props.issuer())
        .subject(email)
        .claim("role", role.name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public Jws<Claims> parseAndValidate(String token) {
    JwtParser parser = Jwts.parser()
        .verifyWith(key)
        .requireIssuer(props.issuer())
        .build();

    return parser.parseSignedClaims(token);
  }

  public String extractEmail(String token) {
    return parseAndValidate(token).getPayload().getSubject();
  }

  public Role extractRole(String token) {
    String role = parseAndValidate(token).getPayload().get("role", String.class);
    return Role.valueOf(role);
  }
}
