package com.virtualLaboratory.dto.submission;

import java.time.LocalDateTime;

public record SubmissionDTO(
    Long id,
    Long assignmentId,
    Long studentId,
    String code,
    LocalDateTime submitAt,
    Integer marks,
    String feedback,
    String status,
    String stdout,
    String stderr,
    Integer exitCode,
    Long executionMs
) {
}
