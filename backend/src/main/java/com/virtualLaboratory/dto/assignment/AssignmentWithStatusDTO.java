package com.virtualLaboratory.dto.assignment;

import java.time.LocalDateTime;
import java.util.List;

public record AssignmentWithStatusDTO(
    Long id,
    String title,
    String description,
    String starterCode,
    Long languageId,
    List<Long> sectionIds,
    LocalDateTime dueDate,
    Integer maxScore,
    String status,
    Long teacherId,
    String submissionStatus
) {
}
