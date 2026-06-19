package com.virtualLaboratory.dto.user;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(
    @NotBlank String newPassword
) {
}
