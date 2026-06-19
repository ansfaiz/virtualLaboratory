package com.virtualLaboratory.dto.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmissionCreateRequest(
    @NotNull Long assignmentId,
    @NotBlank String code,
    @NotNull Long languageId
) {
}
