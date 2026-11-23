package com.virtualLaboratory.dto.analytics;

import java.util.List;

public record SectionAnalyticsDTO(
    long sectionId,
    Double completionRate,
    List<Long> topStudentIds,
    List<ScoreHistogramBucket> scoreHistogram,
    List<LanguageUsageStat> languageUsage
) {

    public record ScoreHistogramBucket(
        String bucket,
        long count
    ) {}

    public record LanguageUsageStat(
        Long languageId,
        Long count
    ) {}
}