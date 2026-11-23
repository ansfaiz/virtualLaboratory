package com.virtualLaboratory.dto.language;

public record LanguageUpdateRequest(
    String version,
    Boolean active,
    String icon,
    Integer judge0LanguageId
) {
}
