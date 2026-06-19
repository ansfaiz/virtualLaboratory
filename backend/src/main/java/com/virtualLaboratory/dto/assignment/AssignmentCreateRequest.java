package com.virtualLaboratory.dto.assignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record AssignmentCreateRequest(
    @NotBlank String title,
    @NotBlank String description,
    String starterCode,
    @NotNull Long languageId,
    @NotEmpty List<Long> sectionIds,
    @NotNull LocalDateTime dueDate,
    Integer maxScore
) {
}
