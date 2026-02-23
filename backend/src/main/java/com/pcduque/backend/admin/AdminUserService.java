package com.pcduque.backend.admin;

import com.pcduque.backend.admin.dto.AdminUserListItemResponse;
import com.pcduque.backend.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

  private final UserRepository userRepository;

  public AdminUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<AdminUserListItemResponse> listUsers() {
    return userRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(user -> new AdminUserListItemResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getCreatedAt()
        ))
        .toList();
  }
}
