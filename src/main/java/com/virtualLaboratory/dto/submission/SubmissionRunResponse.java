package com.virtualLaboratory.dto.submission;

public record SubmissionRunResponse(
    String stdout,
    String stderr,
    int exitCode,
    long executionMs
) {
}
