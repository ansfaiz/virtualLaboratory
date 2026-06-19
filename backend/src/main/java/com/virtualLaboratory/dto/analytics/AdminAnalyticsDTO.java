package com.virtualLaboratory.dto.analytics;

public record AdminAnalyticsDTO(
    long totalUsers,
    long totalTeachers,
    long totalStudents,
    long totalBatches,
    long totalSections,
    long totalLanguages,
    long totalSubmissions
) {
}
