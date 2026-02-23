package com.pcduque.backend.admin;

import com.pcduque.backend.admin.dto.AdminUserListItemResponse;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

  private final AdminUserService adminUserService;

  public AdminController(AdminUserService adminUserService) {
    this.adminUserService = adminUserService;
  }

  @GetMapping("/ping")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Admin health check")
  public String ping() {
    return "pong";
  }

  @GetMapping("/users")
  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "List all registered users (admin only)")
  public List<AdminUserListItemResponse> listUsers() {
    return adminUserService.listUsers();
  }
}
