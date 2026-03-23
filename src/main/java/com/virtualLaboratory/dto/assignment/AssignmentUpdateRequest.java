package com.virtualLaboratory.dto.assignment;

import java.time.LocalDateTime;

public record AssignmentUpdateRequest(
    String title,
    String description,
    String starterCode,
    LocalDateTime dueDate,
    Integer maxScore
) {
}
