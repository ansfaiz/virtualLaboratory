package com.virtualLaboratory.dto.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmissionRunRequest(
    @NotBlank String code,
    @NotNull Long languageId,
    String stdin
) {
}
