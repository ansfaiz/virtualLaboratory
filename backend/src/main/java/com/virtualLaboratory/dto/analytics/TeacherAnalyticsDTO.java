package com.virtualLaboratory.dto.analytics;

import java.util.List;

public record TeacherAnalyticsDTO(
    long assignmentCount,
    long submissionCount,
    long pendingGrade,
    Double avgScore,
    List<Integer> scoreDistribution
) {
}
