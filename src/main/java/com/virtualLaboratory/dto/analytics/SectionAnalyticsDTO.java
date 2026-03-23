package com.virtualLaboratory.dto.analytics;

import java.util.List;

public record SectionAnalyticsDTO(
    long sectionId,
    Double completionRate,
    List<Long> topStudentIds,
    List<Integer> scoreHistogram,
    List<String> languageUsage
) {
}
