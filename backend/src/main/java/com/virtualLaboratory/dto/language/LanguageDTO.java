package com.virtualLaboratory.dto.language;

public record LanguageDTO(
    Long id,
    String name,
    String version,
    String extension,
    String icon,
    boolean active
) {
}
