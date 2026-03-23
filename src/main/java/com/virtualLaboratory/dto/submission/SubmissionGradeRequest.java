package com.virtualLaboratory.dto.submission;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SubmissionGradeRequest(
    @NotNull @Min(0) Integer score,
    String feedback
) {
}
