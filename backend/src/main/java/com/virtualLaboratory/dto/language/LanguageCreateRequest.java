package com.virtualLaboratory.dto.language;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LanguageCreateRequest(
    @NotBlank String name,
    @NotBlank String version,
    @NotBlank String extension,
    boolean active,
    String icon
) {
}
