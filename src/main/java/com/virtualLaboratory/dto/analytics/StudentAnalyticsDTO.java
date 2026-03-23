package com.virtualLaboratory.dto.analytics;

public record StudentAnalyticsDTO(
    long pending,
    long submitted,
    long graded,
    Double avgScore,
    long streak,
    long rank
) {
}
