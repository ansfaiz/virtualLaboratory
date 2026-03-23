package com.virtualLaboratory.dto.section;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SectionCreateRequest(
    @NotBlank String name,
    @NotNull Long batchId,
    @NotNull Long teacherId
) {
}
