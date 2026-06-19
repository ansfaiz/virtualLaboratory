package com.virtualLaboratory.mapper;

import com.virtualLaboratory.dto.user.UserCreateRequest;
import com.virtualLaboratory.dto.user.UserDTO;
import com.virtualLaboratory.dto.user.UserUpdateRequest;
import com.virtualLaboratory.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(UserCreateRequest request, String encodedPassword, User.Role role) {
        User user = new User();
        user.setFullName(request.name());
        user.setEmail(request.email());
        user.setPassword(encodedPassword);
        user.setRole(role);
        user.setActive(true);
        user.setUsername(request.email());
        return user;
    }

    public void updateEntity(User user, UserUpdateRequest request, User.Role role) {
        if (request.name() != null) {
            user.setFullName(request.name());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
            user.setUsername(request.email());
        }
        if (role != null) {
            user.setRole(role);
        }
    }

    public UserDTO toDto(User user, Long batchId) {
        return new UserDTO(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole() != null ? user.getRole().name() : null,
            batchId
        );
    }
}
