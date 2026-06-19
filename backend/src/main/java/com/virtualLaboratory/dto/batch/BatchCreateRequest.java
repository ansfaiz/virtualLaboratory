package com.virtualLaboratory.dto.batch;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BatchCreateRequest(
    @NotBlank String name,
    @NotNull Integer year,
    @NotNull LocalDate startDate
) {
}
