package com.virtualLaboratory.dto.user;

public record UserDTO(
    Long id,
    String name,
    String email,
    String role,
    Long batchId
) {
}
