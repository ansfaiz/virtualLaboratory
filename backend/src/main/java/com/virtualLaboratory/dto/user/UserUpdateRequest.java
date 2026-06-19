package com.virtualLaboratory.dto.user;

import jakarta.validation.constraints.Email;

public record UserUpdateRequest(
    String name,
    @Email String email,
    String role,
    Long batchId
) {
}
