package com.virtualLaboratory.dto.auth;

import com.virtualLaboratory.dto.user.UserDTO;

public record LoginResponse(
    UserDTO user,
    String token
) {
}
